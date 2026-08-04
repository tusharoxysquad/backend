const Blog = require('../models/Blog');
const ApiError = require('../utils/apiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadImage, uploadImageFromUrl, deleteImage } = require('../helpers/cloudinary.helper');

const LIST_SELECT = '_id title slug thumbnail category readTime status publishedAt createdAt';

const _processThumbnail = async (files, data = {}, existing = {}) => {
  if (files?.thumbnail?.[0]) {
    await deleteImage(existing?.thumbnail?.publicId);
    return uploadImage(files.thumbnail[0], 'blogs');
  }
  if (data.thumbnailUrl) {
    await deleteImage(existing?.thumbnail?.publicId);
    return uploadImageFromUrl(data.thumbnailUrl, 'blogs');
  }
  return null;
};

const _normalizeDates = (data) => {
  if (data.publishedAt === '') data.publishedAt = null;
};

const createBlog = async (data, files, userId) => {
  const thumbnail = await _processThumbnail(files, data);
  if (thumbnail) data.thumbnail = thumbnail;
  _normalizeDates(data);
  data.createdBy = userId;
  data.updatedBy = userId;
  return Blog.create(data);
};

const getBlogs = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.category) filter.category = new RegExp(query.category, 'i');
  if (query.search) filter.title = new RegExp(query.search, 'i');

  const [data, total] = await Promise.all([
    Blog.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).select(LIST_SELECT),
    Blog.countDocuments(filter),
  ]);

  return { data, pagination: buildPaginationMeta(total, page, limit) };
};

const getBlogById = async (id) => {
  const blog = await Blog.findById(id).select('-__v');
  if (!blog) throw ApiError.notFound('Blog not found');
  return blog;
};

const updateBlog = async (id, data, files, userId) => {
  const blog = await Blog.findById(id);
  if (!blog) throw ApiError.notFound('Blog not found');
  const thumbnail = await _processThumbnail(files, data, blog);
  if (thumbnail) data.thumbnail = thumbnail;
  _normalizeDates(data);
  data.updatedBy = userId;
  return Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-__v');
};

const deleteBlog = async (id) => {
  const blog = await Blog.findById(id);
  if (!blog) throw ApiError.notFound('Blog not found');
  await deleteImage(blog?.thumbnail?.publicId);
  await blog.deleteOne();
};

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };
