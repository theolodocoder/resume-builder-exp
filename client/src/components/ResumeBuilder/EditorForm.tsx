import { ResumeData } from "./ResumeBuilder";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, User, Briefcase, GraduationCap, Award, Code, Trophy } from "lucide-react";

interface EditorFormProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
}

export const EditorForm = ({ resumeData, onChange }: EditorFormProps) => {
  const updateContact = (field: string, value: string) => {
    onChange({
      ...resumeData,
      contact: { ...resumeData.contact, [field]: value },
    });
  };

  const updateSummary = (value: string) => {
    onChange({ ...resumeData, summary: value });
  };

  const addExperience = () => {
    onChange({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: Date.now().toString(),
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    onChange({
      ...resumeData,
      experience: resumeData.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resumeData,
      experience: resumeData.experience.filter((exp) => exp.id !== id),
    });
  };

  const addEducation = () => {
    onChange({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: Date.now().toString(),
          school: "",
          degree: "",
          field: "",
          graduationDate: "",
        },
      ],
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...resumeData,
      education: resumeData.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    });
  };

  const addProject = () => {
    onChange({
      ...resumeData,
      projects: [
        ...(resumeData.projects || []),
        {
          id: Date.now().toString(),
          name: "",
          description: "",
          technologies: "",
          link: "",
          startDate: "",
          endDate: "",
        },
      ],
    });
  };

  const updateProject = (id: string, field: string, value: string) => {
    onChange({
      ...resumeData,
      projects: (resumeData.projects || []).map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      ),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...resumeData,
      projects: (resumeData.projects || []).filter((proj) => proj.id !== id),
    });
  };

  const addCertification = () => {
    onChange({
      ...resumeData,
      certifications: [
        ...(resumeData.certifications || []),
        {
          id: Date.now().toString(),
          name: "",
          issuer: "",
          issueDate: "",
          expirationDate: "",
          credentialId: "",
          credentialUrl: "",
        },
      ],
    });
  };

  const updateCertification = (id: string, field: string, value: string) => {
    onChange({
      ...resumeData,
      certifications: (resumeData.certifications || []).map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    });
  };

  const removeCertification = (id: string) => {
    onChange({
      ...resumeData,
      certifications: (resumeData.certifications || []).filter((cert) => cert.id !== id),
    });
  };

  const updateSkills = (value: string) => {
    onChange({
      ...resumeData,
      skills: value.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="glass-panel rounded-xl p-6 h-[calc(100vh-12rem)] overflow-y-auto">
      <Accordion type="multiple" defaultValue={["contact", "summary"]} className="space-y-4">
        {/* Contact Information */}
        <AccordionItem value="contact" className="glass-panel rounded-lg border border-border/50 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="font-semibold">Contact Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={resumeData.contact.fullName}
                  onChange={(e) => updateContact("fullName", e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.contact.phone}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={resumeData.contact.location}
                  onChange={(e) => updateContact("location", e.target.value)}
                  placeholder="New York, NY"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
                <Input
                  id="linkedin"
                  value={resumeData.contact.linkedin}
                  onChange={(e) => updateContact("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/johndoe"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={resumeData.contact.website}
                  onChange={(e) => updateContact("website", e.target.value)}
                  placeholder="johndoe.com"
                  className="mt-1.5"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Professional Summary */}
        <AccordionItem value="summary" className="glass-panel rounded-lg border border-border/50 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <span className="font-semibold">Professional Summary</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2">
            <Textarea
              value={resumeData.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="Write a brief summary of your professional background and key achievements..."
              className="min-h-[120px] resize-none"
            />
          </AccordionContent>
        </AccordionItem>

        {/* Work Experience */}
        <AccordionItem value="experience" className="glass-panel rounded-lg border border-border/50 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="font-semibold">Work Experience</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Experience #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(exp.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      placeholder="Company Name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                      placeholder="Job Title"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      placeholder="City, State"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                        placeholder="Jan 2020"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                        placeholder="Present"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                    placeholder="Describe your key responsibilities and achievements..."
                    className="mt-1.5 min-h-[80px] resize-none"
                  />
                </div>
              </div>
            ))}
            <Button onClick={addExperience} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Education */}
        <AccordionItem value="education" className="glass-panel rounded-lg border border-border/50 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Education</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 space-y-4">
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Education #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>School</Label>
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, "school", e.target.value)}
                      placeholder="University Name"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      placeholder="Bachelor of Science"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Field of Study</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                      placeholder="Computer Science"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Graduation Date</Label>
                    <Input
                      value={edu.graduationDate}
                      onChange={(e) => updateEducation(edu.id, "graduationDate", e.target.value)}
                      placeholder="May 2023"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={addEducation} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Projects */}
        <AccordionItem value="projects" className="glass-panel rounded-lg border border-border/50 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <span className="font-semibold">Projects</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 space-y-4">
            {(resumeData.projects || []).map((proj, index) => (
              <div key={proj.id} className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Project #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProject(proj.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Project Name</Label>
                    <Input
                      value={proj.name}
                      onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                      placeholder="Project Title"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Technologies</Label>
                    <Input
                      value={proj.technologies}
                      onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                      placeholder="React, Node.js, PostgreSQL"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        value={proj.startDate}
                        onChange={(e) => updateProject(proj.id, "startDate", e.target.value)}
                        placeholder="Mar 2022"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        value={proj.endDate}
                        onChange={(e) => updateProject(proj.id, "endDate", e.target.value)}
                        placeholder="Dec 2022"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Project Link</Label>
                    <Input
                      value={proj.link}
                      onChange={(e) => updateProject(proj.id, "link", e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                    placeholder="Describe the project, features, and accomplishments..."
                    className="mt-1.5 min-h-[80px] resize-none"
                  />
                </div>
              </div>
            ))}
            <Button onClick={addProject} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Certifications */}
        <AccordionItem value="certifications" className="glass-panel rounded-lg border border-border/50 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">Certifications</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 space-y-4">
            {(resumeData.certifications || []).map((cert, index) => (
              <div key={cert.id} className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Certification #{index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(cert.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label>Certification Name</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                      placeholder="e.g., Certified Scrum Master"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Issuer</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                      placeholder="e.g., Scrum Alliance"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Issue Date</Label>
                    <Input
                      value={cert.issueDate}
                      onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)}
                      placeholder="Sep 2022"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Expiration Date (Optional)</Label>
                    <Input
                      value={cert.expirationDate}
                      onChange={(e) => updateCertification(cert.id, "expirationDate", e.target.value)}
                      placeholder="Sep 2025"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Credential ID (Optional)</Label>
                    <Input
                      value={cert.credentialId}
                      onChange={(e) => updateCertification(cert.id, "credentialId", e.target.value)}
                      placeholder="e.g., CSM-SA-12345"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Credential URL (Optional)</Label>
                    <Input
                      value={cert.credentialUrl}
                      onChange={(e) => updateCertification(cert.id, "credentialUrl", e.target.value)}
                      placeholder="https://verify.example.com/cert"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button onClick={addCertification} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Skills */}
        <AccordionItem value="skills" className="glass-panel rounded-lg border border-border/50 px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-semibold">Skills</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2">
            <Label>Skills (comma-separated)</Label>
            <Textarea
              value={resumeData.skills.join(", ")}
              onChange={(e) => updateSkills(e.target.value)}
              placeholder="JavaScript, React, Node.js, Python, SQL"
              className="mt-1.5 min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Separate each skill with a comma
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
