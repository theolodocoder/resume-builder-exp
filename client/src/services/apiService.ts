import { ResumeData } from "@/components/ResumeBuilder/ResumeBuilder";

/**
 * API Service for Resume Generation and Parsing
 *
 * Functions for:
 * - PDF/DOCX generation
 * - Resume parsing from uploaded files
 * - Job status tracking
 */

/**
 * Upload resume file for parsing
 *
 * @param file - The resume file (PDF, DOCX, JPG, PNG, etc.)
 * @returns Promise that resolves to { jobId, message, status, statusUrl }
 */
export async function uploadResumeForParsingApi(file: File): Promise<{
  jobId: string;
  message: string;
  status: string;
  statusUrl: string;
}> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/parser/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to upload resume: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Resume upload error:", error);
    throw error;
  }
}

/**
 * Get the status of a parsing job
 *
 * @param jobId - The job ID returned from upload
 * @returns Promise that resolves to job status object
 */
export async function getParsingJobStatusApi(jobId: string): Promise<{
  jobId: string;
  status: "wait" | "active" | "completed" | "failed";
  progress: number;
  attempts: number;
  result?: {
    jobId: string;
    resumeId: string;
    parsed: any;
    confidence: number;
    metadata: any;
  };
  error?: string;
}> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/parser/jobs/${jobId}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to get job status: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Job status error:", error);
    throw error;
  }
}

/**
 * Get parsed resume result
 *
 * @param resumeId - The resume ID from the completed job
 * @returns Promise that resolves to parsed resume data
 */
export async function getParsedResumeApi(resumeId: string): Promise<{
  resumeId: string;
  parsed: {
    contact: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      links?: string[];
    };
    summary?: string;
    skills?: string[];
    experiences?: Array<{
      company?: string;
      role?: string;
      startDate?: string;
      endDate?: string;
      description?: string[];
    }>;
    education?: Array<{
      school?: string;
      degree?: string;
      field?: string;
      startDate?: string;
      endDate?: string;
    }>;
    certifications?: Array<{
      title?: string;
      issuer?: string;
      issueDate?: string;
    }>;
    projects?: Array<{
      title?: string;
      description?: string;
      link?: string;
    }>;
    languages?: string[];
    awards?: string[];
  };
  confidence: number;
  metadata: {
    fileType: string;
    fileName: string;
    processingTime: number;
  };
}> {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

  try {
    const response = await fetch(`${API_BASE_URL}/api/parser/results/${resumeId}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to get parsed resume: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Parsed resume error:", error);
    throw error;
  }
}

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

    // Delay cleanup to ensure download initiates before element removal
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
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

    // Delay cleanup to ensure download initiates before element removal
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
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
    const url = `${API_BASE_URL}/api/generate/preview?template=${templateId}`;
    console.log("Fetching preview from:", url);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resumeData),
    });

    console.log("Preview API response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to generate preview: ${response.statusText}`
      );
    }

    const html = await response.text();
    console.log("Preview HTML response received, length:", html.length);
    return html;
  } catch (error) {
    console.error("Preview generation error:", error);
    throw error;
  }
}
