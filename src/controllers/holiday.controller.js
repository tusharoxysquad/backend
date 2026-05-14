const holidayService = require('../services/holiday.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

// SUPER_ADMIN — add single holiday
const addHoliday = asyncHandler(async (req, res) => {
  const holiday = await holidayService.addHoliday(req.user._id, req.body);
  sendSuccess(res, 'Holiday added successfully', holiday, 201);
});

// ALL roles — get holidays grouped by month
const getHolidays = asyncHandler(async (req, res) => {
  const data = await holidayService.getHolidays(req.query);
  sendSuccess(res, 'Holidays fetched successfully', data);
});

// SUPER_ADMIN — update a holiday
const updateHoliday = asyncHandler(async (req, res) => {
  const holiday = await holidayService.updateHoliday(req.params.holidayId, req.body);
  sendSuccess(res, 'Holiday updated successfully', holiday);
});

// SUPER_ADMIN — delete a holiday
const deleteHoliday = asyncHandler(async (req, res) => {
  await holidayService.deleteHoliday(req.params.holidayId);
  sendSuccess(res, 'Holiday deleted successfully');
});

module.exports = { addHoliday, getHolidays, updateHoliday, deleteHoliday };
