const jobService = require('../services/job.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.user._id, req.body);
  sendSuccess(res, 'Job created successfully', job, 201);
});

const getJobs = asyncHandler(async (req, res) => {
  const { records, pagination } = await jobService.getJobs(req.query);
  sendPaginated(res, 'Jobs fetched successfully', records, pagination);
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  sendSuccess(res, 'Job fetched successfully', job);
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body);
  sendSuccess(res, 'Job updated successfully', job);
});

const deleteJob = asyncHandler(async (req, res) => {
  const result = await jobService.deleteJob(req.params.id);
  sendSuccess(res, 'Job deleted successfully', result);
});

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
