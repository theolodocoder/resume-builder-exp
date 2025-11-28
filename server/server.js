/**
 * Resume Builder Server
 * =====================
 * Express.js server for generating PDF and DOCX resumes
 *
 * Features:
 * - PDF generation using Puppeteer
 * - DOCX generation using docx library
 * - Multiple resume templates support
 * - CORS-enabled for cross-origin requests
 *
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs-extra");
const generateRoutes = require("./routes/generate");
const templateRoutes = require("./routes/templates");
const parserRoutes = require("./routes/parser.routes");
const { initializeQueue } = require("./parser/queues/resume-queue");
const { startWorker } = require("./parser/workers/resume-parser.worker");
const { initDatabase } = require("./parser/config/database");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON with 10MB limit for large resume data
app.use(express.json({ limit: "10mb" }));

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * Health check endpoint
 * Returns server status for monitoring and uptime checks
 */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * Template Routes
 * GET /api/templates - List all available templates
 * GET /api/templates/:id - Get specific template details
 */
app.use("/api/templates", templateRoutes);

/**
 * Generation Routes
 * POST /api/generate/pdf - Generate resume as PDF
 * POST /api/generate/docx - Generate resume as DOCX
 */
app.use("/api/generate", generateRoutes);

/**
 * Parser Routes
 * POST /api/parser/upload - Upload resume for parsing
 * GET /api/parser/jobs/:jobId - Get job status
 * GET /api/parser/results/:resumeId - Get parsed result
 * GET /api/parser/user/:userId/resumes - Get user's resumes
 * GET /api/parser/stats - Queue statistics
 */
app.use("/api/parser", parserRoutes);

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Initialize parser services
 * Sets up database, queue, and worker
 */
async function initializeParserServices() {
  try {
    console.log("Initializing parser services...");

    // Create uploads directory with absolute path
    const uploadsDir = path.resolve(path.join(__dirname, "uploads"));
    await fs.ensureDir(uploadsDir);
    console.log(`✓ Uploads directory ready: ${uploadsDir}`);

    // Initialize database
    await initDatabase();
    console.log("✓ Database initialized");

    // Initialize queue
    initializeQueue();
    console.log("✓ Job queue initialized");

    // Initialize and start the worker process
    const worker = await startWorker();
    console.log("✓ Job worker started");

    console.log("✓ Parser services initialized successfully");
  } catch (error) {
    console.error("Failed to initialize parser services:", error);
    process.exit(1);
  }
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

(async () => {
  // Initialize parser services
  await initializeParserServices();

  // Start Express server
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ Server is running on http://localhost:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
    console.log(`✓ API endpoints: http://localhost:${PORT}/api/`);
    console.log(`✓ Parser API: http://localhost:${PORT}/api/parser`);
  });
})();
