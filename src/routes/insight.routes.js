const express = require('express');
const router = express.Router();
const controller = require('../controllers/insight.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { validate, createInsightSchema, updateInsightSchema } = require('../validations');

// Public
router.get('/', controller.getAllInsights);
router.get('/:id', controller.getInsightById);

// Protected — Super Admin & Admin
router.use(verifyJWT, authorize('Super Admin', 'Admin'));
router.post('/', upload.single('image'), validate(createInsightSchema), controller.createInsight);
router.patch('/:id', upload.single('image'), validate(updateInsightSchema), controller.updateInsight);
router.delete('/:id', controller.deleteInsight);

module.exports = router;
