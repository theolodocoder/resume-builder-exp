/**
 * Resume Generation Routes
 * ========================
 * Handles PDF and DOCX resume generation from user data
 *
 * Routes:
 * - POST /pdf - Generate resume as PDF with selected template
 * - POST /docx - Generate resume as DOCX format
 */

const express = require("express");
const { generatePdf } = require("../services/pdfGenerator");
const { generateDocx } = require("../services/docxGenerator");
const router = express.Router();

// ============================================================================
// PDF GENERATION ENDPOINT
// ============================================================================

/**
 * POST /api/generate/pdf
 *
 * Generate a resume in PDF format
 *
 * Query Parameters:
 * - template (optional): Template ID to use (default: "professional")
 *   Available: professional, lora, garamond, calibri, compact
 *
 * Request Body: Resume data object
 * {
 *   contact: { fullName, email, phone, location, linkedin, website },
 *   summary: string,
 *   experience: Array<{ company, position, startDate, endDate, description }>,
 *   education: Array<{ school, degree, field, graduationDate }>,
 *   projects: Array<{ title, description, link }>,
 *   skills: Array<string>,
 *   certifications: Array<{ title, issuer, issueDate }>,
 *   awards: Array<{ title, issuer }>,
 *   languages: Array<string>,
 *   interests: Array<string>
 * }
 *
 * Response: Binary PDF file
 * Headers: Content-Type: application/pdf
 */
router.post("/pdf", async (req, res) => {
  try {
    const data = req.body;
    const templateId = req.query.template || "professional";

    // Validate request body
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "No resume data provided in request body",
      });
    }

    console.log(`Generating PDF with template: ${templateId}`);

    // Generate PDF with template selection and retry logic
    const pdfBuffer = await generatePdf(data, templateId);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="resume.pdf"');
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error.message);
    res.status(500).json({
      error: "PDF_GENERATION_FAILED",
      message: "Failed to generate PDF resume",
      details: error.message,
    });
  }
});

// ============================================================================
// DOCX GENERATION ENDPOINT
// ============================================================================

/**
 * POST /api/generate/docx
 *
 * Generate a resume in DOCX (Word) format
 *
 * Request Body: Resume data object (same structure as PDF endpoint)
 *
 * Response: Binary DOCX file
 * Headers: Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
 */
router.post("/docx", async (req, res) => {
  try {
    const data = req.body;

    // Validate request body
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "No resume data provided in request body",
      });
    }

    console.log("Generating DOCX resume");

    // Generate DOCX document
    const docxBuffer = await generateDocx(data);

    // Set response headers for DOCX download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader('Content-Disposition', 'attachment; filename="resume.docx"');
    res.setHeader("Content-Length", docxBuffer.length);

    // Send the DOCX buffer
    res.send(docxBuffer);
  } catch (error) {
    console.error("DOCX generation error:", error.message);
    res.status(500).json({
      error: "DOCX_GENERATION_FAILED",
      message: "Failed to generate DOCX resume",
      details: error.message,
    });
  }
});

module.exports = router;
