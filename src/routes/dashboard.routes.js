const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');

router.use(verifyJWT);

router.get('/super-admin', authorizeRoles(ROLES.SUPER_ADMIN), dashboardController.superAdminDashboard);
router.get('/admin', authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN), dashboardController.adminDashboard);
router.get('/employee', dashboardController.employeeDashboard);

module.exports = router;
