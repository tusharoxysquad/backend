const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');
const { validate, attendanceRejectSchema } = require('../validations');

router.use(verifyJWT);

// Employee routes
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.post('/break/start', attendanceController.startBreak);
router.post('/break/end', attendanceController.endBreak);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/history', attendanceController.getHistory);
router.get('/history/export', attendanceController.exportMyAttendance);
router.get('/monthly', attendanceController.getMonthlyAttendance);

// Admin + Super Admin routes
router.get(
  '/all',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  attendanceController.getAllUsersAttendance
);
router.get(
  '/export',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  attendanceController.exportAllUsersAttendance
);
router.get(
  '/employee/:employeeId',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  attendanceController.getEmployeeAttendance
);
router.post(
  '/mark-absent',
  authorizeRoles(ROLES.SUPER_ADMIN),
  attendanceController.markAbsent
);
router.get(
  '/pending-approvals',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  attendanceController.getPendingApprovals
);
router.patch(
  '/approve/:attendanceId',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  attendanceController.approveAttendance
);
router.patch(
  '/reject/:attendanceId',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate(attendanceRejectSchema),
  attendanceController.rejectAttendance
);
router.patch(
  '/:attendanceId/breaks/:breakId/approve',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  attendanceController.approveBreak
);
router.patch(
  '/:attendanceId/breaks/:breakId/reject',
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  attendanceController.rejectBreak
);

module.exports = router;
