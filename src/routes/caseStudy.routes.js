const express = require('express');
const router = express.Router();
const controller = require('../controllers/caseStudy.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { validate, caseStudyBodySchema, updateCaseStudySchema, parseJsonFields } = require('../validations');

const parseCaseStudyFields = parseJsonFields(
  'hero', 'overview', 'brief', 'challenge', 'solution',
  'technologyStack', 'features', 'results', 'testimonials', 'galleryUrls'
);

const caseStudyUpload = upload.fields([
  { name: 'bannerImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

// Public
router.get('/', controller.getAllCaseStudies);
router.get('/:id', controller.getCaseStudyById);

// Protected — Super Admin & Admin
router.use(verifyJWT, authorize('Super Admin', 'Admin'));
router.post('/', caseStudyUpload, parseCaseStudyFields, validate(caseStudyBodySchema), controller.createCaseStudy);
router.patch('/:id', caseStudyUpload, parseCaseStudyFields, validate(updateCaseStudySchema), controller.updateCaseStudy);
router.delete('/:id', controller.deleteCaseStudy);

module.exports = router;
