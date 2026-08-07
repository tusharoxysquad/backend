const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');
const { validate, createJobSchema, updateJobSchema } = require('../validations');

// All job routes require authentication + Admin or Super Admin role
router.use(verifyJWT);
router.use(authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.post('/',     validate(createJobSchema), jobController.createJob);
router.get('/',                                 jobController.getJobs);
router.get('/:id',                              jobController.getJobById);
router.put('/:id',   validate(updateJobSchema), jobController.updateJob);
router.delete('/:id',                           jobController.deleteJob);

module.exports = router;
