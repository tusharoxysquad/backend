/**
 * Get start and end of a given date (midnight to 23:59:59)
 */
const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Get start and end of current week (Mon–Sun)
 */
const getWeekRange = (date = new Date()) => {
  const day = date.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMon);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * Get start and end of a given month
 */
const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Calculate hours between two Date objects
 */
const calcHours = (start, end) => {
  return parseFloat(((end - start) / (1000 * 60 * 60)).toFixed(2));
};

/**
 * Format date to YYYY-MM-DD string
 */
const toDateString = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Count working days (Mon–Fri) in a given month
 */
const getWorkingDaysInMonth = (year, month) => {
  const totalDays = new Date(year, month, 0).getDate();
  let count = 0;
  for (let d = 1; d <= totalDays; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
};

module.exports = { getDayRange, getWeekRange, getMonthRange, calcHours, toDateString, getWorkingDaysInMonth };
