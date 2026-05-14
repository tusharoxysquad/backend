const Holiday = require('../models/Holiday');
const ApiError = require('../utils/apiError');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Format a YYYY-MM-DD date string to "Mon DD" e.g. "Jan 26"
 */
const formatDay = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Group flat holiday records into month buckets matching the required response shape
 */
const groupByMonth = (holidays) => {
  const map = {};

  for (const h of holidays) {
    const monthName = MONTH_NAMES[h.month - 1];
    if (!map[monthName]) map[monthName] = [];
    map[monthName].push({
      _id: h._id,
      date: h.date,
      day: formatDay(h.date),
      title: h.title,
      type: h.type,
    });
  }

  // Return sorted by month order
  return MONTH_NAMES
    .filter((m) => map[m])
    .map((m) => ({ month: m, holidays: map[m] }));
};

const addHoliday = async (creatorId, data) => {
  const exists = await Holiday.findOne({ date: data.date });
  if (exists) throw ApiError.conflict(`A holiday already exists on ${data.date}`);

  const d = new Date(data.date);
  const monthIndex = d.getMonth();

  const holiday = await Holiday.create({
    ...data,
    year: d.getFullYear(),
    month: monthIndex + 1,
    createdBy: creatorId,
  });

  return {
    _id: holiday._id,
    date: holiday.date,
    day: formatDay(holiday.date),
    month: MONTH_NAMES[monthIndex],
    title: holiday.title,
    type: holiday.type,
    year: holiday.year,
    createdAt: holiday.createdAt,
  };
};

const addBulkHolidays = async (creatorId, holidays) => {
  const results = { added: [], skipped: [] };

  for (const data of holidays) {
    const exists = await Holiday.findOne({ date: data.date });
    if (exists) {
      results.skipped.push(data.date);
      continue;
    }
    const d = new Date(data.date);
    await Holiday.create({
      ...data,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      createdBy: creatorId,
    });
    results.added.push(data.date);
  }

  return results;
};

const getHolidays = async (query) => {
  const filter = {};
  const year = parseInt(query.year) || new Date().getFullYear();
  filter.year = year;

  if (query.month) filter.month = parseInt(query.month);
  if (query.type) filter.type = query.type;

  const holidays = await Holiday.find(filter).sort({ date: 1 });
  return groupByMonth(holidays);
};

const updateHoliday = async (holidayId, data) => {
  // If date is being changed, check for conflicts
  if (data.date) {
    const conflict = await Holiday.findOne({ date: data.date, _id: { $ne: holidayId } });
    if (conflict) throw ApiError.conflict(`A holiday already exists on ${data.date}`);

    const d = new Date(data.date);
    data.year = d.getFullYear();
    data.month = d.getMonth() + 1;
  }

  const holiday = await Holiday.findByIdAndUpdate(holidayId, data, { new: true, runValidators: true });
  if (!holiday) throw ApiError.notFound('Holiday not found');
  return holiday;
};

const deleteHoliday = async (holidayId) => {
  const holiday = await Holiday.findByIdAndDelete(holidayId);
  if (!holiday) throw ApiError.notFound('Holiday not found');
};

module.exports = { addHoliday, getHolidays, updateHoliday, deleteHoliday };
