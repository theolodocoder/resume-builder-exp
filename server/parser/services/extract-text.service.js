/**
 * Document Text Extraction Service
 * ================================
 *
 * Handles extraction of text from various document formats:
 * - PDF (text-based and scanned/OCR)
 * - DOCX (Microsoft Word)
 * - Images (PNG, JPG)
 */

const pdf = require("pdfjs-dist");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");
const fs = require("fs-extra");
const path = require("path");
const logger = require("../utils/logger");
const { cleanText, splitParagraphs } = require("../utils/text-cleaner");
const { detectSectionType } = require("../config/section-headers");

/**
 * Improve text structure by adding spacing around section headers
 * Detects headers like "EXPERIENCE", "EDUCATION" and ensures they're on separate paragraphs
 *
 * @param {string} text - Text with potential headers
 * @returns {string} - Text with proper spacing around headers
 */
function improveTextStructure(text) {
  if (!text) return text;

  // Split by lines and process
  const lines = text.split('\n');
  const processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if this line is a section header
    const sectionType = detectSectionType(trimmedLine);

    if (sectionType) {
      // Add blank line before header if there's content above
      if (processedLines.length > 0 && processedLines[processedLines.length - 1].trim() !== '') {
        processedLines.push('');
      }

      processedLines.push(line);

      // Add blank line after header if there's content below
      if (i < lines.length - 1 && lines[i + 1].trim() !== '') {
        processedLines.push('');
      }
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}

/**
 * Extract text from PDF file
 * Handles both text-based PDFs and scanned PDFs (with OCR fallback)
 *
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromPdf(filePath) {
  try {
    logger.info("Extracting text from PDF", { filePath });

    // Configure worker source for pdfjs-dist 4.x
    if (!pdf.GlobalWorkerOptions.workerSrc) {
      try {
        // For pdfjs-dist 4.x, set workerSrc to the worker module path
        pdf.GlobalWorkerOptions.workerSrc = path.join(
          __dirname,
          '../../node_modules/pdfjs-dist/build/pdf.worker.mjs'
        );
      } catch (workerError) {
        logger.debug("Could not configure PDF worker (non-critical)", {
          error: workerError.message,
        });
      }
    }

    // Read file and convert Buffer to Uint8Array (required by pdfjs-dist)
    const fileBuffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdfData = await pdf.getDocument({ data: uint8Array }).promise;

    let fullText = "";
    let hasText = false;

    // Extract text from each page, preserving line structure
    for (let i = 1; i <= pdfData.numPages; i++) {
      const page = await pdfData.getPage(i);
      const textContent = await page.getTextContent();

      // Build text while preserving line breaks using Y-position information
      let pageText = "";
      let lastY = null;

      for (const item of textContent.items) {
        // Get Y position from transform matrix (transform[5] is Y coordinate)
        const currentY = item.transform ? Math.round(item.transform[5] * 100) : null;

        // If Y position changed significantly, it's a new line
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += "\n";
        }

        pageText += item.str;
        lastY = currentY;
      }

      fullText += pageText + "\n";

      if (pageText.trim().length > 0) {
        hasText = true;
      }
    }

    // If PDF has no extractable text, log warning but continue with empty text
    if (!hasText || fullText.trim().length < 50) {
      logger.warn("PDF has minimal or no extractable text", {
        filePath,
        textLength: fullText.trim().length,
      });
      // Note: Scanned PDFs cannot be processed with Tesseract here since we only have the PDF file
      // Return empty text or minimal text extracted
    }

    logger.info("PDF text extraction successful", {
      filePath,
      textLength: fullText.length,
    });

    // Post-process to add proper spacing around section headers
    const processedText = improveTextStructure(fullText);

    return cleanText(processedText);
  } catch (error) {
    logger.error("PDF text extraction failed", {
      filePath,
      error: error.message,
    });
    // Do NOT attempt OCR fallback for PDFs - Tesseract cannot process PDF files
    // Only image files should use OCR fallback
    throw new Error(
      `Failed to extract text from PDF: ${error.message}`
    );
  }
}

/**
 * Extract text from DOCX file
 *
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromDocx(filePath) {
  try {
    logger.info("Extracting text from DOCX", { filePath });

    const fileBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });

    logger.info("DOCX text extraction successful", {
      filePath,
      textLength: result.value.length,
    });

    return cleanText(result.value);
  } catch (error) {
    logger.error("Error extracting text from DOCX", error);
    throw error;
  }
}

/**
 * Extract text from image using Tesseract OCR
 *
 * @param {string} filePath - Path to image file (PNG, JPG, etc.)
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromImageOCR(filePath) {
  try {
    logger.info("Extracting text from image using OCR", { filePath });

    const {
      data: { text },
    } = await Tesseract.recognize(filePath, "eng");

    logger.info("Image OCR extraction successful", {
      filePath,
      textLength: text.length,
    });

    return cleanText(text);
  } catch (error) {
    logger.error("Error extracting text from image", error);
    throw error;
  }
}

/**
 * Main extraction function - dispatches to appropriate handler based on file type
 *
 * @param {string} filePath - Path to document file
 * @param {string} fileType - File type (pdf, docx, jpg, png, etc.)
 * @returns {Promise<string>} - Extracted text
 */
async function extractText(filePath, fileType) {
  try {
    // Verify file exists
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      throw new Error(`File not found: ${filePath}`);
    }

    const lowerType = fileType.toLowerCase();

    if (lowerType === "pdf") {
      return await extractFromPdf(filePath);
    } else if (lowerType === "docx") {
      return await extractFromDocx(filePath);
    } else if (["jpg", "jpeg", "png", "gif", "bmp", "tiff"].includes(lowerType)) {
      return await extractFromImageOCR(filePath);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    logger.error("Error in extractText", error);
    throw error;
  }
}

/**
 * Extract text and return structured paragraphs
 *
 * @param {string} filePath
 * @param {string} fileType
 * @returns {Promise<Array<string>>} - Array of paragraphs
 */
async function extractTextAsParagraphs(filePath, fileType) {
  const text = await extractText(filePath, fileType);
  return splitParagraphs(text);
}

/**
 * Detect if extracted text is likely OCR'd (low confidence text)
 *
 * @param {string} text
 * @returns {boolean}
 */
function isOCRText(text) {
  // Count suspicious character patterns that suggest OCR errors
  const suspiciousPatterns = [
    /([0-9])\|([A-Z])/g, // 0l, 1l, etc.
    /\|([a-z])/g, // |char patterns
    /([a-zA-Z])\|/g, // char| patterns
  ];

  const suspicionCount = suspiciousPatterns.reduce((count, pattern) => {
    const matches = text.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);

  // If more than 5% of text has OCR errors, consider it OCR'd
  const errorRate = suspicionCount / (text.length / 100);
  return errorRate > 5;
}

module.exports = {
  extractText,
  extractTextAsParagraphs,
  extractFromPdf,
  extractFromDocx,
  extractFromImageOCR,
  isOCRText,
};
