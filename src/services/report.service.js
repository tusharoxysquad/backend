const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { ATTENDANCE_STATUS, ROLES } = require('../constants');
const { getDayRange, getWeekRange, getMonthRange, toDateString } = require('../utils/dateHelper');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const buildDateFilter = (start, end) => ({
  date: { $gte: toDateString(start), $lte: toDateString(end) },
});

const getReport = async (filter, query) => {
  const { page, limit, skip } = getPagination(query);

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate('employeeId', 'name email department designation')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return { records, pagination: buildPaginationMeta(total, page, limit) };
};

const getDailyReport = async (query) => {
  const date = query.date ? new Date(query.date) : new Date();
  const filter = { date: toDateString(date) };
  return getReport(filter, query);
};

const getWeeklyReport = async (query) => {
  const { start, end } = getWeekRange(query.date ? new Date(query.date) : new Date());
  return getReport(buildDateFilter(start, end), query);
};

const getMonthlyReport = async (query) => {
  const year = parseInt(query.year) || new Date().getFullYear();
  const month = parseInt(query.month) || new Date().getMonth() + 1;
  const { start, end } = getMonthRange(year, month);
  return getReport(buildDateFilter(start, end), query);
};

const getEarlyExitsReport = async (query) => {
  const filter = { earlyExit: true };
  if (query.date) filter.date = toDateString(new Date(query.date));
  return getReport(filter, query);
};

const getAbsentEmployeesReport = async (query) => {
  const date = query.date ? toDateString(new Date(query.date)) : toDateString();
  const filter = { date, attendanceStatus: ATTENDANCE_STATUS.ABSENT };
  return getReport(filter, query);
};

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getEarlyExitsReport,
  getAbsentEmployeesReport,
};
