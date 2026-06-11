const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const superAdminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSuperAdminDashboard();
  sendSuccess(res, 'Super admin dashboard fetched', data);
});

const adminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard(req.user._id);
  sendSuccess(res, 'Admin dashboard fetched', data);
});

const employeeDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getEmployeeDashboard(req.user._id);
  sendSuccess(res, 'Employee dashboard fetched successfully', data);
});

module.exports = { superAdminDashboard, adminDashboard, employeeDashboard };
