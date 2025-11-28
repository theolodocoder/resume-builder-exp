/**
 * Resume Parser Orchestrator Service
 * ==================================
 *
 * Main service that orchestrates the entire parsing pipeline:
 * Upload → Extract → Section Detection → Entity Extraction → Normalize → Persist
 *
 * Entity extraction uses regex-based pattern matching for:
 * - Emails, phone numbers, URLs
 * - Company names, dates, and other contact information
 */

const path = require("path");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

const extractTextService = require("./extract-text.service");
const sectionDetectorService = require("./section-detector.service");
const nerService = require("./ner.service");
const normalizeService = require("./normalize.service");

/**
 * Parse a resume file end-to-end
 *
 * @param {string} filePath - Path to uploaded resume file
 * @param {string} fileType - File type (pdf, docx, jpg, etc.)
 * @param {string} fileName - Original file name
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Parsed resume data with confidence score
 */
async function parseResume(filePath, fileType, fileName, options = {}) {
  const jobId = uuidv4();
  const startTime = Date.now();

  try {
    logger.info("Starting resume parsing pipeline", {
      jobId,
      fileName,
      fileType,
    });

    // Step 1: Extract text from file
    logger.info("Step 1: Extracting text from file");
    const rawText = await extractTextService.extractText(filePath, fileType);

    if (!rawText || rawText.trim().length === 0) {
      throw new Error("No text content could be extracted from the file");
    }

    logger.info("Text extraction successful", {
      textLength: rawText.length,
    });

    // Step 2: Split into paragraphs and detect sections
    logger.info("Step 2: Detecting resume sections");
    const paragraphs = rawText.split(/\n\n+/).filter((p) => p.trim());
    const sections = sectionDetectorService.detectSections(paragraphs);

    logger.info("Section detection complete", {
      detectedSections: Object.keys(sections),
    });

    // Step 3: Extract entities using NER
    logger.info("Step 3: Extracting named entities");
    const entities = await nerService.extractEntities(rawText);

    logger.info("Entity extraction complete", {
      entityCount: entities.length,
    });

    // Step 4: Build resume structure from sections
    logger.info("Step 4: Building resume structure");
    const resumeStructure = buildResumeStructure(sections, entities);

    // Step 5: Normalize and validate
    logger.info("Step 5: Normalizing resume data");
    const normalizedResume = normalizeService.normalizeResume(resumeStructure);

    // Calculate confidence score
    const confidence = calculateConfidenceScore(normalizedResume, resumeStructure);

    const result = {
      jobId,
      parsed: normalizedResume,
      confidence,
      metadata: {
        fileType,
        fileName,
        rawTextLength: rawText.length,
        paragraphCount: paragraphs.length,
        detectedSections: Object.keys(sections),
        entityCount: entities.length,
        processingTime: Date.now() - startTime,
      },
    };

    logger.info("Resume parsing complete", {
      jobId,
      confidence: result.confidence.toFixed(2),
      processingTime: result.metadata.processingTime,
    });

    return result;
  } catch (error) {
    logger.error("Resume parsing failed", error);
    throw error;
  }
}

/**
 * Build resume structure from detected sections and entities
 *
 * @param {object} sections - Detected sections from section-detector
 * @param {Array} entities - Extracted entities from NER
 * @returns {object} - Structured resume object
 */
function buildResumeStructure(sections, entities) {
  const resume = {
    contact: {},
    summary: null,
    experiences: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    awards: [],
  };

  // Helper function to split section content into lines
  function getSectionLines(sectionContent) {
    if (!sectionContent) return [];
    return sectionContent
      .flatMap((paragraph) => paragraph.split('\n'))
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  // Extract contact info - check both 'contact' and 'other' sections (first paragraph is often contact)
  const contactLines = sections.contact ? getSectionLines(sections.contact) :
                       (sections.other ? getSectionLines(sections.other) : []);

  if (contactLines.length > 0) {
    resume.contact = sectionDetectorService.extractContactInfo(contactLines);
  }

  // If no contact info found, try to extract from entities
  if (!resume.contact.email && entities) {
    const emailEntity = entities.find((e) => e.label === "EMAIL");
    if (emailEntity) {
      resume.contact.email = emailEntity.text;
    }
  }

  // If still no name, try NER
  if (!resume.contact.name && entities) {
    const nameEntity = entities.find((e) => e.label === "PERSON");
    if (nameEntity) {
      resume.contact.name = nameEntity.text;
    }
  }

  // Extract summary
  if (sections.summary) {
    resume.summary = getSectionLines(sections.summary).join(" ").trim();
  }

  // Extract skills
  if (sections.skills) {
    resume.skills = sectionDetectorService.extractItemsFromSection(
      getSectionLines(sections.skills)
    );
  }

  // Extract experiences
  if (sections.experiences) {
    const expLines = getSectionLines(sections.experiences);
    resume.experiences = sectionDetectorService.extractExperiences(expLines);

    // Enrich with company names from NER
    if (entities) {
      const companies = entities
        .filter((e) => e.label === "ORG")
        .map((e) => e.text);
      resume.experiences.forEach((exp) => {
        if (!exp.company && companies.length > 0) {
          exp.company = companies[0];
        }
      });
    }
  }

  // Extract education
  if (sections.education) {
    const eduLines = getSectionLines(sections.education);
    resume.education = sectionDetectorService.extractEducation(eduLines);
  }

  // Extract certifications
  if (sections.certifications) {
    resume.certifications = sectionDetectorService.extractItemsFromSection(
      getSectionLines(sections.certifications)
    ).map((title) => ({ title }));
  }

  // Extract projects
  if (sections.projects) {
    resume.projects = sectionDetectorService.extractItemsFromSection(
      getSectionLines(sections.projects)
    ).map((title) => ({ title }));
  }

  // Extract languages
  if (sections.languages) {
    resume.languages = sectionDetectorService.extractItemsFromSection(
      getSectionLines(sections.languages)
    );
  }

  // Extract awards
  if (sections.awards) {
    resume.awards = sectionDetectorService.extractItemsFromSection(
      getSectionLines(sections.awards)
    );
  }

  return resume;
}

/**
 * Calculate confidence score for the parsed resume
 * Based on completeness, entity extraction quality, and section detection
 *
 * @param {object} normalizedResume - Normalized resume object
 * @param {object} rawResume - Raw resume structure
 * @returns {number} - Confidence score 0-1
 */
function calculateConfidenceScore(normalizedResume, rawResume) {
  let score = 0.5; // Base score

  // Contact information completeness (20%)
  const contactScore = Object.values(normalizedResume.contact || {}).filter(
    (v) => v
  ).length / 4;
  score += contactScore * 0.2;

  // Experience completeness (20%)
  const expScore = Math.min(
    (normalizedResume.experiences?.length || 0) / 3,
    1
  );
  score += expScore * 0.2;

  // Education completeness (15%)
  const eduScore = Math.min((normalizedResume.education?.length || 0) / 2, 1);
  score += eduScore * 0.15;

  // Skills extraction (15%)
  const skillScore = Math.min((normalizedResume.skills?.length || 0) / 10, 1);
  score += skillScore * 0.15;

  // Other sections (10%)
  const otherScore =
    ((normalizedResume.certifications?.length || 0) +
      (normalizedResume.projects?.length || 0) +
      (normalizedResume.awards?.length || 0)) /
    10;
  score += Math.min(otherScore, 1) * 0.1;

  // Normalize to 0-1
  return Math.min(Math.max(score, 0), 1);
}

/**
 * Save parsed resume to database
 *
 * @param {string} jobId
 * @param {object} parsedData
 * @param {object} metadata
 * @returns {Promise<string>} - Resume ID
 */
async function saveParseResult(jobId, parsedData, metadata) {
  try {
    const { dbRun } = require("../config/database");
    const resumeId = uuidv4();

    await dbRun("insert_resume", {
      id: resumeId,
      file_name: metadata.fileName,
      file_type: metadata.fileType,
      file_url: metadata.fileUrl || "",
      parsed_data: parsedData,
      confidence: metadata.confidence,
      status: "completed",
      user_id: metadata.userId || null, // Preserve for user tracking
      metadata: metadata,
    });

    logger.info("Parse result saved to database", {
      resumeId,
      jobId,
    });

    return resumeId;
  } catch (error) {
    logger.error("Failed to save parse result", error);
    throw error;
  }
}

/**
 * Get parsed resume from database
 *
 * @param {string} resumeId
 * @returns {Promise<object|null>}
 */
async function getParseResult(resumeId) {
  try {
    const { dbGet } = require("../config/database");

    const row = await dbGet("resume", resumeId);

    if (row) {
      return {
        id: row.id,
        parsed: row.parsed_data,
        confidence: row.confidence,
        metadata: row.metadata,
        createdAt: row.created_at,
      };
    }

    return null;
  } catch (error) {
    logger.error("Failed to get parse result", error);
    throw error;
  }
}

/**
 * Get all parsed resumes for a user
 *
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function getUserParseResults(userId, limit = 10) {
  try {
    const { dbAll } = require("../config/database");

    const rows = await dbAll("resumes", { user_id: userId });

    return rows.slice(0, limit).map((row) => ({
      id: row.id,
      file_name: row.file_name,
      confidence: row.confidence,
      created_at: row.created_at,
    }));
  } catch (error) {
    logger.error("Failed to get user parse results", error);
    throw error;
  }
}

module.exports = {
  parseResume,
  buildResumeStructure,
  calculateConfidenceScore,
  saveParseResult,
  getParseResult,
  getUserParseResults,
};
