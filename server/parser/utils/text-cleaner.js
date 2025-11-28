/**
 * Text Cleaning and Normalization Utilities
 * ==========================================
 *
 * Provides functions to clean, normalize, and standardize text extracted
 * from resumes for better parsing accuracy.
 */

/**
 * Clean and normalize text
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
  if (!text) return "";

  return (
    text
      // Remove special characters that aren't meaningful (but preserve newlines)
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "")
      // Remove extra spaces on each line but preserve line structure
      .split('\n')
      .map(line => line.replace(/\s+/g, " ").trim())
      .join('\n')
      // Normalize quotes
      .replace(/[""'']/g, '"')
      // Clean up common OCR errors
      .replace(/([0-9])\|([A-Z])/g, "$1l$2")
      .replace(/\b0([A-Z])\b/g, "O$1")
      .trim()
  );
}

/**
 * Remove bullet points and leading symbols
 * @param {string} text
 * @returns {string}
 */
function removeBulletPoints(text) {
  if (!text) return "";

  return text
    .replace(/^[\s•\-\*►○■□◆▪]+\s*/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

/**
 * Split text into paragraphs
 * @param {string} text
 * @returns {Array<string>}
 */
function splitParagraphs(text) {
  if (!text) return [];

  return text
    .split(/\n\n+/)
    .map((p) => cleanText(p))
    .filter((p) => p.length > 0);
}

/**
 * Split text into sentences
 * @param {string} text
 * @returns {Array<string>}
 */
function splitSentences(text) {
  if (!text) return [];

  return text
    .split(/[.!?]+/)
    .map((s) => cleanText(s))
    .filter((s) => s.length > 0);
}

/**
 * Extract bullet point from text
 * @param {string} text
 * @returns {string}
 */
function extractBulletContent(text) {
  if (!text) return "";
  return removeBulletPoints(text);
}

/**
 * Deduplicate array of strings (case-insensitive)
 * @param {Array<string>} items
 * @returns {Array<string>}
 */
function deduplicateItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const lower = item.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

/**
 * Capitalize first letter
 * @param {string} text
 * @returns {string}
 */
function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 * @param {string} text
 * @returns {string}
 */
function titleCase(text) {
  if (!text) return "";
  return text
    .split(/\s+/)
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Remove extra spaces between words
 * @param {string} text
 * @returns {string}
 */
function normalizeSpaces(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Check if text looks like a heading (all caps or short with special formatting)
 * @param {string} text
 * @returns {boolean}
 */
function isLikelyHeading(text) {
  if (!text) return false;

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);

  // Short lines are often headings
  if (words.length <= 5) {
    // All caps or title case
    if (
      trimmed === trimmed.toUpperCase() ||
      trimmed === titleCase(trimmed)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Extract initials from name
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return "";

  return name
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join(".");
}

/**
 * Normalize URL format
 * @param {string} url
 * @returns {string|null}
 */
function normalizeUrl(url) {
  if (!url) return null;

  let normalized = url.trim();

  // Add https:// if missing
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }

  try {
    new URL(normalized);
    return normalized;
  } catch {
    return null;
  }
}

module.exports = {
  cleanText,
  removeBulletPoints,
  splitParagraphs,
  splitSentences,
  extractBulletContent,
  deduplicateItems,
  capitalize,
  titleCase,
  normalizeSpaces,
  isLikelyHeading,
  getInitials,
  normalizeUrl,
};
