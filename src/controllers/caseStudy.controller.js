const caseStudyService = require('../services/caseStudy.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const createCaseStudy = asyncHandler(async (req, res) => {
  const cs = await caseStudyService.createCaseStudy(req.body, req.files, req.user?._id);
  sendSuccess(res, 'Case study created successfully', cs, 201);
});

const getAllCaseStudies = asyncHandler(async (req, res) => {
  const { data, pagination } = await caseStudyService.getAllCaseStudies(req.query);
  sendPaginated(res, 'Case studies fetched successfully', data, pagination);
});

const getCaseStudyById = asyncHandler(async (req, res) => {
  const cs = await caseStudyService.getCaseStudyById(req.params.id);
  sendSuccess(res, 'Case study fetched successfully', cs);
});

const updateCaseStudy = asyncHandler(async (req, res) => {
  const cs = await caseStudyService.updateCaseStudy(req.params.id, req.body, req.files, req.user?._id);
  sendSuccess(res, 'Case study updated successfully', cs);
});

const deleteCaseStudy = asyncHandler(async (req, res) => {
  await caseStudyService.deleteCaseStudy(req.params.id);
  sendSuccess(res, 'Case study deleted successfully');
});

module.exports = { createCaseStudy, getAllCaseStudies, getCaseStudyById, updateCaseStudy, deleteCaseStudy };
