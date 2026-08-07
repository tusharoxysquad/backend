const CaseStudy = require('../models/CaseStudy');
const ApiError = require('../utils/apiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadImage, uploadImageFromUrl, deleteImage } = require('../helpers/cloudinary.helper');

const _processImages = async (files, data = {}, existing = {}) => {
  const updates = {};

  if (files?.bannerImage?.[0]) {
    await deleteImage(existing?.hero?.bannerImage?.publicId);
    updates['hero.bannerImage'] = await uploadImage(files.bannerImage[0], 'case-studies');
  } else if (data.bannerImageUrl) {
    await deleteImage(existing?.hero?.bannerImage?.publicId);
    updates['hero.bannerImage'] = await uploadImageFromUrl(data.bannerImageUrl, 'case-studies');
  }

  if (files?.gallery) {
    const uploaded = await Promise.all(files.gallery.map((f) => uploadImage(f, 'case-studies')));
    updates.gallery = uploaded;
  } else if (data.galleryUrls) {
    const urls = Array.isArray(data.galleryUrls) ? data.galleryUrls : JSON.parse(data.galleryUrls);
    updates.gallery = await Promise.all(urls.map((url) => uploadImageFromUrl(url, 'case-studies')));
  }

  if (files?.figmaScreens) {
    const uploaded = await Promise.all(files.figmaScreens.map((f) => uploadImage(f, 'case-studies/figma-screens')));
    updates.figmaScreens = uploaded;
  } else if (data.figmaScreenUrls) {
    const urls = Array.isArray(data.figmaScreenUrls) ? data.figmaScreenUrls : JSON.parse(data.figmaScreenUrls);
    updates.figmaScreens = await Promise.all(urls.map((url) => uploadImageFromUrl(url, 'case-studies/figma-screens')));
  }

  return updates;
};

const _deleteAllImages = async (doc) => {
  await deleteImage(doc?.hero?.bannerImage?.publicId);
  if (doc.gallery?.length) {
    await Promise.all(doc.gallery.map((g) => deleteImage(g.publicId)));
  }
  if (doc.figmaScreens?.length) {
    await Promise.all(doc.figmaScreens.map((f) => deleteImage(f.publicId)));
  }
};

const createCaseStudy = async (data, files, userId) => {
  const imageUpdates = await _processImages(files, data);
  if (imageUpdates['hero.bannerImage']) data.hero = { ...data.hero, bannerImage: imageUpdates['hero.bannerImage'] };
  if (imageUpdates.gallery) data.gallery = imageUpdates.gallery;
  if (imageUpdates.figmaScreens) data.figmaScreens = imageUpdates.figmaScreens;
  data.createdBy = userId;
  data.updatedBy = userId;
  return CaseStudy.create(data);
};

const getAllCaseStudies = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.industry) filter.industry = query.industry;

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ title: regex }, { clientName: regex }, { 'hero.tags': regex }];
  }

  const sort = query.sort ? { [query.sort]: query.order === 'asc' ? 1 : -1 } : { publishedAt: -1, createdAt: -1 };

  const [data, total] = await Promise.all([
    CaseStudy.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
    CaseStudy.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const getCaseStudyById = async (id) => {
  const cs = await CaseStudy.findById(id).select('-__v');
  if (!cs) throw ApiError.notFound('Case study not found');
  return cs;
};

const updateCaseStudy = async (id, data, files, userId) => {
  const cs = await CaseStudy.findById(id);
  if (!cs) throw ApiError.notFound('Case study not found');

  const imageUpdates = await _processImages(files, data, cs);

  // Build a $set payload using dot-notation to avoid overwriting unrelated fields
  const setPayload = {};

  const scalarFields = ['title', 'clientName', 'industry', 'publishedAt', 'overview', 'brief', 'challenge', 'solution', 'technologyStack', 'features', 'results', 'testimonials', 'target_audience'];
  scalarFields.forEach((field) => {
    if (data[field] !== undefined) setPayload[field] = data[field];
  });

  // Merge hero text fields with existing bannerImage so it's never wiped
  if (data.hero !== undefined) {
    const existingBanner = cs.hero?.bannerImage;
    setPayload['hero.title']       = data.hero.title       ?? cs.hero?.title       ?? '';
    setPayload['hero.subtitle']    = data.hero.subtitle    ?? cs.hero?.subtitle    ?? '';
    setPayload['hero.description'] = data.hero.description ?? cs.hero?.description ?? '';
    setPayload['hero.tags']        = data.hero.tags        ?? cs.hero?.tags        ?? [];
    // Only update bannerImage if a new one was uploaded; otherwise keep existing
    if (imageUpdates['hero.bannerImage']) {
      setPayload['hero.bannerImage'] = imageUpdates['hero.bannerImage'];
    } else if (existingBanner) {
      setPayload['hero.bannerImage'] = existingBanner;
    }
  } else if (imageUpdates['hero.bannerImage']) {
    setPayload['hero.bannerImage'] = imageUpdates['hero.bannerImage'];
  }

  // Handle figma screens: keep existing ones that weren't removed + append new uploads
  const existingFigmaPublicIds = data.existingFigmaScreens
    ? (Array.isArray(data.existingFigmaScreens) ? data.existingFigmaScreens : JSON.parse(data.existingFigmaScreens))
    : null;

  if (existingFigmaPublicIds !== null) {
    const keptScreens = (cs.figmaScreens || []).filter((s) => existingFigmaPublicIds.includes(s.publicId));
    const removedScreens = (cs.figmaScreens || []).filter((s) => !existingFigmaPublicIds.includes(s.publicId));
    if (removedScreens.length) await Promise.all(removedScreens.map((s) => deleteImage(s.publicId)));
    const newScreens = imageUpdates.figmaScreens || [];
    setPayload.figmaScreens = [...keptScreens, ...newScreens];
  } else if (imageUpdates.figmaScreens) {
    setPayload.figmaScreens = [...(cs.figmaScreens || []), ...imageUpdates.figmaScreens];
  }

  setPayload.updatedBy = userId;

  return CaseStudy.findByIdAndUpdate(id, { $set: setPayload }, { new: true, runValidators: true }).select('-__v');
};

const deleteCaseStudy = async (id) => {
  const cs = await CaseStudy.findById(id);
  if (!cs) throw ApiError.notFound('Case study not found');
  await _deleteAllImages(cs);
  await cs.deleteOne();
};

module.exports = { createCaseStudy, getAllCaseStudies, getCaseStudyById, updateCaseStudy, deleteCaseStudy };
