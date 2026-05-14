const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const { ROLES, ATTENDANCE_STATUS, APPROVAL_STATUS, LEAVE_STATUS } = require('../constants');
const { toDateString, getMonthRange } = require('../utils/dateHelper');

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
  const today = toDateString();
  const now = new Date();
  const { start, end } = getMonthRange(now.getFullYear(), now.getMonth() + 1);
  const monthStart = toDateString(start);
  const monthEnd = toDateString(end);

  const [todayAttendance, monthlyPresent, monthlyAbsent, pendingLeaves, approvedLeaves] = await Promise.all([
    Attendance.findOne({ employeeId, date: today }),
    Attendance.countDocuments({ employeeId, date: { $gte: monthStart, $lte: monthEnd }, attendanceStatus: ATTENDANCE_STATUS.PRESENT }),
    Attendance.countDocuments({ employeeId, date: { $gte: monthStart, $lte: monthEnd }, attendanceStatus: ATTENDANCE_STATUS.ABSENT }),
    Leave.countDocuments({ employeeId, status: LEAVE_STATUS.PENDING }),
    Leave.countDocuments({ employeeId, status: LEAVE_STATUS.APPROVED }),
  ]);

  return {
    today: todayAttendance,
    monthly: { present: monthlyPresent, absent: monthlyAbsent },
    leaves: { pending: pendingLeaves, approved: approvedLeaves },
  };
};

module.exports = { getSuperAdminDashboard, getAdminDashboard, getEmployeeDashboard };
