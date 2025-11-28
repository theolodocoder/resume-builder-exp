/**
 * Resume Data Normalization Service
 * =================================
 *
 * Cleans, validates, and standardizes parsed resume data
 * Ensures consistent formatting across all sections
 */

const {
  deduplicateItems,
  titleCase,
  normalizeSpaces,
  normalizeUrl,
} = require("../utils/text-cleaner");
const { parseDate, isValidDate } = require("../utils/date-utils");
const logger = require("../utils/logger");

/**
 * Normalize contact information
 * @param {object} contact
 * @returns {object}
 */
function normalizeContact(contact) {
  if (!contact) return {};

  return {
    name: contact.name ? normalizeSpaces(contact.name) : null,
    email: contact.email ? contact.email.toLowerCase().trim() : null,
    phone: contact.phone
      ? normalizePhoneNumber(contact.phone)
      : null,
    location: contact.location
      ? normalizeSpaces(contact.location)
      : null,
    links: (contact.links || [])
      .map((link) => normalizeUrl(link))
      .filter((link) => link !== null),
  };
}

/**
 * Normalize phone number
 * @param {string} phone
 * @returns {string|null}
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, "");

  // International format with +
  if (normalized.startsWith("+")) {
    return normalized;
  }

  // US format
  if (normalized.length === 10) {
    return `+1${normalized}`;
  }

  // Already has country code
  if (normalized.length >= 11) {
    return `+${normalized}`;
  }

  return null;
}

/**
 * Normalize email address
 * @param {string} email
 * @returns {string|null}
 */
function normalizeEmail(email) {
  if (!email) return null;

  const normalized = email.toLowerCase().trim();

  // Basic email validation
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return normalized;
  }

  return null;
}

/**
 * Normalize skill list
 * @param {Array<string>} skills
 * @returns {Array<string>}
 */
function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];

  return deduplicateItems(
    skills
      .map((skill) => normalizeSpaces(skill))
      .map((skill) => titleCase(skill))
      .filter((skill) => skill.length > 0)
  );
}

/**
 * Normalize experience entry
 * @param {object} experience
 * @returns {object}
 */
function normalizeExperience(experience) {
  if (!experience) return {};

  const normalized = {
    company: experience.company
      ? normalizeSpaces(experience.company)
      : null,
    role: experience.role ? normalizeSpaces(experience.role) : null,
    startDate: experience.startDate
      ? parseDate(experience.startDate)
      : null,
    endDate: experience.endDate
      ? parseDate(experience.endDate)
      : null,
    description: Array.isArray(experience.description)
      ? experience.description
          .map((d) => normalizeSpaces(d))
          .filter((d) => d.length > 0)
      : [],
  };

  // Validate dates
  if (normalized.startDate && !isValidDate(normalized.startDate)) {
    normalized.startDate = null;
  }
  if (normalized.endDate && !isValidDate(normalized.endDate)) {
    normalized.endDate = null;
  }

  return normalized;
}

/**
 * Normalize education entry
 * @param {object} education
 * @returns {object}
 */
function normalizeEducation(education) {
  if (!education) return {};

  return {
    school: education.school
      ? normalizeSpaces(education.school)
      : null,
    degree: education.degree
      ? normalizeSpaces(education.degree)
      : null,
    field: education.field ? normalizeSpaces(education.field) : null,
    startDate: education.startDate
      ? parseDate(education.startDate)
      : null,
    endDate: education.endDate
      ? parseDate(education.endDate)
      : null,
  };
}

/**
 * Normalize certification
 * @param {object} certification
 * @returns {object}
 */
function normalizeCertification(certification) {
  if (!certification) return {};

  return {
    title: certification.title
      ? normalizeSpaces(certification.title)
      : null,
    issuer: certification.issuer
      ? normalizeSpaces(certification.issuer)
      : null,
    issueDate: certification.issueDate
      ? parseDate(certification.issueDate)
      : null,
    expiryDate: certification.expiryDate
      ? parseDate(certification.expiryDate)
      : null,
  };
}

/**
 * Normalize project entry
 * @param {object} project
 * @returns {object}
 */
function normalizeProject(project) {
  if (!project) return {};

  return {
    title: project.title ? normalizeSpaces(project.title) : null,
    description: project.description
      ? normalizeSpaces(project.description)
      : null,
    technologies: Array.isArray(project.technologies)
      ? normalizeSkills(project.technologies)
      : [],
    link: project.link ? normalizeUrl(project.link) : null,
  };
}

/**
 * Normalize complete resume object
 * @param {object} resume
 * @returns {object}
 */
function normalizeResume(resume) {
  if (!resume) return {};

  logger.info("Normalizing resume data");

  const normalized = {
    contact: normalizeContact(resume.contact || {}),
    summary: resume.summary
      ? normalizeSpaces(resume.summary)
      : null,
    skills: normalizeSkills(resume.skills || []),
    experiences: (resume.experiences || [])
      .map((exp) => normalizeExperience(exp))
      .filter((exp) => exp.company || exp.role),
    education: (resume.education || [])
      .map((edu) => normalizeEducation(edu))
      .filter((edu) => edu.school || edu.degree),
    certifications: (resume.certifications || [])
      .map((cert) => normalizeCertification(cert))
      .filter((cert) => cert.title || cert.issuer),
    projects: (resume.projects || [])
      .map((proj) => normalizeProject(proj))
      .filter((proj) => proj.title),
    languages: deduplicateItems(
      (resume.languages || [])
        .map((lang) => normalizeSpaces(lang))
        .filter((lang) => lang.length > 0)
    ),
    awards: deduplicateItems(
      (resume.awards || [])
        .map((award) => normalizeSpaces(award))
        .filter((award) => award.length > 0)
    ),
  };

  logger.info("Resume normalization complete", {
    skillsCount: normalized.skills.length,
    experienceCount: normalized.experiences.length,
    educationCount: normalized.education.length,
  });

  return normalized;
}

module.exports = {
  normalizeContact,
  normalizePhoneNumber,
  normalizeEmail,
  normalizeSkills,
  normalizeExperience,
  normalizeEducation,
  normalizeCertification,
  normalizeProject,
  normalizeResume,
};
