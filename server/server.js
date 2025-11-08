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
const generateRoutes = require("./routes/generate");
const templateRoutes = require("./routes/templates");

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

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API endpoints: http://localhost:${PORT}/api/`);
});
