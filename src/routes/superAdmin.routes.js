const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdmin.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { ROLES } = require('../constants');
const { validate, createUserSchema, updateUserSchema, resetPasswordSchema } = require('../validations');

router.use(verifyJWT, authorizeRoles(ROLES.SUPER_ADMIN));

router.post('/create-admin', validate(createUserSchema), superAdminController.createAdmin);
router.post('/create-employee', validate(createUserSchema), superAdminController.createEmployee);
router.get('/admins', superAdminController.getAdmins);
router.get('/employees', superAdminController.getEmployees);
router.get('/user/:id', superAdminController.getUserById);
router.patch('/user/:id', validate(updateUserSchema), superAdminController.updateUser);
router.delete('/user/:id', superAdminController.deleteUser);
router.patch('/user-status/:id', superAdminController.toggleUserStatus);
router.patch('/reset-password/:id', validate(resetPasswordSchema), superAdminController.resetPassword);

module.exports = router;
