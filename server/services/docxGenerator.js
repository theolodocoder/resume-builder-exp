const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  UnorderedList,
  convertInchesToTwip,
} = require("docx");

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

/**
 * Create bullet point paragraphs
 */
function createBulletPoints(description) {
  const points = splitDescriptionPoints(description);

  return points.map(
    (point) =>
      new Paragraph({
        text: point,
        style: "List Bullet",
        size: 22,
        spacing: { after: 100 },
      })
  );
}

const generateDocx = async (data) => {
  try {
    // Destructure the resume data
    const { contact = {}, summary = "", experience = [], education = [], projects = [], certifications = [], skills = [] } = data;

    // Build document sections
    const sections = [];

    // Header with contact info
    sections.push(
      new Paragraph({
        text: contact.fullName || "Your Name",
        bold: true,
        size: 28,
        spacing: { after: 100 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Contact info line
    const contactInfo = [
      contact.email,
      contact.phone,
      contact.location,
      contact.linkedin && `LinkedIn: ${contact.linkedin}`,
      contact.website && `Website: ${contact.website}`,
    ]
      .filter(Boolean)
      .join(" | ");

    sections.push(
      new Paragraph({
        text: contactInfo,
        size: 20,
        spacing: { after: 200 },
        alignment: AlignmentType.CENTER,
      })
    );

    // Professional Summary
    if (summary && summary.trim()) {
      sections.push(
        new Paragraph({
          text: "PROFESSIONAL SUMMARY",
          bold: true,
          size: 24,
          spacing: { before: 100, after: 100 },
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      sections.push(
        new Paragraph({
          text: summary,
          size: 22,
          spacing: { after: 200 },
        })
      );
    }

    // Experience
    if (experience && experience.length > 0) {
      sections.push(
        new Paragraph({
          text: "PROFESSIONAL WORK EXPERIENCE",
          bold: true,
          size: 24,
          spacing: { before: 100, after: 100 },
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      experience.forEach((job) => {
        // Job title and company
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: job.position || "Position",
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: ` | ${job.company || "Company"}`,
                size: 22,
              }),
            ],
            spacing: { after: 50 },
          })
        );

        // Dates and location
        sections.push(
          new Paragraph({
            text: `${job.startDate || ""} - ${job.endDate || ""} | ${job.location || ""}`,
            italics: true,
            size: 20,
            spacing: { after: 100 },
          })
        );

        // Description with bullet points
        if (job.description) {
          const bulletPoints = createBulletPoints(job.description);
          sections.push(...bulletPoints);
        }

        // Extra spacing between jobs
        sections.push(
          new Paragraph({
            text: "",
            spacing: { after: 100 },
          })
        );
      });
    }

    // Education
    if (education && education.length > 0) {
      sections.push(
        new Paragraph({
          text: "EDUCATION",
          bold: true,
          size: 24,
          spacing: { before: 100, after: 100 },
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      education.forEach((school) => {
        // Degree and School
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: school.degree || "Degree",
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: ` in ${school.field || "Field"}`,
                size: 22,
              }),
            ],
            spacing: { after: 50 },
          })
        );

        // School and date
        sections.push(
          new Paragraph({
            text: `${school.school || "School"} | ${school.graduationDate || ""}`,
            italics: true,
            size: 20,
            spacing: { after: 150 },
          })
        );
      });
    }

    // Projects
    if (projects && projects.length > 0) {
      sections.push(
        new Paragraph({
          text: "PROJECTS",
          bold: true,
          size: 24,
          spacing: { before: 100, after: 100 },
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      projects.forEach((project) => {
        // Project name
        sections.push(
          new Paragraph({
            text: project.name || "Project",
            bold: true,
            size: 22,
            spacing: { after: 50 },
          })
        );

        // Dates
        if (project.startDate || project.endDate) {
          sections.push(
            new Paragraph({
              text: `${project.startDate || ""} - ${project.endDate || ""}`,
              italics: true,
              size: 20,
              spacing: { after: 50 },
            })
          );
        }

        // Description with bullet points
        if (project.description) {
          const bulletPoints = createBulletPoints(project.description);
          sections.push(...bulletPoints);
        }

        // Technologies
        if (project.technologies) {
          sections.push(
            new Paragraph({
              text: `Technologies: ${project.technologies}`,
              size: 20,
              spacing: { after: 50 },
            })
          );
        }

        // Link
        if (project.link) {
          sections.push(
            new Paragraph({
              text: project.link,
              size: 20,
              spacing: { after: 100 },
            })
          );
        }
      });
    }

    // Certifications
    if (certifications && certifications.length > 0) {
      sections.push(
        new Paragraph({
          text: "CERTIFICATIONS",
          bold: true,
          size: 24,
          spacing: { before: 100, after: 100 },
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      certifications.forEach((cert) => {
        // Certification name
        sections.push(
          new Paragraph({
            text: cert.name || "Certification",
            bold: true,
            size: 22,
            spacing: { after: 50 },
          })
        );

        // Issuer and date
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.issuer || "Issuer",
                size: 20,
              }),
              new TextRun({
                text: ` | ${cert.issueDate || ""}`,
                italics: true,
                size: 20,
              }),
            ],
            spacing: { after: 50 },
          })
        );

        // Credential ID
        if (cert.credentialId) {
          sections.push(
            new Paragraph({
              text: `Credential ID: ${cert.credentialId}`,
              size: 20,
              spacing: { after: 50 },
            })
          );
        }

        // Expiration date
        if (cert.expirationDate) {
          sections.push(
            new Paragraph({
              text: `Expires: ${cert.expirationDate}`,
              size: 20,
              spacing: { after: 100 },
            })
          );
        }

        // Extra spacing between certifications
        sections.push(
          new Paragraph({
            text: "",
            spacing: { after: 50 },
          })
        );
      });
    }

    // Skills
    if (skills && skills.length > 0) {
      sections.push(
        new Paragraph({
          text: "SKILLS",
          bold: true,
          size: 24,
          spacing: { before: 100, after: 100 },
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      // Create skill bullets
      const skillBullets = skills.map(
        (skill) =>
          new Paragraph({
            text: skill,
            style: "List Bullet",
            size: 22,
            spacing: { after: 50 },
          })
      );

      sections.push(...skillBullets);
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margins: {
                top: convertInchesToTwip(0.5),
                right: convertInchesToTwip(0.6),
                bottom: convertInchesToTwip(0.5),
                left: convertInchesToTwip(0.6),
              },
            },
          },
          children: sections,
        },
      ],
    });

    // Generate and return buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  } catch (error) {
    console.error("Error generating DOCX:", error);
    throw new Error(`Failed to generate DOCX: ${error.message}`);
  }
};

module.exports = { generateDocx };
