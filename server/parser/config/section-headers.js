/**
 * Resume Section Headers Configuration
 * =====================================
 *
 * Defines patterns and variations for detecting different resume sections.
 * Used to identify and split resume content into logical sections.
 */

const SECTION_HEADERS = {
  CONTACT: {
    patterns: [
      /^contact\s*(?:information)?$/i,
      /^personal\s*(?:information|details)?$/i,
      /^about$/i,
    ],
    aliases: ["contact", "contact information", "personal info"],
  },

  SUMMARY: {
    patterns: [
      /^(?:professional\s+)?summary$/i,
      /^(?:executive\s+)?profile$/i,
      /^about\s+me$/i,
      /^overview$/i,
      /^objective$/i,
    ],
    aliases: ["summary", "professional summary", "executive profile", "objective"],
  },

  EXPERIENCE: {
    patterns: [
      /^(?:work\s+)?experience$/i,
      /^employment\s+(?:history)?$/i,
      /^professional\s+experience$/i,
      /^career\s+(?:history)?$/i,
      /^positions?$/i,
    ],
    aliases: ["experience", "work experience", "employment"],
  },

  EDUCATION: {
    patterns: [
      /^education$/i,
      /^academic\s+(?:background|history)$/i,
      /^qualifications$/i,
    ],
    aliases: ["education", "academic background", "qualifications"],
  },

  SKILLS: {
    patterns: [
      /^skills?$/i,
      /^technical\s+skills?$/i,
      /^competencies?$/i,
      /^core\s+competencies?$/i,
      /^expertise$/i,
    ],
    aliases: ["skills", "technical skills", "competencies"],
  },

  CERTIFICATIONS: {
    patterns: [
      /^certifications?$/i,
      /^licenses?(?:\s+and\s+certifications?)?$/i,
      /^professional\s+(?:certifications?|licenses?)$/i,
    ],
    aliases: ["certifications", "licenses", "professional certifications"],
  },

  PROJECTS: {
    patterns: [
      /^projects?$/i,
      /^notable\s+projects?$/i,
      /^portfolio$/i,
      /^(?:key\s+)?projects?$/i,
    ],
    aliases: ["projects", "portfolio", "notable projects"],
  },

  LANGUAGES: {
    patterns: [
      /^languages?$/i,
      /^linguistic\s+(?:abilities|skills)$/i,
    ],
    aliases: ["languages", "linguistic abilities"],
  },

  AWARDS: {
    patterns: [
      /^awards?(?:\s+(?:and|&)\s+honors?)?$/i,
      /^(?:honors?|recognition)(?:\s+(?:and|&)\s+awards?)?$/i,
      /^achievements?$/i,
    ],
    aliases: ["awards", "honors", "achievements"],
  },

  INTERESTS: {
    patterns: [
      /^interests?$/i,
      /^hobbies?$/i,
    ],
    aliases: ["interests", "hobbies"],
  },
};

/**
 * Get section type from a line of text
 * @param {string} line - Line to check
 * @returns {string|null} - Section type or null if not a header
 */
function detectSectionType(line) {
  const trimmedLine = line.trim();

  for (const [sectionType, config] of Object.entries(SECTION_HEADERS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(trimmedLine)) {
        return sectionType;
      }
    }
  }

  return null;
}

/**
 * Check if a line is a section header
 * @param {string} line - Line to check
 * @returns {boolean}
 */
function isSectionHeader(line) {
  return detectSectionType(line) !== null;
}

/**
 * Normalize section name to standard format
 * @param {string} sectionType - Section type (e.g., "EXPERIENCE")
 * @returns {string} - Normalized section name
 */
function normalizeSectionName(sectionType) {
  const nameMap = {
    CONTACT: "contact",
    SUMMARY: "summary",
    EXPERIENCE: "experiences",
    EDUCATION: "education",
    SKILLS: "skills",
    CERTIFICATIONS: "certifications",
    PROJECTS: "projects",
    LANGUAGES: "languages",
    AWARDS: "awards",
    INTERESTS: "interests",
  };
  return nameMap[sectionType] || sectionType.toLowerCase();
}

module.exports = {
  SECTION_HEADERS,
  detectSectionType,
  isSectionHeader,
  normalizeSectionName,
};
