const Overtime = require('../models/Overtime');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { APPROVAL_STATUS, ROLES, SHIFT_HOURS } = require('../constants');
const { toDateString, calcHours } = require('../utils/dateHelper');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { notify } = require('../helpers/notification.helper');

// EMPLOYEE & ADMIN only — starts overtime session after completing 9hr shift
const overtimeCheckIn = async (employeeId, { reason }) => {
  const today = toDateString();

  const attendance = await Attendance.findOne({ employeeId, date: today });
  if (!attendance) throw ApiError.notFound('No attendance record found for today');
  if (!attendance.checkOutTime) throw ApiError.badRequest('You must complete your regular shift (check out) before starting overtime');
  if (attendance.totalWorkedHours < SHIFT_HOURS) {
    throw ApiError.badRequest(
      `Overtime requires completing ${SHIFT_HOURS} hours first. You worked ${attendance.totalWorkedHours} hours.`
    );
  }

  const existing = await Overtime.findOne({ employeeId, date: today });
  if (existing) throw ApiError.conflict('Overtime session already started for today');

  const overtime = await Overtime.create({
    employeeId,
    attendanceId: attendance._id,
    date: today,
    reason,
    overtimeCheckIn: new Date(),
  });

  return overtime;
};

// EMPLOYEE & ADMIN only — ends overtime session and calculates duration
const overtimeCheckOut = async (employeeId) => {
  const today = toDateString();

  const overtime = await Overtime.findOne({ employeeId, date: today });
  if (!overtime) throw ApiError.notFound('No overtime session found for today');
  if (!overtime.overtimeCheckIn) throw ApiError.badRequest('Overtime check-in not found');
  if (overtime.overtimeCheckOut) throw ApiError.conflict('Already checked out of overtime for today');

  const overtimeCheckOut = new Date();
  const overtimeDuration = calcHours(overtime.overtimeCheckIn, overtimeCheckOut);

  overtime.overtimeCheckOut = overtimeCheckOut;
  overtime.overtimeDuration = overtimeDuration;
  await overtime.save();

  return overtime;
};

const getMyOvertime = async (employeeId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { employeeId };
  if (query.status) filter.status = query.status;

  const [records, total] = await Promise.all([
    Overtime.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Overtime.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

const getAllOvertime = async (reviewerRole, reviewerId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  // ADMIN sees only their team's overtime
  if (reviewerRole === ROLES.ADMIN) {
    const teamMembers = await User.find({ reportingAdmin: reviewerId }).select('_id');
    filter.employeeId = { $in: teamMembers.map((u) => u._id) };
  }

  if (query.status) filter.status = query.status;
  if (query.date) filter.date = query.date;

  const [records, total] = await Promise.all([
    Overtime.find(filter)
      .populate('employeeId', 'name email department designation')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Overtime.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

// ADMIN approves EMPLOYEE overtime; SUPER_ADMIN approves both EMPLOYEE & ADMIN overtime
const approveOvertime = async (overtimeId, reviewerId, reviewerRole) => {
  const overtime = await Overtime.findById(overtimeId).populate('employeeId', 'role reportingAdmin');
  if (!overtime) throw ApiError.notFound('Overtime record not found');
  if (!overtime.overtimeCheckOut) throw ApiError.badRequest('Cannot approve overtime before check-out');
  if (overtime.status !== APPROVAL_STATUS.PENDING) throw ApiError.badRequest('Overtime is not in pending state');

  const employeeRole = overtime.employeeId.role;

  // ADMIN cannot approve another ADMIN's or SUPER_ADMIN's overtime
  if (reviewerRole === ROLES.ADMIN) {
    if (employeeRole === ROLES.ADMIN || employeeRole === ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden('Admins can only approve Employee overtime');
    }
    if (String(overtime.employeeId.reportingAdmin) !== String(reviewerId)) {
      throw ApiError.forbidden('You can only approve overtime for your own team members');
    }
  }

  overtime.status = APPROVAL_STATUS.APPROVED;
  overtime.reviewedBy = reviewerId;
  overtime.reviewedAt = new Date();
  await overtime.save();

  await notify(
    overtime.employeeId._id,
    'Overtime Approved',
    `Your overtime of ${overtime.overtimeDuration} hours on ${overtime.date} has been approved.`
  );

  return overtime;
};

const rejectOvertime = async (overtimeId, reviewerId, reviewerRole, rejectionReason) => {
  const overtime = await Overtime.findById(overtimeId).populate('employeeId', 'role reportingAdmin');
  if (!overtime) throw ApiError.notFound('Overtime record not found');
  if (overtime.status !== APPROVAL_STATUS.PENDING) throw ApiError.badRequest('Overtime is not in pending state');

  if (reviewerRole === ROLES.ADMIN) {
    if (overtime.employeeId.role === ROLES.ADMIN || overtime.employeeId.role === ROLES.SUPER_ADMIN) {
      throw ApiError.forbidden('Admins can only reject Employee overtime');
    }
    if (String(overtime.employeeId.reportingAdmin) !== String(reviewerId)) {
      throw ApiError.forbidden('You can only reject overtime for your own team members');
    }
  }

  overtime.status = APPROVAL_STATUS.REJECTED;
  overtime.reviewedBy = reviewerId;
  overtime.reviewedAt = new Date();
  overtime.rejectionReason = rejectionReason;
  await overtime.save();

  await notify(
    overtime.employeeId._id,
    'Overtime Rejected',
    `Your overtime request for ${overtime.date} was rejected. Reason: ${rejectionReason}`
  );

  return overtime;
};

module.exports = { overtimeCheckIn, overtimeCheckOut, getMyOvertime, getAllOvertime, approveOvertime, rejectOvertime };
