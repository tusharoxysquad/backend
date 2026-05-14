const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');
const { validate, applyLeaveSchema, rejectSchema } = require('../validations');

router.use(verifyJWT);

router.post('/apply', validate(applyLeaveSchema), leaveController.applyLeave);
router.get('/my-leaves', leaveController.getMyLeaves);
router.get('/all', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), leaveController.getAllLeaves);
router.patch('/cancel/:leaveId', leaveController.cancelLeave);
router.patch('/approve/:leaveId', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), leaveController.approveLeave);
router.patch('/reject/:leaveId', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(rejectSchema), leaveController.rejectLeave);
router.get('/:leaveId', leaveController.getLeaveById);

module.exports = router;
