const userService = require('../services/user.service');
const attendanceService = require('../services/attendance.service');
const leaveService = require('../services/leave.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { ROLES } = require('../constants');

const getAllEmployees = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllByRole(ROLES.EMPLOYEE, req.query);
  sendPaginated(res, 'Employees fetched', users, pagination);
});

const getTeamEmployees = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getTeamEmployees(req.user._id, req.query);
  sendPaginated(res, 'Team employees fetched', users, pagination);
});

const getTeamAttendance = asyncHandler(async (req, res) => {
  const { records, pagination } = await attendanceService.getPendingApprovals(
    req.user.role,
    req.user._id,
    req.query
  );
  sendPaginated(res, 'Team attendance fetched', records, pagination);
});

const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const { records, pagination } = await attendanceService.getEmployeeAttendance(
    req.params.employeeId,
    req.query
  );
  sendPaginated(res, 'Employee attendance fetched', records, pagination);
});

const getPendingLeaves = asyncHandler(async (req, res) => {
  const { leaves, pagination } = await leaveService.getPendingLeaves(req.user._id, req.user.role, req.query);
  sendPaginated(res, 'Pending leaves fetched', leaves, pagination);
});

const approveLeave = asyncHandler(async (req, res) => {
  const leave = await leaveService.approveLeave(req.params.leaveId, req.user._id, req.user.role);
  sendSuccess(res, 'Leave approved successfully', leave);
});

const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await leaveService.rejectLeave(
    req.params.leaveId,
    req.user._id,
    req.user.role,
    req.body.rejectionReason
  );
  sendSuccess(res, 'Leave rejected successfully', leave);
});

module.exports = {
  getAllEmployees,
  getTeamEmployees,
  getTeamAttendance,
  getEmployeeAttendance,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
};
