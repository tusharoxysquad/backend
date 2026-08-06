const express = require('express');
const router = express.Router();
const wfhController = require('../controllers/wfh.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validate } = require('../validations');
const { applyWfhSchema, rejectWfhSchema } = require('../validations');
const { ROLES } = require('../constants');

router.use(verifyJWT);

// Employee + Admin: apply, view own, cancel
router.post('/apply', validate(applyWfhSchema), wfhController.applyWfh);
router.get('/my-requests', wfhController.getMyWfhRequests);
router.patch('/cancel/:wfhId', wfhController.cancelWfh);

// Admin + Super Admin: view all (admin sees team only, scoped in service)
router.get('/all', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), wfhController.getAllWfhRequests);

// Super Admin only: approve / reject
router.patch('/approve/:wfhId', authorizeRoles(ROLES.SUPER_ADMIN), wfhController.approveWfh);
router.patch('/reject/:wfhId', authorizeRoles(ROLES.SUPER_ADMIN), validate(rejectWfhSchema), wfhController.rejectWfh);

module.exports = router;
