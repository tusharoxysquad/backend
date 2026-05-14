const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');

router.use(verifyJWT, authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/daily', reportController.getDailyReport);
router.get('/weekly', reportController.getWeeklyReport);
router.get('/monthly', reportController.getMonthlyReport);
router.get('/early-exits', reportController.getEarlyExitsReport);
router.get('/absent-employees', reportController.getAbsentEmployeesReport);

module.exports = router;
