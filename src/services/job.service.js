const Job = require('../models/Job');
const ApiError = require('../utils/apiError');
const { JOB_STATUS } = require('../constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const SORT_MAP = {
  latest:  { createdAt: -1 },
  oldest:  { createdAt:  1 },
};

const createJob = async (createdBy, body) => {
  const job = await Job.create({ ...body, createdBy });
  return job.populate('createdBy', 'name email role');
};

const getJobs = async (query) => {
  const { page, limit, skip } = getPagination(query);

  // Base filter — never return soft-deleted records
  const filter = { isDeleted: false };

  // Search: title | position | location (case-insensitive regex)
  if (query.search) {
    const rx = new RegExp(query.search, 'i');
    filter.$or = [{ title: rx }, { position: rx }, { location: rx }];
  }

  // Filters
  if (query.status)     filter.status     = query.status;
  if (query.jobType)    filter.jobType    = query.jobType;
  if (query.experience) filter.experience = query.experience;

  const sort = SORT_MAP[query.sort] ?? SORT_MAP.latest;

  const [records, total] = await Promise.all([
    Job.find(filter)
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

const getJobById = async (jobId) => {
  const job = await Job.findOne({ _id: jobId, isDeleted: false })
    .populate('createdBy', 'name email role');
  if (!job) throw ApiError.notFound('Job not found');
  return job;
};

const updateJob = async (jobId, body) => {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) throw ApiError.notFound('Job not found');

  Object.assign(job, body);
  await job.save();
  return job.populate('createdBy', 'name email role');
};

const deleteJob = async (jobId) => {
  const job = await Job.findOne({ _id: jobId, isDeleted: false });
  if (!job) throw ApiError.notFound('Job not found');

  job.isDeleted  = true;
  job.deletedAt  = new Date();
  job.status     = JOB_STATUS.CLOSED;
  await job.save();

  return { id: job._id, deletedAt: job.deletedAt };
};

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
