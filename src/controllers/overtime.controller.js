const overtimeService = require('../services/overtime.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const overtimeCheckIn = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.overtimeCheckIn(req.user._id, req.body);
  sendSuccess(res, 'Overtime check-in successful', overtime, 201);
});

const overtimeCheckOut = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.overtimeCheckOut(req.user._id);
  sendSuccess(res, 'Overtime check-out successful', overtime);
});

const getMyOvertime = asyncHandler(async (req, res) => {
  const { records, pagination } = await overtimeService.getMyOvertime(req.user._id, req.query);
  sendPaginated(res, 'Overtime records fetched', records, pagination);
});

const getAllOvertime = asyncHandler(async (req, res) => {
  const { records, pagination } = await overtimeService.getAllOvertime(
    req.user.role,
    req.user._id,
    req.query
  );
  sendPaginated(res, 'All overtime records fetched', records, pagination);
});

const approveOvertime = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.approveOvertime(req.params.id, req.user._id, req.user.role);
  sendSuccess(res, 'Overtime approved successfully', overtime);
});

const rejectOvertime = asyncHandler(async (req, res) => {
  const overtime = await overtimeService.rejectOvertime(
    req.params.id,
    req.user._id,
    req.user.role,
    req.body.rejectionReason
  );
  sendSuccess(res, 'Overtime rejected successfully', overtime);
});

module.exports = { overtimeCheckIn, overtimeCheckOut, getMyOvertime, getAllOvertime, approveOvertime, rejectOvertime };
