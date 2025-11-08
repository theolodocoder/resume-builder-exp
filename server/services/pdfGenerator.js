/**
 * PDF Resume Generator Service
 * ===========================
 * Generates PDF resumes using Puppeteer and Handlebars templating
 *
 * Features:
 * - Browser instance pooling with connection validation
 * - Automatic retry logic for connection failures
 * - Template-based rendering with Handlebars
 * - Custom styling and font support
 * - Optimized memory and resource management
 *
 * Dependencies:
 * - puppeteer: Headless browser automation
 * - handlebars: Template rendering
 * - fs-extra: File system utilities
 */

const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");
const { pathToFileURL } = require("url");
const { transformResumeData } = require("./dataTransformer");
const { loadTemplate } = require("./templateManager");

// ============================================================================
// CONFIGURATION
// ============================================================================

// Get the absolute path to the 'templates' directory
const TEMPLATES_DIR_PATH = path.resolve(__dirname, "../templates");
// Convert it to a 'file://' URL that Puppeteer's browser can understand
// This enables proper resource loading in the headless browser
const TEMPLATES_BASE_URL = pathToFileURL(TEMPLATES_DIR_PATH).href;

let browserInstance = null;
let browserLaunchPromise = null;

// ============================================================================
// BROWSER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Validate browser connection
 * Checks if the browser instance is still connected and responsive
 */
const isBrowserConnected = async (browser) => {
  try {
    if (!browser) return false;
    return (await browser.version()) ? true : false;
  } catch (error) {
    return false;
  }
};

// Close browser safely
const closeBrowser = async () => {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (error) {
      console.error("Error closing browser:", error);
    }
    browserInstance = null;
  }
};

const getBrowser = async (forceNew = false) => {
  // If forceNew is true, close existing browser and create a new one
  if (forceNew && browserInstance) {
    await closeBrowser();
  }

  // Validate existing browser connection
  if (browserInstance && (await isBrowserConnected(browserInstance))) {
    return browserInstance;
  }

  // Reset if browser is dead
  if (browserInstance) {
    await closeBrowser();
  }

  // Prevent concurrent browser launches
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = (async () => {
    try {
      browserInstance = await puppeteer.launch({
        headless: "new",
        timeout: 30000,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          // REMOVED: --single-process (causes crashes and connection issues)
          "--disable-background-networking",
          "--disable-client-side-phishing-detection",
          "--disable-default-apps",
          "--disable-hang-monitor",
          "--disable-popup-blocking",
          "--disable-prompt-on-repost",
          "--disable-sync",
          "--enable-automation",
          "--no-default-browser-check",
          "--disable-extensions",
        ],
      });

      // Handle browser disconnection
      browserInstance.on("disconnected", async () => {
        console.warn("Browser disconnected unexpectedly");
        browserInstance = null;
      });

      return browserInstance;
    } finally {
      browserLaunchPromise = null;
    }
  })();

  return browserLaunchPromise;
};

// ============================================================================
// PDF GENERATION FUNCTION
// ============================================================================

/**
 * Generate PDF resume from resume data
 *
 * @param {Object} data - Resume data object with contact, experience, education, etc.
 * @param {string} templateId - Template to use (default: "professional")
 * @param {number} maxRetries - Maximum retry attempts for connection failures (default: 2)
 * @returns {Promise<Buffer>} PDF file buffer
 *
 * Process:
 * 1. Load template HTML and CSS from templates directory
 * 2. Register Handlebars helpers for template rendering
 * 3. Transform resume data to template format
 * 4. Compile and render template with data
 * 5. Launch browser and render HTML to PDF
 * 6. Return PDF buffer
 *
 * Error Handling:
 * - Retries on connection errors (ECONNRESET, WebSocket disconnects)
 * - Validates browser connection before use
 * - Closes pages and browser instances on errors
 */
const generatePdf = async (data, templateId = "professional", maxRetries = 2) => {
  let retryCount = 0;
  let lastError;

  while (retryCount <= maxRetries) {
    const browser = await getBrowser(retryCount > 0);
    let page = null;

    try {
      // 1. Load template (HTML and CSS)
      const { html: templateHtml, css: templateCss } = await loadTemplate(templateId);

      // 2. Register any Handlebars helpers
      handlebars.registerHelper("eq", (a, b) => a === b);

      // 3. Compile the HTML template
      const template = handlebars.compile(templateHtml);

      // 4. Transform client data to template format
      const transformedData = transformResumeData(data);

      // 5. Render the final HTML, injecting data, styles, AND the base URL
      const finalHtml = template({
        ...transformedData,
        styles: templateCss,
        templatesBaseUrl: TEMPLATES_BASE_URL,
      });

      page = await browser.newPage();

      // Set timeout for page operations
      page.setDefaultNavigationTimeout(30000);
      page.setDefaultTimeout(30000);

      // 5. Set content and wait
      await page.setContent(finalHtml, { waitUntil: "domcontentloaded" });

      // 6. Generate the PDF
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "0.75in",
          right: "0.75in",
          bottom: "0.75in",
          left: "0.75in",
        },
      });

      return pdfBuffer;
    } catch (error) {
      lastError = error;
      console.error(
        `PDF generation attempt ${retryCount + 1} failed:`,
        error.message
      );

      // Close page if it exists
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.error("Error closing page:", e);
        }
      }

      // If this is a connection error and we have retries left, try again
      if (
        (error.message.includes("ECONNRESET") ||
          error.message.includes("disconnected") ||
          error.message.includes("WebSocket")) &&
        retryCount < maxRetries
      ) {
        console.log(
          `Retrying PDF generation (attempt ${retryCount + 2}/${
            maxRetries + 1
          })`
        );
        retryCount++;
        // Force a new browser connection on retry
        await closeBrowser();
        continue;
      }

      // If not a retryable error or out of retries, throw
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  throw lastError;
};

module.exports = { generatePdf };
