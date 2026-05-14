const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { ATTENDANCE_STATUS, APPROVAL_STATUS, ROLES, SHIFT_HOURS } = require('../constants');
const { toDateString, calcHours, getWorkingDaysInMonth } = require('../utils/dateHelper');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { notify } = require('../helpers/notification.helper');

const checkIn = async (employeeId) => {
  const today = toDateString();

  const existing = await Attendance.findOne({ employeeId, date: today });
  if (existing) throw ApiError.conflict('Attendance already marked for today');

  const user = await User.findById(employeeId);

  // Super Admin attendance is auto-approved
  const approvalStatus =
    user.role === ROLES.SUPER_ADMIN ? APPROVAL_STATUS.APPROVED : APPROVAL_STATUS.PENDING;

  const checkInTime = new Date();
  const hours = checkInTime.getHours();
  const minutes = checkInTime.getMinutes();
  const lateArrival = hours > 10 || (hours === 10 && minutes > 5);

  const attendance = await Attendance.create({
    employeeId,
    date: today,
    checkInTime,
    attendanceStatus: ATTENDANCE_STATUS.PRESENT,
    approvalStatus,
    lateArrival,
    ...(user.role === ROLES.SUPER_ADMIN && { approvedBy: employeeId, approvedAt: new Date() }),
  });

  return attendance;
};

const checkOut = async (employeeId) => {
  const today = toDateString();

  const attendance = await Attendance.findOne({ employeeId, date: today });
  if (!attendance) throw ApiError.notFound('No check-in found for today');
  if (attendance.checkOutTime) throw ApiError.conflict('Already checked out for today');

  const checkOutTime = new Date();
  const totalWorkedHours = calcHours(attendance.checkInTime, checkOutTime);
  const earlyExit = totalWorkedHours < SHIFT_HOURS;

  attendance.checkOutTime = checkOutTime;
  attendance.totalWorkedHours = totalWorkedHours;
  attendance.earlyExit = earlyExit;
  await attendance.save();

  return attendance;
};

const getTodayAttendance = async (employeeId) => {
  const today = toDateString();
  const attendance = await Attendance.findOne({ employeeId, date: today });
  if (!attendance) throw ApiError.notFound('No attendance record for today');
  return attendance;
};

const getHistory = async (employeeId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { employeeId };

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  } else if (query.month && query.year) {
    const year = parseInt(query.year);
    const month = parseInt(query.month);
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-31`;
    filter.date = { $gte: start, $lte: end };
  }

  if (query.status) filter.attendanceStatus = query.status;
  if (query.approvalStatus) filter.approvalStatus = query.approvalStatus;

  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

const getMonthlyAttendance = async (employeeId, year, month) => {
  const y = parseInt(year) || new Date().getFullYear();
  const m = parseInt(month) || new Date().getMonth() + 1;
  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const end = `${y}-${String(m).padStart(2, '0')}-31`;

  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);

  const [records, leaves] = await Promise.all([
    Attendance.find({ employeeId, date: { $gte: start, $lte: end } }).sort({ date: 1 }),
    Leave.find({
      employeeId,
      status: 'APPROVED',
      fromDate: { $lte: monthEnd },
      toDate: { $gte: monthStart },
    }),
  ]);

  const workingDays = getWorkingDaysInMonth(y, m);

  // Count leave days that fall on working days within the month
  let totalLeaveDays = 0;
  for (const leave of leaves) {
    const leaveStart = new Date(Math.max(leave.fromDate, monthStart));
    const leaveEnd = new Date(Math.min(leave.toDate, monthEnd));
    for (let d = new Date(leaveStart); d <= leaveEnd; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) totalLeaveDays++;
    }
  }

  const present = records.filter((r) => r.attendanceStatus === ATTENDANCE_STATUS.PRESENT).length;
  const absent = records.filter((r) => r.attendanceStatus === ATTENDANCE_STATUS.ABSENT).length;
  const halfDay = records.filter((r) => r.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY).length;
  const lateArrivals = records.filter((r) => r.lateArrival).length;
  const attendanceDays = present + halfDay;
  const attendancePercentage = workingDays > 0
    ? parseFloat(((attendanceDays / workingDays) * 100).toFixed(2))
    : 0;

  const summary = {
    workingDays,
    present,
    absent,
    halfDay,
    lateArrivals,
    totalLeaveDays,
    earlyExits: records.filter((r) => r.earlyExit).length,
    totalWorkedHours: parseFloat(records.reduce((sum, r) => sum + (r.totalWorkedHours || 0), 0).toFixed(2)),
    attendancePercentage,
  };

  return { records, summary };
};

const getEmployeeAttendance = async (employeeId, query) => {
  return getHistory(employeeId, query);
};

const getPendingApprovals = async (approverRole, approverId, query) => {
  const { page, limit, skip } = getPagination(query);

  let employeeIds;
  if (approverRole === ROLES.ADMIN) {
    const teamMembers = await User.find({ reportingAdmin: approverId }).select('_id');
    employeeIds = teamMembers.map((u) => u._id);
  }

  const filter = { approvalStatus: APPROVAL_STATUS.PENDING };
  if (approverRole === ROLES.ADMIN) {
    filter.employeeId = { $in: employeeIds };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('employeeId', 'name email department designation')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

const approveAttendance = async (attendanceId, approverId, approverRole) => {
  const attendance = await Attendance.findById(attendanceId).populate('employeeId', 'role reportingAdmin');
  if (!attendance) throw ApiError.notFound('Attendance record not found');
  if (attendance.approvalStatus !== APPROVAL_STATUS.PENDING) {
    throw ApiError.badRequest('Attendance is not in pending state');
  }

  // Admin can only approve their team employees
  if (approverRole === ROLES.ADMIN) {
    const employee = attendance.employeeId;
    if (employee.role === ROLES.ADMIN || employee.role === ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden('Admins cannot approve Admin/Super Admin attendance');
    }
    if (String(employee.reportingAdmin) !== String(approverId)) {
      throw ApiError.forbidden('You can only approve attendance for your team members');
    }
  }

  attendance.approvalStatus = APPROVAL_STATUS.APPROVED;
  attendance.approvedBy = approverId;
  attendance.approvedAt = new Date();
  await attendance.save();

  await notify(
    attendance.employeeId._id,
    'Attendance Approved',
    `Your attendance for ${attendance.date} has been approved.`
  );

  return attendance;
};

const rejectAttendance = async (attendanceId, approverId, approverRole, rejectionReason) => {
  const attendance = await Attendance.findById(attendanceId).populate('employeeId', 'role reportingAdmin');
  if (!attendance) throw ApiError.notFound('Attendance record not found');
  if (attendance.approvalStatus !== APPROVAL_STATUS.PENDING) {
    throw ApiError.badRequest('Attendance is not in pending state');
  }

  if (approverRole === ROLES.ADMIN) {
    const employee = attendance.employeeId;
    if (String(employee.reportingAdmin) !== String(approverId)) {
      throw ApiError.forbidden('You can only reject attendance for your team members');
    }
  }

  attendance.approvalStatus = APPROVAL_STATUS.REJECTED;
  attendance.approvedBy = approverId;
  attendance.approvedAt = new Date();
  attendance.rejectionReason = rejectionReason;
  await attendance.save();

  await notify(
    attendance.employeeId._id,
    'Attendance Rejected',
    `Your attendance for ${attendance.date} was rejected. Reason: ${rejectionReason}`
  );

  return attendance;
};

const getAllUsersAttendance = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  } else if (query.month && query.year) {
    const year = parseInt(query.year);
    const month = parseInt(query.month);
    filter.date = {
      $gte: `${year}-${String(month).padStart(2, '0')}-01`,
      $lte: `${year}-${String(month).padStart(2, '0')}-31`,
    };
  }

  if (query.status) filter.attendanceStatus = query.status;
  if (query.approvalStatus) filter.approvalStatus = query.approvalStatus;
  if (query.employeeId) filter.employeeId = query.employeeId;

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('employeeId', 'name email department designation role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

const markAbsent = async (date) => {
  const targetDate = date || toDateString();

  // Get all active employees
  const employees = await User.find({ isActive: true, role: { $in: [ROLES.EMPLOYEE, ROLES.ADMIN] } }).select('_id');

  const presentIds = await Attendance.distinct('employeeId', { date: targetDate });
  const presentSet = new Set(presentIds.map(String));

  const absentEmployees = employees.filter((e) => !presentSet.has(String(e._id)));

  if (absentEmployees.length === 0) return { marked: 0 };

  const absentRecords = absentEmployees.map((e) => ({
    employeeId: e._id,
    date: targetDate,
    attendanceStatus: ATTENDANCE_STATUS.ABSENT,
    approvalStatus: APPROVAL_STATUS.APPROVED,
  }));

  const result = await Attendance.insertMany(absentRecords, { ordered: false });
  return { marked: result.length };
};

/**
 * Auto checkout — finds all records for today that have checkInTime
 * but no checkOutTime, and closes them at the time this job runs.
 * Sets autoEnded = true so it's distinguishable from manual checkouts.
 */
const autoCheckout = async () => {
  const today = toDateString();

  // Find all checked-in but not checked-out records for today
  const openRecords = await Attendance.find({
    date: today,
    checkInTime: { $ne: null },
    checkOutTime: null,
    attendanceStatus: { $ne: ATTENDANCE_STATUS.ABSENT },
  });

  if (openRecords.length === 0) return { processed: 0 };

  const checkOutTime = new Date();
  let processed = 0;

  for (const record of openRecords) {
    const totalWorkedHours = calcHours(record.checkInTime, checkOutTime);
    const earlyExit = totalWorkedHours < SHIFT_HOURS;

    record.checkOutTime = checkOutTime;
    record.totalWorkedHours = totalWorkedHours;
    record.earlyExit = earlyExit;
    record.autoEnded = true;
    await record.save();

    // Notify the employee their checkout was auto-processed
    await notify(
      record.employeeId,
      'Auto Checkout',
      `You forgot to check out. Your attendance for ${today} has been automatically closed. Total hours: ${totalWorkedHours}.`
    );

    processed++;
  }

  return { processed };
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getHistory,
  getMonthlyAttendance,
  getEmployeeAttendance,
  getPendingApprovals,
  approveAttendance,
  rejectAttendance,
  markAbsent,
  autoCheckout,
  getAllUsersAttendance,
};
