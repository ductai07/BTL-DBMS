/**
 * Format a number as currency (VND)
 * @param {number} value - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "0 ₫";
  
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(value);
};

/**
 * Format a date to display in a readable format
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "Invalid date";
  
  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Format time to display in a readable format
 * @param {string} time - The time string to format (HH:MM:SS)
 * @returns {string} - Formatted time string
 */
export const formatTime = (time) => {
  if (!time) return "N/A";
  
  // If it's a full datetime string, extract only the time part
  if (time.includes('T')) {
    time = time.split('T')[1];
  }
  
  // If time includes seconds, remove them
  if (time.split(':').length > 2) {
    time = time.split(':').slice(0, 2).join(':');
  }
  
  return time;
};

/**
 * Truncate text if it's longer than maxLength
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
};

/**
 * Format a date and time together
 * @param {string|Date} dateValue - The date value
 * @param {string} timeValue - The time value
 * @returns {string} - Formatted datetime string
 */
export const formatDateTime = (dateValue, timeValue) => {
  const date = formatDate(dateValue);
  const time = formatTime(timeValue);
  
  return `${date} ${time !== 'N/A' ? time : ''}`;
};