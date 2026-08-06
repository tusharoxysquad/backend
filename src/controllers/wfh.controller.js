const wfhService = require('../services/wfh.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const applyWfh = asyncHandler(async (req, res) => {
  const wfh = await wfhService.applyWfh(req.user._id, req.body);
  sendSuccess(res, 'WFH request submitted successfully', wfh, 201);
});

const getMyWfhRequests = asyncHandler(async (req, res) => {
  const { requests, pagination } = await wfhService.getMyWfhRequests(req.user._id, req.query);
  sendPaginated(res, 'WFH requests fetched', requests, pagination);
});

const getAllWfhRequests = asyncHandler(async (req, res) => {
  const { requests, pagination } = await wfhService.getAllWfhRequests(
    req.user._id,
    req.user.role,
    req.query
  );
  sendPaginated(res, 'All WFH requests fetched', requests, pagination);
});

const cancelWfh = asyncHandler(async (req, res) => {
  const wfh = await wfhService.cancelWfh(req.params.wfhId, req.user._id);
  sendSuccess(res, 'WFH request cancelled', wfh);
});

const approveWfh = asyncHandler(async (req, res) => {
  const wfh = await wfhService.approveWfh(req.params.wfhId, req.user._id, req.user.role);
  sendSuccess(res, 'WFH request approved', wfh);
});

const rejectWfh = asyncHandler(async (req, res) => {
  const wfh = await wfhService.rejectWfh(
    req.params.wfhId,
    req.user._id,
    req.user.role,
    req.body.rejectionReason
  );
  sendSuccess(res, 'WFH request rejected', wfh);
});

module.exports = { applyWfh, getMyWfhRequests, getAllWfhRequests, cancelWfh, approveWfh, rejectWfh };
