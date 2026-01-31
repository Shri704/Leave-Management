const Holiday = require("../models/Holiday");

/**
 * Calculate leave days excluding holidays
 * @param {Date|string} fromDate - Start date
 * @param {Date|string} toDate - End date
 * @returns {Promise<{totalDays: number, holidaysExcluded: number, finalDays: number}>}
 */
const calculateLeaveDays = async (fromDate, toDate) => {
  // Convert to Date objects and normalize to start of day
  const start = new Date(fromDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(toDate);
  end.setHours(23, 59, 59, 999);

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  if (start > end) {
    throw new Error("From date cannot be after to date");
  }

  // Calculate total days (inclusive)
  const timeDiff = end.getTime() - start.getTime();
  const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  // Find holidays in the date range
  // Normalize holiday dates for comparison (compare only date part, not time)
  const holidays = await Holiday.find({
    date: {
      $gte: new Date(start.getFullYear(), start.getMonth(), start.getDate()),
      $lte: new Date(end.getFullYear(), end.getMonth(), end.getDate())
    }
  });

  // Count unique holidays (in case of duplicates)
  const holidayDates = new Set();
  holidays.forEach(holiday => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    const holidayStr = holidayDate.toISOString().split('T')[0];
    holidayDates.add(holidayStr);
  });

  const holidaysExcluded = holidayDates.size;
  const finalDays = totalDays - holidaysExcluded;

  return {
    totalDays,
    holidaysExcluded,
    finalDays: Math.max(0, finalDays) // Ensure non-negative
  };
};

module.exports = calculateLeaveDays;
