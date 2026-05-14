const express = require('express');
const router = express.Router();
const overtimeController = require('../controllers/overtime.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validate, overtimeRequestSchema, overtimeRejectSchema } = require('../validations');
const { ROLES } = require('../constants');

router.use(verifyJWT);

// EMPLOYEE & ADMIN only
router.post('/check-in', authorizeRoles(ROLES.EMPLOYEE, ROLES.ADMIN), validate(overtimeRequestSchema), overtimeController.overtimeCheckIn);
router.post('/check-out', authorizeRoles(ROLES.EMPLOYEE, ROLES.ADMIN), overtimeController.overtimeCheckOut);
router.get('/my-overtime', authorizeRoles(ROLES.EMPLOYEE, ROLES.ADMIN), overtimeController.getMyOvertime);

// ADMIN & SUPER_ADMIN only
router.get('/all', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), overtimeController.getAllOvertime);
router.patch('/approve/:id', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), overtimeController.approveOvertime);
router.patch('/reject/:id', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), validate(overtimeRejectSchema), overtimeController.rejectOvertime);

module.exports = router;
