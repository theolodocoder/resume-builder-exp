/**
 * Resume Section Detection Service
 * ================================
 *
 * Identifies and segments different sections of a resume
 * (Experience, Education, Skills, etc.)
 */

const {
  detectSectionType,
  isSectionHeader,
  normalizeSectionName,
} = require("../config/section-headers");
const { isLikelyHeading } = require("../utils/text-cleaner");
const logger = require("../utils/logger");

/**
 * Split text by section headers
 * Returns object with section names as keys and content arrays as values
 *
 * @param {Array<string>} paragraphs - Array of text paragraphs
 * @returns {object} - { sectionName: [contentLines] }
 */
function detectSections(paragraphs) {
  const sections = {};
  let currentSection = "other";
  let currentContent = [];

  for (const paragraph of paragraphs) {
    const detectedType = detectSectionType(paragraph);

    if (detectedType) {
      // Save previous section if it has content
      if (currentContent.length > 0) {
        if (!sections[currentSection]) {
          sections[currentSection] = [];
        }
        sections[currentSection].push(...currentContent);
        currentContent = [];
      }

      // Start new section
      currentSection = normalizeSectionName(detectedType);
      logger.debug("Detected section", { section: currentSection });
    } else {
      // Add paragraph to current section
      if (paragraph.trim().length > 0) {
        currentContent.push(paragraph);
      }
    }
  }

  // Save final section
  if (currentContent.length > 0) {
    if (!sections[currentSection]) {
      sections[currentSection] = [];
    }
    sections[currentSection].push(...currentContent);
  }

  logger.info("Section detection complete", {
    detectedSections: Object.keys(sections),
  });

  return sections;
}

/**
 * Extract and organize section content
 * Groups related content (bullets, descriptions) under each section
 *
 * @param {object} sections - Section object from detectSections
 * @returns {object} - Organized sections with content arrays
 */
function organizeSectionContent(sections) {
  const organized = {};

  for (const [sectionName, content] of Object.entries(sections)) {
    organized[sectionName] = {
      raw: content.join("\n"),
      lines: content,
      itemCount: content.length,
    };
  }

  return organized;
}

/**
 * Extract contact section information
 * Looks for name, email, phone, links, etc.
 *
 * @param {Array<string>} contactLines
 * @returns {object} - { name, email, phone, links }
 */
function extractContactInfo(contactLines) {
  const contactText = contactLines.join("\n");

  // Basic email regex
  const emailMatch = contactText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const email = emailMatch ? emailMatch[1] : null;

  // Phone pattern (various formats)
  const phoneMatch = contactText.match(
    /(?:\+?1)?[\s.-]?\(?([0-9]{3})\)?[\s.-]?([0-9]{3})[\s.-]?([0-9]{4})/
  );
  const phone = phoneMatch
    ? `${phoneMatch[1]}-${phoneMatch[2]}-${phoneMatch[3]}`
    : null;

  // URLs
  const urlPattern = /(https?:\/\/[^\s]+|(?:www\.|linkedin\.com\/in\/)[^\s]+)/gi;
  const links = contactText.match(urlPattern) || [];

  // Name is usually the first line or first substantial text
  const name = contactLines
    .find((line) => line.trim().length > 0)
    ?.replace(/[^\w\s'-]/g, "")
    ?.trim() || null;

  return {
    name,
    email,
    phone,
    links: [...new Set(links)], // deduplicate
  };
}

/**
 * Extract items from a section (e.g., skill list, certification list)
 * Handles bullet points and comma-separated values
 *
 * @param {Array<string>} lines
 * @returns {Array<string>} - Array of items
 */
function extractItemsFromSection(lines) {
  const items = [];

  for (const line of lines) {
    // Split by common delimiters
    const parts = line
      .split(/[,•\-\n]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    items.push(...parts);
  }

  return items;
}

/**
 * Extract experience entries from experience section
 * Looks for company/role/dates patterns
 *
 * @param {Array<string>} experienceLines
 * @returns {Array<object>} - Array of experience entries
 */
function extractExperiences(experienceLines) {
  const experiences = [];
  let currentEntry = null;

  for (const line of experienceLines) {
    const trimmed = line.trim();

    // Check if line looks like a job title or company (heading)
    if (isLikelyHeading(trimmed)) {
      if (currentEntry) {
        experiences.push(currentEntry);
      }

      currentEntry = {
        title: trimmed,
        description: [],
      };
    } else if (currentEntry && trimmed.length > 0) {
      // Add to current entry description
      currentEntry.description.push(trimmed);
    }
  }

  // Add final entry
  if (currentEntry) {
    experiences.push(currentEntry);
  }

  return experiences;
}

/**
 * Extract education entries from education section
 * Looks for school/degree/dates patterns
 *
 * @param {Array<string>} educationLines
 * @returns {Array<object>} - Array of education entries
 */
function extractEducation(educationLines) {
  const educations = [];
  let currentEntry = null;

  for (const line of educationLines) {
    const trimmed = line.trim();

    // Check for degree keywords
    const degreeMatch = trimmed.match(
      /(Bachelor|Master|PhD|Associate|Diploma|Certificate|BS|BA|MS|MA|MBA)/i
    );

    if (degreeMatch || isLikelyHeading(trimmed)) {
      if (currentEntry) {
        educations.push(currentEntry);
      }

      currentEntry = {
        info: trimmed,
        description: [],
      };
    } else if (currentEntry && trimmed.length > 0) {
      currentEntry.description.push(trimmed);
    }
  }

  if (currentEntry) {
    educations.push(currentEntry);
  }

  return educations;
}

module.exports = {
  detectSections,
  organizeSectionContent,
  extractContactInfo,
  extractItemsFromSection,
  extractExperiences,
  extractEducation,
};
