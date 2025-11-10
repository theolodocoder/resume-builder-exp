/**
 * Transform client resume data format to template-expected format
 * Client Format -> Template Format
 */
function transformResumeData(clientData) {
  const {
    contact = {},
    summary = "",
    experience = [],
    education = [],
    projects = [],
    certifications = [],
    skills = [],
  } = clientData;

  // Extract and format URLs
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

  // 1. Add Experience section
  if (experience && experience.length > 0) {
    sections.push({
      title: "Experience",
      type: "experience",
      items: experience.map((job) => ({
        primary: job.company || "",
        secondary: job.location || "",
        tertiary: job.position || "",
        date: formatDateRange(job.startDate, job.endDate),
        descriptionPoints: job.description
          ? splitDescriptionPoints(job.description)
          : [],
      })),
    });
  }

  // 2. Add Education section
  if (education && education.length > 0) {
    sections.push({
      title: "Education",
      type: "education",
      items: education.map((school) => ({
        primary: school.school || "",
        secondary: school.field ? `Field: ${school.field}` : "",
        tertiary: school.degree || "",
        date: school.graduationDate || "",
      })),
    });
  }

  // 2.5. Add Projects section
  if (projects && projects.length > 0) {
    sections.push({
      title: "Projects",
      type: "projects",
      items: projects.map((project) => ({
        primary: project.name || "",
        secondary: "",
        tertiary: "",
        date: formatDateRange(project.startDate, project.endDate),
        technologies: project.technologies || "",
        link: project.link || "",
        descriptionPoints: project.description ? splitDescriptionPoints(project.description) : [],
      })),
    });
  }

  // 2.7. Add Certifications section
  if (certifications && certifications.length > 0) {
    sections.push({
      title: "Certifications",
      type: "certifications",
      items: certifications.map((cert) => ({
        primary: cert.name || "",
        secondary: cert.issuer || "",
        tertiary: "",
        date: cert.issueDate || "",
        credentialId: cert.credentialId || "",
        credentialUrl: cert.credentialUrl || "",
      })),
    });
  }

  // 3. Add Skills section
  if (skills && skills.length > 0) {
    sections.push({
      title: "Skills",
      type: "skills",
      items: [
        {
          primary: "",
          secondary: "",
          tertiary: "",
          date: "",
          descriptionPoints: skills,
        },
      ],
    });
  }

  // 4. Add Professional Summary if present
  if (summary && summary.trim()) {
    sections.unshift({
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

  // Build transformed data
  const transformedData = {
    contact: {
      fullName: contact.fullName || "Your Name",
      email: contact.email || "",
      phone: contact.phone || "",
      location: contact.location || "",
      linkedin: linkedinUrl,
    },
    name: contact.fullName || "Your Name",
    email: contact.email || "",
    phone: contact.phone || "",
    location: contact.location || "",
    linkedin: linkedinUrl,
    linkedin_display: linkedinDisplay || "",
    website: websiteUrl,
    website_display: websiteDisplay || "",
    summary: summary || "",
    skills: skills || [],
    sections,
  };

  return transformedData;
}

/**
 * Format date range for display
 */
function formatDateRange(startDate, endDate) {
  if (!startDate) return "";

  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "Present";

  return `${start} – ${end}`;
}

/**
 * Format a date string (YYYY-MM format)
 */
function formatDate(dateStr) {
  if (!dateStr) return "";

  // Handle YYYY-MM format
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

  // If it's already a formatted string, return as is
  return dateStr;
}

/**
 * Split description points by various separators
 * Handles: bullet points (•), line breaks (\n), tildes (~), pipes (|)
 */
function splitDescriptionPoints(description) {
  if (!description || typeof description !== "string") {
    return [];
  }

  let points = [];

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

module.exports = { transformResumeData };
