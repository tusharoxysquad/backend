const ourWorkService = require('../services/ourWork.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const createOurWork = asyncHandler(async (req, res) => {
  const item = await ourWorkService.createOurWork(req.body, req.files, req.user?._id);
  sendSuccess(res, 'Work item created successfully', item, 201);
});

const getAllOurWork = asyncHandler(async (req, res) => {
  const { data, pagination } = await ourWorkService.getAllOurWork(req.query);
  sendPaginated(res, 'Work items fetched successfully', data, pagination);
});

const getOurWorkById = asyncHandler(async (req, res) => {
  const item = await ourWorkService.getOurWorkById(req.params.id);
  sendSuccess(res, 'Work item fetched successfully', item);
});

const updateOurWork = asyncHandler(async (req, res) => {
  const item = await ourWorkService.updateOurWork(req.params.id, req.body, req.files, req.user?._id);
  sendSuccess(res, 'Work item updated successfully', item);
});

const deleteOurWork = asyncHandler(async (req, res) => {
  await ourWorkService.deleteOurWork(req.params.id);
  sendSuccess(res, 'Work item deleted successfully');
});

module.exports = { createOurWork, getAllOurWork, getOurWorkById, updateOurWork, deleteOurWork };
