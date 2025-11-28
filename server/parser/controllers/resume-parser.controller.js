/**
 * Resume Parser Controller
 * ======================
 *
 * Handles HTTP requests for resume parsing operations:
 * - File upload and job creation
 * - Job status checking
 * - Result retrieval
 */

const path = require("path");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");
const { addParsingJob, getJobStatus, getQueueStats } = require("../queues/resume-queue");
const { getParseResult, getUserParseResults } = require("../services/parser-orchestrator.service");

/**
 * Upload resume and start parsing job
 * POST /api/parser/upload
 *
 * @param {Request} req
 * @param {Response} res
 */
async function uploadResume(req, res) {
  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: "No file provided",
        message: "Please upload a resume file",
      });
    }

    const { filename, path: filePath, mimetype } = req.file;
    const { userId } = req.body;

    // Convert to absolute path to ensure it works in worker process
    const absoluteFilePath = path.resolve(filePath);

    // Determine file type
    const fileExt = path.extname(filename).substring(1).toLowerCase();
    const allowedTypes = ["pdf", "docx", "doc", "jpg", "jpeg", "png", "gif", "bmp"];

    if (!allowedTypes.includes(fileExt)) {
      return res.status(400).json({
        error: "Unsupported file type",
        message: `Supported formats: ${allowedTypes.join(", ")}`,
      });
    }

    logger.info("Resume upload received", {
      fileName: filename,
      fileType: fileExt,
      userId,
      uploadPath: absoluteFilePath,
    });

    // Create parsing job
    const jobData = {
      filePath: absoluteFilePath,
      fileType: fileExt,
      fileName: filename,
      userId: userId || null,
      uploadedAt: new Date().toISOString(),
      options: {
        language: req.body.language || "en",
      },
    };

    const job = await addParsingJob(jobData);

    logger.info("Parsing job created", {
      jobId: job.id,
      fileName: filename,
      filePath: absoluteFilePath,
    });

    res.status(202).json({
      jobId: job.id,
      message: "Resume parsing started",
      status: "pending",
      statusUrl: `/api/parser/jobs/${job.id}`,
    });
  } catch (error) {
    logger.error("Resume upload failed", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * Get job status
 * GET /api/parser/jobs/:jobId
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getJobStatusEndpoint(req, res) {
  try {
    const { jobId } = req.params;

    const jobStatus = await getJobStatus(jobId);

    if (!jobStatus) {
      return res.status(404).json({
        error: "Job not found",
        message: `No job found with ID: ${jobId}`,
      });
    }

    // Build response
    const response = {
      jobId: jobStatus.id,
      status: jobStatus.state,
      progress: jobStatus.progress || 0,
      attempts: jobStatus.attempts,
    };

    // Include result if completed
    if (jobStatus.state === "completed" && jobStatus.result) {
      response.result = jobStatus.result;
    }

    // Include error if failed
    if (jobStatus.state === "failed") {
      response.error = jobStatus.error || jobStatus.data?.error || "Job processing failed";
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error("Failed to get job status", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * Get parsed result
 * GET /api/parser/results/:resumeId
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getParseResultEndpoint(req, res) {
  try {
    const { resumeId } = req.params;

    const result = await getParseResult(resumeId);

    if (!result) {
      return res.status(404).json({
        error: "Result not found",
        message: `No parsed resume found with ID: ${resumeId}`,
      });
    }

    res.status(200).json({
      resumeId: result.id,
      parsed: result.parsed,
      confidence: result.confidence,
      metadata: result.metadata,
      createdAt: result.createdAt,
    });
  } catch (error) {
    logger.error("Failed to get parse result", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * Get user's parsed resumes
 * GET /api/parser/user/:userId/resumes
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getUserResumesEndpoint(req, res) {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit || "10");

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Invalid limit",
        message: "Limit must be between 1 and 100",
      });
    }

    const resumes = await getUserParseResults(userId, limit);

    res.status(200).json({
      userId,
      resumes,
      count: resumes.length,
    });
  } catch (error) {
    logger.error("Failed to get user resumes", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * Get queue statistics
 * GET /api/parser/stats
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getStatsEndpoint(req, res) {
  try {
    const stats = await getQueueStats();

    res.status(200).json({
      queue: {
        waiting: stats.waiting,
        active: stats.active,
        completed: stats.completed,
        failed: stats.failed,
      },
    });
  } catch (error) {
    logger.error("Failed to get stats", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * Health check
 * GET /api/parser/health
 *
 * @param {Request} req
 * @param {Response} res
 */
async function healthCheck(req, res) {
  try {
    res.status(200).json({
      status: "OK",
      service: "resume-parser",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
}

module.exports = {
  uploadResume,
  getJobStatusEndpoint,
  getParseResultEndpoint,
  getUserResumesEndpoint,
  getStatsEndpoint,
  healthCheck,
};
