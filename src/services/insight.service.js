const Insight = require('../models/Insight');
const ApiError = require('../utils/apiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadImage, uploadImageFromUrl, deleteImage } = require('../helpers/cloudinary.helper');

const createInsight = async (data, file, userId) => {
  if (file) {
    const { imageUrl, publicId } = await uploadImage(file, 'insights');
    data.imageUrl = imageUrl;
    data.publicId = publicId;
  } else if (data.imageUrl) {
    const { imageUrl, publicId } = await uploadImageFromUrl(data.imageUrl, 'insights');
    data.imageUrl = imageUrl;
    data.publicId = publicId;
  }
  data.createdBy = userId;
  data.updatedBy = userId;
  return Insight.create(data);
};

const getAllInsights = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.category) filter.category = query.category;
  if (query.industry) filter.industry = query.industry;
  if (query.priority_level) filter.priority_level = query.priority_level;

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ title: regex }, { summary: regex }, { author: regex }, { tags: regex }];
  }

  const sort = query.sort ? { [query.sort]: query.order === 'asc' ? 1 : -1 } : { createdAt: -1 };

  const [data, total] = await Promise.all([
    Insight.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
    Insight.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const getInsightById = async (id) => {
  const insight = await Insight.findById(id).select('-__v');
  if (!insight) throw ApiError.notFound('Insight not found');
  return insight;
};

const updateInsight = async (id, data, file, userId) => {
  const insight = await Insight.findById(id);
  if (!insight) throw ApiError.notFound('Insight not found');

  if (file) {
    await deleteImage(insight.publicId);
    const { imageUrl, publicId } = await uploadImage(file, 'insights');
    data.imageUrl = imageUrl;
    data.publicId = publicId;
  } else if (data.imageUrl) {
    await deleteImage(insight.publicId);
    const { imageUrl, publicId } = await uploadImageFromUrl(data.imageUrl, 'insights');
    data.imageUrl = imageUrl;
    data.publicId = publicId;
  }

  data.updatedBy = userId;
  return Insight.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-__v');
};

const deleteInsight = async (id) => {
  const insight = await Insight.findById(id);
  if (!insight) throw ApiError.notFound('Insight not found');
  await deleteImage(insight.publicId);
  await insight.deleteOne();
};

module.exports = { createInsight, getAllInsights, getInsightById, updateInsight, deleteInsight };
