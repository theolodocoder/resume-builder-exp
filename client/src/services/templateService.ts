import { ResumeData } from "@/components/ResumeBuilder/ResumeBuilder";

export interface Template {
  id: string;
  name: string;
  html: string;
  css: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000";

/**
 * Fetch available templates from server
 */
export async function getAvailableTemplates(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/templates`);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }
    const data = await response.json();
    return data.templates || [];
  } catch (error) {
    console.error("Error fetching templates:", error);
    return ["professional", "classic"];
  }
}

/**
 * Fetch a specific template
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching template:", error);
    return null;
  }
}

/**
 * Render a template with resume data
 */
export function renderTemplate(
  templateHtml: string,
  templateCss: string,
  resumeData: ResumeData
): string {
  let html = templateHtml;
  let css = templateCss;

  // Transform resume data
  const transformed = transformResumeData(resumeData);

  // Replace simple variables
  Object.entries(transformed).forEach(([key, value]) => {
    if (typeof value === "string") {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
  });

  // Replace CSS
  html = html.replace(/\{{{styles}}}/g, `<style>${css}</style>`);

  return html;
}

/**
 * Split description points by various separators
 * Handles: bullet points (•), line breaks (\n), tildes (~), pipes (|)
 */
function splitDescriptionPoints(description: string): string[] {
  if (!description || typeof description !== "string") {
    return [];
  }

  let points: string[] = [];

  // Try to split by bullet point first (•)
  if (description.includes("•")) {
    points = description
      .split("•")
      .map((point) => point.trim())
      .filter((point) => point.length > 0);
  }
  // Try to split by line breaks
  else if (description.includes("\n")) {
    points = description
      .split("\n")
      .map((point) => point.trim())
      .filter((point) => point.length > 0);
  }
  // Try to split by tilde (~)
  else if (description.includes("~")) {
    points = description
      .split("~")
      .map((point) => point.trim())
      .filter((point) => point.length > 0);
  }
  // Try to split by pipe (|)
  else if (description.includes("|")) {
    points = description
      .split("|")
      .map((point) => point.trim())
      .filter((point) => point.length > 0);
  }
  // If no separators found, return as single point
  else {
    points = [description.trim()];
  }

  return points;
}

/**
 * Transform client resume data to template format
 */
function transformResumeData(clientData: ResumeData) {
  const {
    contact = {},
    summary = "",
    experience = [],
    education = [],
    skills = [],
  } = clientData;

  const linkedinUrl = contact.linkedin || "";
  const linkedinDisplay = linkedinUrl
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "");

  const websiteUrl = contact.website || "";
  const websiteDisplay = websiteUrl
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "");

  // Build sections array
  const sections = [];

  // Professional Summary
  if (summary && summary.trim()) {
    sections.push({
      title: "Professional Summary",
      type: "summary",
      items: [
        {
          primary: "",
          secondary: "",
          tertiary: summary,
          date: "",
        },
      ],
    });
  }

  // Experience
  if (experience && experience.length > 0) {
    sections.push({
      title: "Professional Work Experience",
      type: "experience",
      items: experience.map((job) => ({
        primary: job.company || "",
        secondary: job.location || "",
        tertiary: job.position || "",
        date: formatDateRange(job.startDate, job.endDate),
        descriptionPoints: job.description ? splitDescriptionPoints(job.description) : [],
      })),
    });
  }

  // Education
  if (education && education.length > 0) {
    sections.push({
      title: "Education",
      type: "education",
      items: education.map((school) => ({
        primary: school.school || "",
        secondary: school.field ? `${school.field}` : "",
        tertiary: school.degree || "",
        date: school.graduationDate || "",
      })),
    });
  }

  // Skills
  if (skills && skills.length > 0) {
    sections.push({
      title: "Skills",
      type: "skills",
      items: skills.map((skill) => ({
        primary: skill,
        secondary: "",
        tertiary: "",
        date: "",
      })),
    });
  }

  return {
    name: contact.fullName || "Your Name",
    email: contact.email || "",
    phone: contact.phone || "",
    location: contact.location || "",
    linkedin: linkedinUrl,
    linkedin_display: linkedinDisplay || "",
    website: websiteUrl,
    website_display: websiteDisplay || "",
    summary,
    sections,
  };
}

/**
 * Format date range
 */
function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate) return "";

  const start = formatDate(startDate);
  const end = endDate && endDate !== "Present" ? formatDate(endDate) : "Present";

  return `${start} – ${end}`;
}

/**
 * Format date string (YYYY-MM format)
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";

  if (dateStr.includes("-")) {
    const [year, month] = dateStr.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthIndex = parseInt(month) - 1;
    return `${monthNames[monthIndex] || month} ${year}`;
  }

  return dateStr;
}
