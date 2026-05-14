const attendanceService = require('../services/attendance.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const checkIn = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.checkIn(req.user._id);
  sendSuccess(res, 'Checked in successfully', attendance, 201);
});

const checkOut = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.checkOut(req.user._id);
  sendSuccess(res, 'Checked out successfully', attendance);
});

const getTodayAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getTodayAttendance(req.user._id);
  sendSuccess(res, 'Today attendance fetched', attendance);
});

const getHistory = asyncHandler(async (req, res) => {
  const { records, pagination } = await attendanceService.getHistory(req.user._id, req.query);
  sendPaginated(res, 'Attendance history fetched', records, pagination);
});

const getMonthlyAttendance = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const result = await attendanceService.getMonthlyAttendance(req.user._id, year, month);
  sendSuccess(res, 'Monthly attendance fetched', result);
});

const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const { records, pagination } = await attendanceService.getEmployeeAttendance(
    req.params.employeeId,
    req.query
  );
  sendPaginated(res, 'Employee attendance fetched', records, pagination);
});

const markAbsent = asyncHandler(async (req, res) => {
  const result = await attendanceService.markAbsent(req.body.date);
  sendSuccess(res, `Marked ${result.marked} employees as absent`, result);
});

const getPendingApprovals = asyncHandler(async (req, res) => {
  const { records, pagination } = await attendanceService.getPendingApprovals(
    req.user.role,
    req.user._id,
    req.query
  );
  sendPaginated(res, 'Pending approvals fetched', records, pagination);
});

const approveAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.approveAttendance(
    req.params.attendanceId,
    req.user._id,
    req.user.role
  );
  sendSuccess(res, 'Attendance approved successfully', attendance);
});

const rejectAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.rejectAttendance(
    req.params.attendanceId,
    req.user._id,
    req.user.role,
    req.body.rejectionReason
  );
  sendSuccess(res, 'Attendance rejected successfully', attendance);
});

const getAllUsersAttendance = asyncHandler(async (req, res) => {
  const { records, pagination } = await attendanceService.getAllUsersAttendance(req.query);
  sendPaginated(res, 'All users attendance fetched', records, pagination);
});

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getHistory,
  getMonthlyAttendance,
  getEmployeeAttendance,
  markAbsent,
  getPendingApprovals,
  approveAttendance,
  rejectAttendance,
  getAllUsersAttendance,
};
