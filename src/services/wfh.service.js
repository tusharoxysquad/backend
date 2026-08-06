const WfhRequest = require('../models/WfhRequest');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { ROLES } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { notify } = require('../helpers/notification.helper');

const WFH_STATUS = { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED', CANCELLED: 'CANCELLED' };

const applyWfh = async (employeeId, { fromDate, toDate, reason }) => {
  if (new Date(toDate) < new Date(fromDate)) {
    throw ApiError.badRequest('toDate cannot be before fromDate');
  }

  const wfh = await WfhRequest.create({ employeeId, fromDate, toDate, reason });

  const populated = await WfhRequest.findById(wfh._id).populate(
    'employeeId', 'name email department designation'
  );

  // Notify all super-admins
  const superAdmins = await User.find({ role: ROLES.SUPER_ADMIN }).select('_id');
  const employee = await User.findById(employeeId).select('name');
  await Promise.all(
    superAdmins.map((sa) =>
      notify(sa._id, 'New WFH Request', `${employee.name} has applied for Work From Home.`)
    )
  );

  return populated;
};

const getMyWfhRequests = async (employeeId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { employeeId };
  if (query.status) filter.status = query.status;

  const [requests, total] = await Promise.all([
    WfhRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    WfhRequest.countDocuments(filter),
  ]);

  return { requests, pagination: buildPaginationMeta(total, page, limit) };
};

const getAllWfhRequests = async (requesterId, requesterRole, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  // Admin sees only their team's requests
  if (requesterRole === ROLES.ADMIN) {
    const teamMembers = await User.find({ reportingAdmin: requesterId }).select('_id');
    filter.employeeId = { $in: teamMembers.map((u) => u._id) };
  }

  if (query.status) filter.status = query.status;
  if (query.employeeId) filter.employeeId = query.employeeId;

  const [requests, total] = await Promise.all([
    WfhRequest.find(filter)
      .populate('employeeId', 'name email department designation')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WfhRequest.countDocuments(filter),
  ]);

  return { requests, pagination: buildPaginationMeta(total, page, limit) };
};

const cancelWfh = async (wfhId, employeeId) => {
  const wfh = await WfhRequest.findOne({ _id: wfhId, employeeId });
  if (!wfh) throw ApiError.notFound('WFH request not found');
  if (wfh.status !== WFH_STATUS.PENDING) {
    throw ApiError.badRequest('Only pending WFH requests can be cancelled');
  }
  wfh.status = WFH_STATUS.CANCELLED;
  await wfh.save();
  return wfh;
};

const approveWfh = async (wfhId, approverId, approverRole) => {
  if (approverRole !== ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Only Super Admin can approve WFH requests');
  }

  const wfh = await WfhRequest.findById(wfhId).populate('employeeId', 'name _id');
  if (!wfh) throw ApiError.notFound('WFH request not found');
  if (wfh.status !== WFH_STATUS.PENDING) throw ApiError.badRequest('WFH request is not pending');

  wfh.status = WFH_STATUS.APPROVED;
  wfh.approvedBy = approverId;
  wfh.approvedAt = new Date();
  await wfh.save();

  await notify(wfh.employeeId._id, 'WFH Approved', 'Your Work From Home request has been approved.');

  return wfh;
};

const rejectWfh = async (wfhId, approverId, approverRole, rejectionReason) => {
  if (approverRole !== ROLES.SUPER_ADMIN) {
    throw ApiError.forbidden('Only Super Admin can reject WFH requests');
  }

  const wfh = await WfhRequest.findById(wfhId).populate('employeeId', 'name _id');
  if (!wfh) throw ApiError.notFound('WFH request not found');
  if (wfh.status !== WFH_STATUS.PENDING) throw ApiError.badRequest('WFH request is not pending');

  wfh.status = WFH_STATUS.REJECTED;
  wfh.approvedBy = approverId;
  wfh.approvedAt = new Date();
  wfh.rejectionReason = rejectionReason;
  await wfh.save();

  await notify(
    wfh.employeeId._id,
    'WFH Rejected',
    `Your Work From Home request was rejected. Reason: ${rejectionReason}`
  );

  return wfh;
};

module.exports = { applyWfh, getMyWfhRequests, getAllWfhRequests, cancelWfh, approveWfh, rejectWfh };
