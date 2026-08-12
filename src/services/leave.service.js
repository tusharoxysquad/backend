const Leave = require('../models/Leave');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const { LEAVE_STATUS, ROLES } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { notify } = require('../helpers/notification.helper');

const applyLeave = async (employeeId, leaveData) => {
  const { leaveType, session, fromDate, toDate, reason } = leaveData;

  if (new Date(toDate) < new Date(fromDate)) {
    throw ApiError.badRequest('toDate cannot be before fromDate');
  }

  const leave = await Leave.create({ employeeId, leaveType, session, fromDate, toDate, reason });

  const populated = await Leave.findById(leave._id).populate(
    'employeeId',
    'name email department designation role'
  );

  const employee = await User.findById(employeeId).populate('reportingAdmin', '_id');
  if (employee?.reportingAdmin) {
    await notify(
      employee.reportingAdmin._id,
      'New Leave Request',
      `${employee.name} has applied for ${leaveType} leave (${session}).`
    );
  }

  return populated;
};

const getMyLeaves = async (employeeId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { employeeId };
  if (query.status) filter.status = query.status;
  if (query.leaveType) filter.leaveType = query.leaveType;

  const [leaves, total] = await Promise.all([
    Leave.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Leave.countDocuments(filter),
  ]);

  return { leaves, pagination: buildPaginationMeta(total, page, limit) };
};

const getLeaveById = async (leaveId, requesterId, requesterRole) => {
  const leave = await Leave.findById(leaveId)
    .populate('employeeId', 'name email department')
    .populate('approvedBy', 'name email');
  if (!leave) throw ApiError.notFound('Leave not found');

  if (requesterRole === ROLES.EMPLOYEE && String(leave.employeeId._id) !== String(requesterId)) {
    throw ApiError.forbidden('Access denied');
  }

  return leave;
};

const cancelLeave = async (leaveId, employeeId) => {
  const leave = await Leave.findOne({ _id: leaveId, employeeId });
  if (!leave) throw ApiError.notFound('Leave not found');
  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw ApiError.badRequest('Only pending leaves can be cancelled');
  }

  leave.status = LEAVE_STATUS.CANCELLED;
  await leave.save();
  return leave;
};

const getAllLeaves = async (requesterId, requesterRole, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (requesterRole === ROLES.ADMIN) {
    const teamMembers = await User.find({ reportingAdmin: requesterId }).select('_id');
    filter.employeeId = { $in: teamMembers.map((u) => u._id) };
  } else if (requesterRole === ROLES.SUPER_ADMIN && query.adminId) {
    // Super admin filtering by a specific admin's team
    const teamMembers = await User.find({ reportingAdmin: query.adminId }).select('_id');
    filter.employeeId = { $in: teamMembers.map((u) => u._id) };
  }

  if (query.status) filter.status = query.status;
  if (query.leaveType) filter.leaveType = query.leaveType;
  if (query.employeeId) filter.employeeId = query.employeeId;

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('employeeId', 'name email department designation')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);

  return { leaves, pagination: buildPaginationMeta(total, page, limit) };
};

const getPendingLeaves = async (adminId, adminRole, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { status: LEAVE_STATUS.PENDING };

  if (adminRole === ROLES.ADMIN) {
    const teamMembers = await User.find({ reportingAdmin: adminId }).select('_id');
    if (teamMembers.length === 0) return { leaves: [], pagination: buildPaginationMeta(0, 1, 10) };
    filter.employeeId = { $in: teamMembers.map((u) => u._id) };
  }

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate('employeeId', 'name email department designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);

  return { leaves, pagination: buildPaginationMeta(total, page, limit) };
};

const approveLeave = async (leaveId, approverId, approverRole) => {
  const leave = await Leave.findById(leaveId).populate('employeeId', 'reportingAdmin name role');
  if (!leave) throw ApiError.notFound('Leave not found');
  if (leave.status !== LEAVE_STATUS.PENDING) throw ApiError.badRequest('Leave is not pending');

  if (approverRole === ROLES.ADMIN) {
    const reportingAdminId = leave.employeeId?.reportingAdmin;
    if (!reportingAdminId || String(reportingAdminId) !== String(approverId)) {
      throw ApiError.forbidden('You can only approve leaves for your team members');
    }
  }

  leave.status = LEAVE_STATUS.APPROVED;
  leave.approvedBy = approverId;
  leave.approvedAt = new Date();
  await leave.save();

  await notify(
    leave.employeeId._id,
    'Leave Approved',
    `Your ${leave.leaveType} leave has been approved.`
  );

  return leave;
};

const rejectLeave = async (leaveId, approverId, approverRole, rejectionReason) => {
  const leave = await Leave.findById(leaveId).populate('employeeId', 'reportingAdmin name role');
  if (!leave) throw ApiError.notFound('Leave not found');
  if (leave.status !== LEAVE_STATUS.PENDING) throw ApiError.badRequest('Leave is not pending');

  if (approverRole === ROLES.ADMIN) {
    const reportingAdminId = leave.employeeId?.reportingAdmin;
    if (!reportingAdminId || String(reportingAdminId) !== String(approverId)) {
      throw ApiError.forbidden('You can only reject leaves for your team members');
    }
  }

  leave.status = LEAVE_STATUS.REJECTED;
  leave.approvedBy = approverId;
  leave.approvedAt = new Date();
  leave.rejectionReason = rejectionReason;
  await leave.save();

  await notify(
    leave.employeeId._id,
    'Leave Rejected',
    `Your ${leave.leaveType} leave was rejected. Reason: ${rejectionReason}`
  );

  return leave;
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  cancelLeave,
  getAllLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
};
