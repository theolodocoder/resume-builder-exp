/**
 * Date Parsing and Normalization Utilities
 * ========================================
 *
 * Standardizes dates extracted from resumes to YYYY-MM or YYYY-MM-DD format.
 */

/**
 * Parse date string to YYYY-MM format
 * Handles various date formats: "Jan 2020", "01/2020", "2020-01", etc.
 *
 * @param {string} dateStr
 * @returns {string|null} - Date in YYYY-MM format or null if unparseable
 */
function parseDate(dateStr) {
  if (!dateStr) return null;

  const str = dateStr.trim().toLowerCase();

  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(str)) {
    return str;
  }

  // YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str.slice(0, 7);
  }

  // Month Year format (Jan 2020, January 2020)
  const monthYearMatch = str.match(
    /^(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\s+(\d{4})$/
  );
  if (monthYearMatch) {
    const monthNum = new Date(`${monthYearMatch[1]} 1, 2000`).getMonth() + 1;
    const year = monthYearMatch[2];
    return `${year}-${String(monthNum).padStart(2, "0")}`;
  }

  // MM/YYYY or MM/YY format
  const slashMatch = str.match(/^(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const month = String(slashMatch[1]).padStart(2, "0");
    let year = slashMatch[2];
    // Convert YY to YYYY (assume 2000s)
    if (year.length === 2) {
      year = "20" + year;
    }
    return `${year}-${month}`;
  }

  // Year only (2020)
  if (/^\d{4}$/.test(str)) {
    return `${str}-01`;
  }

  // "Present" or "Current"
  if (/^(present|current|ongoing)$/.test(str)) {
    return "Present";
  }

  return null;
}

/**
 * Format date to human-readable format
 * @param {string} date - Date in YYYY-MM format
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return "";
  if (date === "Present") return "Present";

  try {
    const [year, month] = date.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  } catch {
    return date;
  }
}

/**
 * Calculate duration between two dates
 * @param {string} startDate - Start date in YYYY-MM format
 * @param {string} endDate - End date in YYYY-MM format or "Present"
 * @returns {object} - { years: number, months: number }
 */
function calculateDuration(startDate, endDate) {
  if (!startDate) return null;

  try {
    const [startYear, startMonth] = startDate.split("-").map(Number);
    let endYear, endMonth;

    if (endDate === "Present") {
      const now = new Date();
      endYear = now.getFullYear();
      endMonth = now.getMonth() + 1;
    } else {
      [endYear, endMonth] = endDate.split("-").map(Number);
    }

    let years = endYear - startYear;
    let months = endMonth - startMonth;

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months };
  } catch {
    return null;
  }
}

/**
 * Validate if date string is in correct format
 * @param {string} date
 * @returns {boolean}
 */
function isValidDate(date) {
  if (!date) return false;
  if (date === "Present") return true;

  return /^\d{4}-\d{2}$/.test(date);
}

/**
 * Check if date is in the future
 * @param {string} date - Date in YYYY-MM format
 * @returns {boolean}
 */
function isFutureDate(date) {
  if (!date || date === "Present") return false;

  try {
    const [year, month] = date.split("-").map(Number);
    const now = new Date();

    if (year > now.getFullYear()) return true;
    if (year === now.getFullYear() && month > now.getMonth() + 1)
      return true;

    return false;
  } catch {
    return false;
  }
}

module.exports = {
  parseDate,
  formatDate,
  calculateDuration,
  isValidDate,
  isFutureDate,
};
