const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');
const { validate, createJobSchema, updateJobSchema } = require('../validations');

// Public routes
router.get('/',    jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Protected routes — Admin / Super Admin only
router.use(verifyJWT);
router.use(authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.post('/',      validate(createJobSchema), jobController.createJob);
router.put('/:id',    validate(updateJobSchema), jobController.updateJob);
router.delete('/:id',                            jobController.deleteJob);

module.exports = router;
