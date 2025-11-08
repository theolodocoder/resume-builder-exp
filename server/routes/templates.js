/**
 * Resume Template Routes
 * ======================
 * API endpoints for managing and retrieving resume templates
 *
 * Routes:
 * - GET / - List all available templates
 * - GET /:templateId - Get specific template with HTML and CSS
 */

const express = require("express");
const {
  getAvailableTemplates,
  getTemplate,
  isValidTemplate,
} = require("../services/templateManager");

const router = express.Router();

// ============================================================================
// LIST AVAILABLE TEMPLATES
// ============================================================================

/**
 * GET /api/templates
 *
 * Get list of all available resume templates
 *
 * Response:
 * {
 *   templates: [
 *     {
 *       id: "professional",
 *       name: "Professional",
 *       description: "Clean and professional design",
 *       font: "Arial"
 *     },
 *     ...
 *   ]
 * }
 */
router.get("/", async (req, res) => {
  try {
    console.log("Fetching available templates");
    const templates = await getAvailableTemplates();
    res.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error.message);
    res.status(500).json({
      error: "TEMPLATES_FETCH_FAILED",
      message: "Failed to retrieve available templates",
      details: error.message,
    });
  }
});

// ============================================================================
// GET SPECIFIC TEMPLATE
// ============================================================================

/**
 * GET /api/templates/:templateId
 *
 * Get a specific template with its HTML and CSS content
 *
 * Parameters:
 * - templateId: Template identifier (e.g., "professional", "lora", "garamond", "calibri", "compact")
 *
 * Response:
 * {
 *   html: "<html>...</html>",
 *   css: "body { ... }",
 *   id: "professional",
 *   name: "Professional"
 * }
 *
 * Errors:
 * - 404: Template not found
 * - 500: Server error
 */
router.get("/:templateId", async (req, res) => {
  try {
    const { templateId } = req.params;

    // Validate template exists
    if (!isValidTemplate(templateId)) {
      return res.status(404).json({
        error: "TEMPLATE_NOT_FOUND",
        message: `Template not found: ${templateId}`,
        availableTemplates: ["professional", "lora", "garamond", "calibri", "compact"],
      });
    }

    console.log(`Fetching template: ${templateId}`);

    // Retrieve and return template
    const template = await getTemplate(templateId);
    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error.message);
    res.status(500).json({
      error: "TEMPLATE_FETCH_FAILED",
      message: "Failed to retrieve template",
      details: error.message,
    });
  }
});

module.exports = router;
