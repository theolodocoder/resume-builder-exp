/**
 * Logging Utility
 * ===============
 *
 * Simple logging utility for resume parser with timestamps
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LOG_LEVEL = process.env.LOG_LEVEL || "INFO";

function getTimestamp() {
  return new Date().toISOString();
}

function shouldLog(level) {
  return LOG_LEVELS[level] >= LOG_LEVELS[LOG_LEVEL];
}

const logger = {
  debug: (message, data = {}) => {
    if (shouldLog("DEBUG")) {
      console.log(`[${getTimestamp()}] DEBUG: ${message}`, data);
    }
  },

  info: (message, data = {}) => {
    if (shouldLog("INFO")) {
      console.log(`[${getTimestamp()}] INFO: ${message}`, data);
    }
  },

  warn: (message, data = {}) => {
    if (shouldLog("WARN")) {
      console.warn(`[${getTimestamp()}] WARN: ${message}`, data);
    }
  },

  error: (message, error = null) => {
    if (shouldLog("ERROR")) {
      console.error(`[${getTimestamp()}] ERROR: ${message}`, error || "");
    }
  },
};

module.exports = logger;
