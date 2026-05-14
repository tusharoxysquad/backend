const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');
const { validate, rejectSchema } = require('../validations');

router.use(verifyJWT, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/employees', adminController.getAllEmployees);
router.get('/team-employees', adminController.getTeamEmployees);
router.get('/team-attendance', adminController.getTeamAttendance);
router.get('/employee-attendance/:employeeId', adminController.getEmployeeAttendance);
router.get('/pending-leaves', adminController.getPendingLeaves);
router.patch('/approve-leave/:leaveId', adminController.approveLeave);
router.patch('/reject-leave/:leaveId', validate(rejectSchema), adminController.rejectLeave);

module.exports = router;
