/**
 * Named Entity Recognition (NER) Service
 * ======================================
 *
 * Extracts entities (names, emails, companies, dates, etc.) from resume text
 * using regex-based pattern matching.
 */

const logger = require("../utils/logger");

/**
 * Extract entities from text
 *
 * @param {string} text - Resume text to extract entities from
 * @returns {Promise<Array>} - Array of entities with labels and confidence
 */
async function extractEntities(text) {
  if (!text) {
    return [];
  }

  try {
    logger.debug("Extracting named entities from text", {
      textLength: text.length,
    });

    const entities = fallbackEntityExtraction(text);

    logger.info("Entity extraction successful", {
      entityCount: entities.length,
    });

    return entities;
  } catch (error) {
    logger.error("Error during entity extraction", error);
    return [];
  }
}

/**
 * Fallback entity extraction using regex patterns
 * Used when NER service is unavailable
 *
 * @param {string} text
 * @returns {Array} - Array of extracted entities
 */
function fallbackEntityExtraction(text) {
  const entities = [];

  if (!text) return entities;

  // Email extraction
  const emailMatches = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  );
  if (emailMatches) {
    emailMatches.forEach((email) => {
      entities.push({
        label: "EMAIL",
        text: email,
        confidence: 0.95,
      });
    });
  }

  // Phone extraction
  const phoneMatches = text.match(
    /(?:\+?1)?[\s.-]?\(?([0-9]{3})\)?[\s.-]?([0-9]{3})[\s.-]?([0-9]{4})/g
  );
  if (phoneMatches) {
    phoneMatches.forEach((phone) => {
      entities.push({
        label: "PHONE",
        text: phone,
        confidence: 0.9,
      });
    });
  }

  // URL extraction
  const urlMatches = text.match(
    /https?:\/\/[^\s]+|(?:www\.|linkedin\.com\/in\/)[^\s]+/gi
  );
  if (urlMatches) {
    urlMatches.forEach((url) => {
      entities.push({
        label: "URL",
        text: url,
        confidence: 0.95,
      });
    });
  }

  // Company extraction (capitalized words in parentheses or after specific keywords)
  const companyMatches = text.match(
    /(?:at|with|company|employer|work(?:ed)?[\s]+(?:at|for))\s+([A-Z][^\n]+?)(?:[\n,•]|$)/gi
  );
  if (companyMatches) {
    companyMatches.forEach((match) => {
      const company = match
        .replace(/^(?:at|with|company|employer|work(?:ed)?[\s]+(?:at|for))\s+/i, "")
        .trim();
      if (company.length > 0) {
        entities.push({
          label: "COMPANY",
          text: company,
          confidence: 0.7,
        });
      }
    });
  }

  // Date extraction (simple year patterns)
  const yearMatches = text.match(/\b(20\d{2}|19\d{2})\b/g);
  if (yearMatches) {
    [...new Set(yearMatches)].forEach((year) => {
      entities.push({
        label: "DATE",
        text: year,
        confidence: 0.8,
      });
    });
  }

  logger.debug("Fallback entity extraction completed", {
    entityCount: entities.length,
  });

  return entities;
}

module.exports = {
  extractEntities,
  fallbackEntityExtraction,
};
