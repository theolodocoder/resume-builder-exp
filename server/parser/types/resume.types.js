/**
 * Resume Parsing Types and Interfaces
 * ====================================
 *
 * This file defines all TypeScript-like types for the resume parsing system.
 * Used for validation and structuring of parsed resume data.
 */

/**
 * @typedef {Object} Contact
 * @property {string} [name] - Full name of the person
 * @property {string} [email] - Email address
 * @property {string} [phone] - Phone number
 * @property {string} [location] - City, country
 * @property {Array<string>} [links] - LinkedIn, portfolio, website URLs
 */

/**
 * @typedef {Object} Experience
 * @property {string} [company] - Company name
 * @property {string} [role] - Job title/position
 * @property {string} [startDate] - Start date (YYYY-MM format)
 * @property {string} [endDate] - End date (YYYY-MM or "Present")
 * @property {Array<string>} [description] - Bullet points/description
 */

/**
 * @typedef {Object} Education
 * @property {string} [school] - University/School name
 * @property {string} [degree] - Degree (Bachelor's, Master's, PhD, etc.)
 * @property {string} [field] - Field of study
 * @property {string} [startDate] - Start date (YYYY-MM format)
 * @property {string} [endDate] - Graduation date (YYYY-MM or "Present")
 */

/**
 * @typedef {Object} Certification
 * @property {string} [title] - Certification title
 * @property {string} [issuer] - Organization that issued it
 * @property {string} [issueDate] - Issue date (YYYY-MM format)
 * @property {string} [expiryDate] - Expiry date if applicable
 */

/**
 * @typedef {Object} Project
 * @property {string} [title] - Project title
 * @property {string} [description] - Project description
 * @property {Array<string>} [technologies] - Tech stack used
 * @property {string} [link] - GitHub or project link
 */

/**
 * @typedef {Object} ParsedResume
 * @property {Contact} [contact] - Contact information
 * @property {string} [summary] - Professional summary
 * @property {Array<string>} [skills] - List of skills
 * @property {Array<Experience>} [experiences] - Work experience
 * @property {Array<Education>} [education] - Educational background
 * @property {Array<Certification>} [certifications] - Certifications
 * @property {Array<Project>} [projects] - Notable projects
 * @property {Array<string>} [languages] - Languages spoken
 * @property {Array<string>} [awards] - Awards and honors
 */

/**
 * @typedef {Object} NEREntity
 * @property {string} label - Entity type (NAME, EMAIL, PHONE, COMPANY, etc.)
 * @property {string} text - Extracted text
 * @property {number} [confidence] - Confidence score (0-1)
 */

/**
 * @typedef {Object} ParseJob
 * @property {string} id - Unique job ID (UUID)
 * @property {string} fileUrl - Path or URL to uploaded file
 * @property {string} fileName - Original file name
 * @property {string} fileType - File type (pdf, docx, jpg, png, etc.)
 * @property {string} status - Job status (pending, processing, completed, failed)
 * @property {ParsedResume} [parsedData] - Parsed resume data
 * @property {string} [error] - Error message if parsing failed
 * @property {number} [confidence] - Overall parsing confidence (0-1)
 * @property {number} createdAt - Timestamp when job was created
 * @property {number} updatedAt - Timestamp when job was last updated
 */

module.exports = {
  // This file is for type documentation
  // In a real TypeScript project, these would be proper interfaces
};
