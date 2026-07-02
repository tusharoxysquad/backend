const blogService = require('../services/blog.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const createBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.createBlog(req.body, req.files, req.user?._id);
  sendSuccess(res, 'Blog created successfully', blog, 201);
});

const getBlogs = asyncHandler(async (req, res) => {
  const { data, pagination } = await blogService.getBlogs(req.query);
  sendPaginated(res, 'Blogs fetched successfully', data, pagination);
});

const getBlogById = asyncHandler(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.id);
  sendSuccess(res, 'Blog fetched successfully', blog);
});

const updateBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.updateBlog(req.params.id, req.body, req.files, req.user?._id);
  sendSuccess(res, 'Blog updated successfully', blog);
});

const deleteBlog = asyncHandler(async (req, res) => {
  await blogService.deleteBlog(req.params.id);
  sendSuccess(res, 'Blog deleted successfully');
});

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };
