const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holiday.controller');
const verifyJWT = require('../middleware/verifyJWT');
const authorizeRoles = require('../middleware/authorizeRoles');
const { validate } = require('../validations');
const { ROLES } = require('../constants');
const Joi = require('joi');

// ── Inline validation schemas ─────────────────────────────────────────────────

const holidaySchema = Joi.object({
  date: Joi.string().isoDate().required(),
  title: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('National', 'Company', 'Optional').required(),
});

const updateHolidaySchema = Joi.object({
  date: Joi.string().isoDate().optional(),
  title: Joi.string().min(2).max(100).optional(),
  type: Joi.string().valid('National', 'Company', 'Optional').optional(),
});

// ── Routes ────────────────────────────────────────────────────────────────────

router.use(verifyJWT);

// All roles — view holidays
router.get('/', holidayController.getHolidays);

// SUPER_ADMIN only — manage holidays
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN), validate(holidaySchema), holidayController.addHoliday);
router.patch('/:holidayId', authorizeRoles(ROLES.SUPER_ADMIN), validate(updateHolidaySchema), holidayController.updateHoliday);
router.delete('/:holidayId', authorizeRoles(ROLES.SUPER_ADMIN), holidayController.deleteHoliday);

module.exports = router;
