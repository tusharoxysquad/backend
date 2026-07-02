const OurWork = require('../models/OurWork');
const ApiError = require('../utils/apiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadImage, uploadImageFromUrl, deleteImage } = require('../helpers/cloudinary.helper');

const _processBannerImage = async (files, data = {}, existing = {}) => {
  if (files?.bannerImage?.[0]) {
    await deleteImage(existing?.bannerImage?.publicId);
    return uploadImage(files.bannerImage[0], 'our-work');
  }
  if (data.bannerImageUrl) {
    await deleteImage(existing?.bannerImage?.publicId);
    return uploadImageFromUrl(data.bannerImageUrl, 'our-work');
  }
  return null;
};

const createOurWork = async (data, files, userId) => {
  const bannerImage = await _processBannerImage(files, data);
  if (bannerImage) data.bannerImage = bannerImage;
  data.createdBy = userId;
  data.updatedBy = userId;
  return OurWork.create(data);
};

const getAllOurWork = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.search) {
    filter.title = new RegExp(query.search, 'i');
  }

  const sort = query.sort ? { [query.sort]: query.order === 'asc' ? 1 : -1 } : { createdAt: -1 };

  const [data, total] = await Promise.all([
    OurWork.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
    OurWork.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const getOurWorkById = async (id) => {
  const item = await OurWork.findById(id).select('-__v');
  if (!item) throw ApiError.notFound('Work item not found');
  return item;
};

const updateOurWork = async (id, data, files, userId) => {
  const item = await OurWork.findById(id);
  if (!item) throw ApiError.notFound('Work item not found');
  const bannerImage = await _processBannerImage(files, data, item);
  if (bannerImage) data.bannerImage = bannerImage;
  data.updatedBy = userId;
  return OurWork.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-__v');
};

const deleteOurWork = async (id) => {
  const item = await OurWork.findById(id);
  if (!item) throw ApiError.notFound('Work item not found');
  await deleteImage(item?.bannerImage?.publicId);
  await item.deleteOne();
};

module.exports = { createOurWork, getAllOurWork, getOurWorkById, updateOurWork, deleteOurWork };
