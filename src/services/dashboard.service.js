const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const { ROLES, ATTENDANCE_STATUS, APPROVAL_STATUS, LEAVE_STATUS } = require('../constants');
const { toDateString, getMonthRange, getWeekRange, getWorkingDaysInMonth } = require('../utils/dateHelper');

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Format minutes into "Xh Ym" or "0h 0m"
const fmtHours = (totalHours) => {
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  return `${h}h ${m}m`;
};

// Format Date to "09:07 AM"
const fmtTime = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// Count working days between two dates (Mon–Fri) inclusive
const countWorkingDaysBetween = (from, to) => {
  let count = 0;
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

// Get all weekend date strings in a month
const getWeekendsInMonth = (year, month) => {
  const totalDays = new Date(year, month, 0).getDate();
  const weekends = [];
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month - 1, d);
    if (date.getDay() === 0 || date.getDay() === 6) {
      weekends.push(toDateString(date));
    }
  }
  return weekends;
};

const getSuperAdminDashboard = async () => {
  const today = toDateString();
  const now = new Date();
  const { start, end } = getMonthRange(now.getFullYear(), now.getMonth() + 1);
  const monthStart = toDateString(start);
  const monthEnd = toDateString(end);

  const [
    totalAdmins,
    totalEmployees,
    activeUsers,
    todayPresent,
    todayAbsent,
    pendingAttendance,
    pendingLeaves,
    monthlyAttendance,
  ] = await Promise.all([
    User.countDocuments({ role: ROLES.ADMIN }),
    User.countDocuments({ role: ROLES.EMPLOYEE }),
    User.countDocuments({ isActive: true }),
    Attendance.countDocuments({ date: today, attendanceStatus: ATTENDANCE_STATUS.PRESENT }),
    Attendance.countDocuments({ date: today, attendanceStatus: ATTENDANCE_STATUS.ABSENT }),
    Attendance.countDocuments({ approvalStatus: APPROVAL_STATUS.PENDING }),
    Leave.countDocuments({ status: LEAVE_STATUS.PENDING }),
    Attendance.countDocuments({ date: { $gte: monthStart, $lte: monthEnd } }),
  ]);

  return {
    users: { totalAdmins, totalEmployees, activeUsers },
    today: { present: todayPresent, absent: todayAbsent },
    pending: { attendance: pendingAttendance, leaves: pendingLeaves },
    monthlyAttendance,
  };
};

const getAdminDashboard = async (adminId) => {
  const today = toDateString();

  const teamMembers = await User.find({ reportingAdmin: adminId, role: ROLES.EMPLOYEE }).select('_id');
  const teamIds = teamMembers.map((u) => u._id);

  const [totalTeam, todayPresent, todayAbsent, pendingLeaves, pendingAttendance] = await Promise.all([
    User.countDocuments({ reportingAdmin: adminId, role: ROLES.EMPLOYEE }),
    Attendance.countDocuments({ employeeId: { $in: teamIds }, date: today, attendanceStatus: ATTENDANCE_STATUS.PRESENT }),
    Attendance.countDocuments({ employeeId: { $in: teamIds }, date: today, attendanceStatus: ATTENDANCE_STATUS.ABSENT }),
    Leave.countDocuments({ employeeId: { $in: teamIds }, status: LEAVE_STATUS.PENDING }),
    Attendance.countDocuments({ employeeId: { $in: teamIds }, approvalStatus: APPROVAL_STATUS.PENDING }),
  ]);

  return {
    team: { total: totalTeam },
    today: { present: todayPresent, absent: todayAbsent },
    pending: { leaves: pendingLeaves, attendance: pendingAttendance },
  };
};

const getEmployeeDashboard = async (employeeId) => {
  const now = new Date();
  const today = toDateString(now);
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { start: monthStart, end: monthEnd } = getMonthRange(year, month);
  const { start: weekStart, end: weekEnd } = getWeekRange(now);
  const monthStartStr = toDateString(monthStart);
  const monthEndStr = toDateString(monthEnd);
  const weekStartStr = toDateString(weekStart);
  const weekEndStr = toDateString(weekEnd);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateString(yesterday);

  const [
    employee,
    todayAttendance,
    yesterdayAttendance,
    monthlyRecords,
    weeklyRecords,
    recentLeaves,
    approvedLeavesThisMonth,
    upcomingHolidays,
    monthlyHolidays,
  ] = await Promise.all([
    User.findById(employeeId).select('name email role department designation').lean(),
    Attendance.findOne({ employeeId, date: today }).lean(),
    Attendance.findOne({ employeeId, date: yesterdayStr }).lean(),
    Attendance.find({ employeeId, date: { $gte: monthStartStr, $lte: monthEndStr } }).lean(),
    Attendance.find({ employeeId, date: { $gte: weekStartStr, $lte: weekEndStr } }).lean(),
    Leave.find({ employeeId }).sort({ createdAt: -1 }).limit(4).lean(),
    Leave.find({
      employeeId,
      status: LEAVE_STATUS.APPROVED,
      fromDate: { $lte: monthEnd },
      toDate: { $gte: monthStart },
    }).lean(),
    Holiday.find({ date: { $gt: today } }).sort({ date: 1 }).limit(4).lean(),
    Holiday.find({ year, month }).lean(),
  ]);

  // ── Attendance Overview ──────────────────────────────────────────────────────
  let currentStatus = 'NOT_CHECKED_IN';
  if (todayAttendance?.checkInTime && !todayAttendance?.checkOutTime) currentStatus = 'CHECKED_IN';
  else if (todayAttendance?.checkOutTime) currentStatus = 'CHECKED_OUT';
  else if (todayAttendance?.attendanceStatus === ATTENDANCE_STATUS.ABSENT) currentStatus = 'ABSENT';

  const todayWorkedHours = todayAttendance?.totalWorkedHours
    ? fmtHours(todayAttendance.totalWorkedHours)
    : todayAttendance?.checkInTime
    ? fmtHours((now - new Date(todayAttendance.checkInTime)) / (1000 * 60 * 60))
    : '0h 0m';

  const attendanceOverview = {
    currentStatus,
    checkInTime: fmtTime(todayAttendance?.checkInTime),
    checkOutTime: fmtTime(todayAttendance?.checkOutTime),
    todayWorkedHours,
    yesterdayWorkedHours: fmtHours(yesterdayAttendance?.totalWorkedHours || 0),
    shiftTiming: '10:00 AM - 7:00 PM',
    lateArrival: todayAttendance?.lateArrival || false,
  };

  // ── Statistics ───────────────────────────────────────────────────────────────
  // Calculate today's actual worked hours as a number for statistics
  const todayHoursRaw = todayAttendance?.totalWorkedHours
    ? todayAttendance.totalWorkedHours
    : todayAttendance?.checkInTime
    ? (now - new Date(todayAttendance.checkInTime)) / (1000 * 60 * 60)
    : 0;

  // Weekly hours: only approved records for past days + live hours for today's open session
  const weeklyHours = weeklyRecords.reduce((sum, r) => {
    if (r.date === today) return sum + todayHoursRaw;
    if (r.approvalStatus !== APPROVAL_STATUS.APPROVED) return sum;
    return sum + (r.totalWorkedHours || 0);
  }, todayAttendance && !weeklyRecords.find((r) => r.date === today) ? todayHoursRaw : 0);

  const workingDays = getWorkingDaysInMonth(year, month);
  const presentDays = monthlyRecords.filter((r) => r.approvalStatus === APPROVAL_STATUS.APPROVED && r.attendanceStatus === ATTENDANCE_STATUS.PRESENT).length;
  const halfDays = monthlyRecords.filter((r) => r.approvalStatus === APPROVAL_STATUS.APPROVED && r.attendanceStatus === ATTENDANCE_STATUS.HALF_DAY).length;
  const attendanceRate = workingDays > 0
    ? parseFloat((((presentDays + halfDays) / workingDays) * 100).toFixed(1))
    : 0;

  // Leave balance: deduct approved leave days from annual total of 12
  const usedLeaves = approvedLeavesThisMonth.reduce((sum, l) => {
    return sum + countWorkingDaysBetween(l.fromDate, l.toDate);
  }, 0);

  const DAILY_SHIFT_HOURS = 9;

  const statistics = {
    todayHours: {
      value: fmtHours(todayHoursRaw),
      target: fmtHours(DAILY_SHIFT_HOURS),
    },
    thisWeekHours: {
      value: fmtHours(weeklyHours),
      target: fmtHours(DAILY_SHIFT_HOURS * 5),
    },
    attendanceRate: {
      value: attendanceRate,
      present: presentDays,
      workingDays,
    },
    leaveBalance: {
      used: usedLeaves,
      remaining: Math.max(0, 12 - usedLeaves),
      total: 12,
    },
  };

  // ── Attendance Calendar ──────────────────────────────────────────────────────
  const presentDaysList = monthlyRecords
    .filter((r) => r.approvalStatus === APPROVAL_STATUS.APPROVED && r.attendanceStatus === ATTENDANCE_STATUS.PRESENT)
    .map((r) => r.date);
  const absentDaysList = monthlyRecords
    .filter((r) => r.attendanceStatus === ATTENDANCE_STATUS.ABSENT)
    .map((r) => r.date);
  const lateDaysList = monthlyRecords
    .filter((r) => r.approvalStatus === APPROVAL_STATUS.APPROVED && r.lateArrival)
    .map((r) => r.date);
  const leaveDaysList = approvedLeavesThisMonth.flatMap((l) => {
    const days = [];
    const cur = new Date(l.fromDate);
    const end = new Date(l.toDate);
    while (cur <= end) {
      days.push(toDateString(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  });
  const holidayDatesList = monthlyHolidays.map((h) => h.date);
  const weekendsList = getWeekendsInMonth(year, month);

  const attendanceCalendar = {
    month: MONTH_NAMES[month - 1],
    year,
    presentDays: presentDaysList,
    absentDays: absentDaysList,
    lateDays: lateDaysList,
    leaveDays: leaveDaysList,
    holidays: holidayDatesList,
    weekends: weekendsList,
  };

  // ── Recent Leaves ────────────────────────────────────────────────────────────
  const formattedLeaves = recentLeaves.map((l) => ({
    _id: l._id,
    leaveType: l.leaveType,
    session: l.session,
    fromDate: toDateString(new Date(l.fromDate)),
    toDate: toDateString(new Date(l.toDate)),
    days: countWorkingDaysBetween(l.fromDate, l.toDate),
    status: l.status,
  }));

  // ── Upcoming Holidays ────────────────────────────────────────────────────────
  const formattedHolidays = upcomingHolidays.map((h) => {
    const holidayDate = new Date(h.date);
    const diffMs = holidayDate.setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return {
      _id: h._id,
      date: h.date,
      day: holidayDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      month: MONTH_NAMES[h.month - 1],
      title: h.title,
      type: h.type,
      remainingDays,
    };
  });

  return {
    employee: {
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      profileImage: null,
    },
    attendanceOverview,
    statistics,
    attendanceCalendar,
    recentLeaves: formattedLeaves,
    upcomingHolidays: formattedHolidays,
  };
};

module.exports = { getSuperAdminDashboard, getAdminDashboard, getEmployeeDashboard };
