const OurWork = require('../models/OurWork');
const ApiError = require('../utils/apiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadImage, uploadImageFromUrl, deleteImage } = require('../helpers/cloudinary.helper');

const _processImages = async (files, data = {}, existing = {}) => {
  const updates = {};
  if (files?.bannerImage?.[0]) {
    await deleteImage(existing?.hero?.bannerImage?.publicId);
    updates['hero.bannerImage'] = await uploadImage(files.bannerImage[0], 'our-work');
  } else if (data.bannerImageUrl) {
    await deleteImage(existing?.hero?.bannerImage?.publicId);
    updates['hero.bannerImage'] = await uploadImageFromUrl(data.bannerImageUrl, 'our-work');
  }
  if (files?.logo?.[0]) {
    await deleteImage(existing?.hero?.logo?.publicId);
    updates['hero.logo'] = await uploadImage(files.logo[0], 'our-work');
  } else if (data.logoUrl) {
    await deleteImage(existing?.hero?.logo?.publicId);
    updates['hero.logo'] = await uploadImageFromUrl(data.logoUrl, 'our-work');
  }
  if (files?.gallery) {
    updates.gallery = await Promise.all(files.gallery.map((f) => uploadImage(f, 'our-work')));
  } else if (data.galleryUrls) {
    const urls = Array.isArray(data.galleryUrls) ? data.galleryUrls : JSON.parse(data.galleryUrls);
    updates.gallery = await Promise.all(urls.map((url) => uploadImageFromUrl(url, 'our-work')));
  }
  return updates;
};

const _deleteAllImages = async (doc) => {
  await deleteImage(doc?.hero?.bannerImage?.publicId);
  await deleteImage(doc?.hero?.logo?.publicId);
  if (doc.gallery?.length) await Promise.all(doc.gallery.map((g) => deleteImage(g.publicId)));
};

const createOurWork = async (data, files, userId) => {
  const img = await _processImages(files, data);
  if (img['hero.bannerImage']) data.hero = { ...data.hero, bannerImage: img['hero.bannerImage'] };
  if (img['hero.logo']) data.hero = { ...data.hero, logo: img['hero.logo'] };
  if (img.gallery) data.gallery = img.gallery;
  data.createdBy = userId;
  data.updatedBy = userId;
  return OurWork.create(data);
};

const getAllOurWork = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.industry) filter.industry = query.industry;
  if (query.status) filter.status = query.status;

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ title: regex }, { clientName: regex }, { 'hero.tags': regex }];
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
  const img = await _processImages(files, data, item);
  if (img['hero.bannerImage']) data.hero = { ...data.hero, bannerImage: img['hero.bannerImage'] };
  if (img['hero.logo']) data.hero = { ...data.hero, logo: img['hero.logo'] };
  if (img.gallery) data.gallery = [...(item.gallery || []), ...img.gallery];
  data.updatedBy = userId;
  return OurWork.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-__v');
};

const deleteOurWork = async (id) => {
  const item = await OurWork.findById(id);
  if (!item) throw ApiError.notFound('Work item not found');
  await _deleteAllImages(item);
  await item.deleteOne();
};

module.exports = { createOurWork, getAllOurWork, getOurWorkById, updateOurWork, deleteOurWork };
