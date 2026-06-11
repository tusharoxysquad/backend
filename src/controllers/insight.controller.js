const insightService = require('../services/insight.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const createInsight = asyncHandler(async (req, res) => {
  const insight = await insightService.createInsight(req.body, req.file, req.user?._id);
  sendSuccess(res, 'Insight created successfully', insight, 201);
});

const getAllInsights = asyncHandler(async (req, res) => {
  const { data, pagination } = await insightService.getAllInsights(req.query);
  sendPaginated(res, 'Insights fetched successfully', data, pagination);
});

const getInsightById = asyncHandler(async (req, res) => {
  const insight = await insightService.getInsightById(req.params.id);
  sendSuccess(res, 'Insight fetched successfully', insight);
});

const updateInsight = asyncHandler(async (req, res) => {
  const insight = await insightService.updateInsight(req.params.id, req.body, req.file, req.user?._id);
  sendSuccess(res, 'Insight updated successfully', insight);
});

const deleteInsight = asyncHandler(async (req, res) => {
  await insightService.deleteInsight(req.params.id);
  sendSuccess(res, 'Insight deleted successfully');
});

module.exports = { createInsight, getAllInsights, getInsightById, updateInsight, deleteInsight };
