import { ResumeData } from "@/components/ResumeBuilder/ResumeBuilder";

/**
 * API Service for Resume Generation
 * 
 * This file contains stub functions for backend integration.
 * Replace the TODO comments with actual API calls to your backend.
 */

/**
 * Generate a PDF resume from the provided resume data
 *
 * @param resumeData - The complete resume data object
 * @returns Promise that resolves when PDF is downloaded
 */
export async function generatePdfApi(resumeData: ResumeData, templateId: string = "professional"): Promise<void> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate/pdf?template=${templateId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to generate PDF: ${response.statusText}`
      );
    }

    const blob = await response.blob();

    // Create and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resumeData.contact.fullName || "Resume"}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
}

/**
 * Generate a DOCX resume from the provided resume data
 *
 * @param resumeData - The complete resume data object
 * @returns Promise that resolves when DOCX is downloaded
 */
export async function generateDocxApi(resumeData: ResumeData): Promise<void> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate/docx`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to generate DOCX: ${response.statusText}`
      );
    }

    const blob = await response.blob();

    // Create and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resumeData.contact.fullName || "Resume"}_Resume.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("DOCX generation error:", error);
    throw error;
  }
}

/**
 * Generate a template preview as HTML
 *
 * @param resumeData - The complete resume data object
 * @param templateId - The template ID to preview (default: "professional")
 * @returns Promise that resolves to the HTML string
 */
export async function getTemplatePreviewApi(resumeData: ResumeData, templateId: string = "professional"): Promise<string> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate/preview?template=${templateId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumeData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to generate preview: ${response.statusText}`
      );
    }

    const html = await response.text();
    return html;
  } catch (error) {
    console.error("Preview generation error:", error);
    throw error;
  }
}
