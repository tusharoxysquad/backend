const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const verifyJWT = require('../middleware/verifyJWT');
const { validate, updateUserSchema } = require('../validations');

router.use(verifyJWT);

router.get('/profile', employeeController.getProfile);
router.patch('/profile', validate(updateUserSchema), employeeController.updateProfile);

module.exports = router;
