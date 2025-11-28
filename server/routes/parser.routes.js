/**
 * Resume Parser Routes
 * ====================
 *
 * API endpoints for resume parsing functionality
 * - POST /upload - Upload and parse resume
 * - GET /jobs/:jobId - Get job status
 * - GET /results/:resumeId - Get parsed result
 * - GET /user/:userId/resumes - Get user's parsed resumes
 * - GET /stats - Queue statistics
 * - GET /health - Health check
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const controller = require("../parser/controllers/resume-parser.controller");

// ============================================================================
// MULTER CONFIGURATION
// ============================================================================

// Use absolute path to ensure consistency across different working directories
const uploadDir = path.resolve(path.join(__dirname, "../uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/parser/health
 * Health check endpoint
 */
router.get("/health", controller.healthCheck);

// ============================================================================
// RESUME UPLOAD AND PARSING
// ============================================================================

/**
 * POST /api/parser/upload
 * Upload resume file and start parsing job
 *
 * Form Data:
 * - file (required) - Resume file (PDF, DOCX, JPG, PNG, etc.)
 * - userId (optional) - User ID for tracking
 *
 * Response:
 * {
 *   jobId: string,
 *   message: string,
 *   status: "pending",
 *   statusUrl: string
 * }
 */
router.post("/upload", upload.single("file"), controller.uploadResume);

// ============================================================================
// JOB STATUS
// ============================================================================

/**
 * GET /api/parser/jobs/:jobId
 * Get status of a parsing job
 *
 * Response:
 * {
 *   jobId: string,
 *   status: "pending" | "active" | "completed" | "failed",
 *   progress: number (0-100),
 *   attempts: number,
 *   result?: object (if completed),
 *   error?: string (if failed)
 * }
 */
router.get("/jobs/:jobId", controller.getJobStatusEndpoint);

// ============================================================================
// PARSED RESULTS
// ============================================================================

/**
 * GET /api/parser/results/:resumeId
 * Get parsed resume data
 *
 * Response:
 * {
 *   resumeId: string,
 *   parsed: object,
 *   confidence: number (0-1),
 *   metadata: object,
 *   createdAt: string
 * }
 */
router.get("/results/:resumeId", controller.getParseResultEndpoint);

// ============================================================================
// USER RESUMES
// ============================================================================

/**
 * GET /api/parser/user/:userId/resumes
 * Get all parsed resumes for a user
 *
 * Query Parameters:
 * - limit (optional, default: 10) - Number of results to return
 *
 * Response:
 * {
 *   userId: string,
 *   resumes: Array,
 *   count: number
 * }
 */
router.get("/user/:userId/resumes", controller.getUserResumesEndpoint);

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * GET /api/parser/stats
 * Get queue statistics
 *
 * Response:
 * {
 *   queue: {
 *     waiting: number,
 *     active: number,
 *     completed: number,
 *     failed: number
 *   }
 * }
 */
router.get("/stats", controller.getStatsEndpoint);

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Multer error handler
 */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(400).json({
        error: "File too large",
        message: "Maximum file size is 10MB",
      });
    }
    return res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
  }

  next();
});

module.exports = router;
