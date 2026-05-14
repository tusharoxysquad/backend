const leaveService = require('../services/leave.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const applyLeave = asyncHandler(async (req, res) => {
  const leave = await leaveService.applyLeave(req.user._id, req.body);
  sendSuccess(res, 'Leave applied successfully', leave, 201);
});

const getMyLeaves = asyncHandler(async (req, res) => {
  const { leaves, pagination } = await leaveService.getMyLeaves(req.user._id, req.query);
  sendPaginated(res, 'Leaves fetched', leaves, pagination);
});

const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await leaveService.getLeaveById(req.params.leaveId, req.user._id, req.user.role);
  sendSuccess(res, 'Leave fetched', leave);
});

const cancelLeave = asyncHandler(async (req, res) => {
  const leave = await leaveService.cancelLeave(req.params.leaveId, req.user._id);
  sendSuccess(res, 'Leave cancelled successfully', leave);
});

const getAllLeaves = asyncHandler(async (req, res) => {
  const { leaves, pagination } = await leaveService.getAllLeaves(
    req.user._id,
    req.user.role,
    req.query
  );
  sendPaginated(res, 'All leaves fetched', leaves, pagination);
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

module.exports = { applyLeave, getMyLeaves, getLeaveById, cancelLeave, getAllLeaves, approveLeave, rejectLeave };
