const express = require('express');
const router = express.Router();
const controller = require('../controllers/ourWork.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');
const { validate, ourWorkBodySchema, updateOurWorkSchema, parseJsonFields } = require('../validations');

const parseOurWorkFields = parseJsonFields('technologyStack');

const ourWorkUpload = upload.fields([
  { name: 'bannerImage', maxCount: 1 },
]);

// Public
router.get('/', controller.getAllOurWork);
router.get('/:id', controller.getOurWorkById);

// Protected — Super Admin & Admin
router.use(verifyJWT, authorize('Super Admin', 'Admin'));
router.post('/', ourWorkUpload, parseOurWorkFields, validate(ourWorkBodySchema), controller.createOurWork);
router.patch('/:id', ourWorkUpload, parseOurWorkFields, validate(updateOurWorkSchema), controller.updateOurWork);
router.delete('/:id', controller.deleteOurWork);

module.exports = router;
