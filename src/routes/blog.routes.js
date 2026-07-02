const express = require('express');
const router = express.Router();
const controller = require('../controllers/blog.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { validate, blogBodySchema, updateBlogSchema, parseJsonFields } = require('../validations');

const parseBlogFields = parseJsonFields('meta', 'tags', 'sections');

const blogUpload = upload.fields([{ name: 'thumbnail', maxCount: 1 }]);

// Public
router.get('/', controller.getBlogs);
router.get('/:id', controller.getBlogById);

// Protected — Super Admin & Admin
router.use(verifyJWT, authorize('Super Admin', 'Admin'));
router.post('/', blogUpload, parseBlogFields, validate(blogBodySchema), controller.createBlog);
router.put('/:id', blogUpload, parseBlogFields, validate(updateBlogSchema), controller.updateBlog);
router.delete('/:id', controller.deleteBlog);

module.exports = router;
