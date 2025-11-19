import { ResumeData } from "./ResumeBuilder";
import { TemplateType } from "./TemplateGallery";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import "./ResumePreview.css";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  resumeData: ResumeData;
  template?: TemplateType;
}

export const ResumePreview = ({
  resumeData,
  template = "lora",
}: ResumePreviewProps) => {
  const hasContact = resumeData.contact.fullName || resumeData.contact.email;
  const hasExperience = resumeData.experience.length > 0;
  const hasEducation = resumeData.education.length > 0;
  const hasProjects = (resumeData.projects || []).length > 0;
  const hasCertifications = (resumeData.certifications || []).length > 0;
  const hasSkills = resumeData.skills.length > 0;

  return (
    <div className="resume-preview-container">
      <div className={cn("resume-preview", `template-${template}`)}>
        {/* Header */}
        {hasContact && (
          <div className="resume-header">
            <h1 className="resume-name">
              {resumeData.contact.fullName || "Your Name"}
            </h1>
            <div className="resume-contact-info">
              {resumeData.contact.email && (
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <span>{resumeData.contact.email}</span>
                </div>
              )}
              {resumeData.contact.phone && (
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <span>{resumeData.contact.phone}</span>
                </div>
              )}
              {resumeData.contact.location && (
                <div className="contact-item">
                  <MapPin className="contact-icon" />
                  <span>{resumeData.contact.location}</span>
                </div>
              )}
              {resumeData.contact.linkedin && (
                <div className="contact-item">
                  <Linkedin className="contact-icon" />
                  <span>{resumeData.contact.linkedin}</span>
                </div>
              )}
              {resumeData.contact.website && (
                <div className="contact-item">
                  <Globe className="contact-icon" />
                  <span>{resumeData.contact.website}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {resumeData.summary && (
          <div className="resume-section">
            <h2 className="resume-section-title">Professional Summary</h2>
            <p className="resume-summary">{resumeData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {hasExperience && (
          <div className="resume-section">
            <h2 className="resume-section-title">Work Experience</h2>
            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="resume-item">
                <div className="resume-item-header">
                  <div>
                    <h3 className="resume-item-title">
                      {exp.position || "Position"}
                    </h3>
                    <div className="resume-item-subtitle">
                      {exp.company || "Company"}
                      {exp.location && ` • ${exp.location}`}
                    </div>
                  </div>
                  <div className="resume-item-date">
                    {exp.startDate &&
                      `${exp.startDate} - ${exp.endDate || "Present"}`}
                  </div>
                </div>
                {exp.description && (
                  <p className="resume-item-description">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {hasEducation && (
          <div className="resume-section">
            <h2 className="resume-section-title">Education</h2>
            {resumeData.education.map((edu) => (
              <div key={edu.id} className="resume-item">
                <div className="resume-item-header">
                  <div>
                    <h3 className="resume-item-title">
                      {edu.degree || "Degree"} {edu.field && `in ${edu.field}`}
                    </h3>
                    <div className="resume-item-subtitle">
                      {edu.school || "School"}
                    </div>
                  </div>
                  {edu.graduationDate && (
                    <div className="resume-item-date">{edu.graduationDate}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {hasProjects && (
          <div className="resume-section">
            <h2 className="resume-section-title">Projects</h2>
            {(resumeData.projects || []).map((proj) => (
              <div key={proj.id} className="resume-item">
                <div className="resume-item-header">
                  <div>
                    <h3 className="resume-item-title">
                      {proj.name || "Project"}
                    </h3>
                    {proj.technologies && (
                      <div className="resume-item-subtitle">
                        {proj.technologies}
                      </div>
                    )}
                  </div>
                  {(proj.startDate || proj.endDate) && (
                    <div className="resume-item-date">
                      {proj.startDate &&
                        `${proj.startDate} - ${proj.endDate || "Present"}`}
                    </div>
                  )}
                </div>
                {proj.description && (
                  <p className="resume-item-description">{proj.description}</p>
                )}
                {proj.link && (
                  <div
                    className="resume-item-subtitle"
                    style={{ marginTop: "4px" }}
                  >
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#0062BC" }}
                    >
                      {proj.link}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {hasCertifications && (
          <div className="resume-section">
            <h2 className="resume-section-title">Certifications</h2>
            {(resumeData.certifications || []).map((cert) => (
              <div key={cert.id} className="resume-item">
                <div className="resume-item-header">
                  <div>
                    <h3 className="resume-item-title">
                      {cert.name || "Certification"}
                    </h3>
                    <div className="resume-item-subtitle">
                      {cert.issuer || "Issuer"}
                    </div>
                  </div>
                  {cert.issueDate && (
                    <div className="resume-item-date">{cert.issueDate}</div>
                  )}
                </div>
                {cert.credentialId && (
                  <div
                    className="resume-item-subtitle"
                    style={{ marginTop: "4px" }}
                  >
                    Credential ID: {cert.credentialId}
                  </div>
                )}
                {cert.expirationDate && (
                  <div
                    className="resume-item-subtitle"
                    style={{ marginTop: "2px" }}
                  >
                    Expires: {cert.expirationDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {hasSkills && (
          <div className="resume-section">
            <h2 className="resume-section-title">Skills</h2>
            <div className="resume-skills">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className="resume-skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasContact &&
          !resumeData.summary &&
          !hasExperience &&
          !hasEducation &&
          !hasProjects &&
          !hasCertifications &&
          !hasSkills && (
            <div className="resume-empty-state">
              <p className="text-muted-foreground text-center">
                Start filling out the form on the left to see your resume
                preview here.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
