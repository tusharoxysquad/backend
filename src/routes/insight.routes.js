const express = require('express');
const router = express.Router();
const controller = require('../controllers/insight.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { validate, createInsightSchema, updateInsightSchema, parseJsonFields } = require('../validations');

const parseInsightFields = parseJsonFields(
  'tags', 'target_audience', 'key_takeaways', 'recommendations', 'future_predictions', 'sections'
);

// Public
router.get('/', controller.getAllInsights);
router.get('/:id', controller.getInsightById);

// Protected — Super Admin & Admin
router.use(verifyJWT, authorize('Super Admin', 'Admin'));
router.post('/', upload.single('image'), parseInsightFields, validate(createInsightSchema), controller.createInsight);
router.patch('/:id', upload.single('image'), parseInsightFields, validate(updateInsightSchema), controller.updateInsight);
router.delete('/:id', controller.deleteInsight);

module.exports = router;
