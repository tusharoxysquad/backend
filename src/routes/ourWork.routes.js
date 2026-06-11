const express = require('express');
const router = express.Router();
const controller = require('../controllers/ourWork.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { validate, caseStudyBodySchema, updateCaseStudySchema } = require('../validations');

const ourWorkUpload = upload.fields([
  { name: 'bannerImage', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);

// Public
router.get('/', controller.getAllOurWork);
router.get('/:id', controller.getOurWorkById);

// Protected — Super Admin & Admin
router.use(verifyJWT, authorize('Super Admin', 'Admin'));
router.post('/', ourWorkUpload, validate(caseStudyBodySchema), controller.createOurWork);
router.patch('/:id', ourWorkUpload, validate(updateCaseStudySchema), controller.updateOurWork);
router.delete('/:id', controller.deleteOurWork);

module.exports = router;
