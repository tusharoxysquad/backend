const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendPaginated } = require('../utils/response');

const getDailyReport = asyncHandler(async (req, res) => {
  const { records, pagination } = await reportService.getDailyReport(req.query);
  sendPaginated(res, 'Daily report fetched', records, pagination);
});

const getWeeklyReport = asyncHandler(async (req, res) => {
  const { records, pagination } = await reportService.getWeeklyReport(req.query);
  sendPaginated(res, 'Weekly report fetched', records, pagination);
});

const getMonthlyReport = asyncHandler(async (req, res) => {
  const { records, pagination } = await reportService.getMonthlyReport(req.query);
  sendPaginated(res, 'Monthly report fetched', records, pagination);
});

const getEarlyExitsReport = asyncHandler(async (req, res) => {
  const { records, pagination } = await reportService.getEarlyExitsReport(req.query);
  sendPaginated(res, 'Early exits report fetched', records, pagination);
});

const getAbsentEmployeesReport = asyncHandler(async (req, res) => {
  const { records, pagination } = await reportService.getAbsentEmployeesReport(req.query);
  sendPaginated(res, 'Absent employees report fetched', records, pagination);
});

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getEarlyExitsReport,
  getAbsentEmployeesReport,
};
