import { useState, useEffect } from "react";
import { EditorForm } from "./EditorForm";
import { DownloadButtons } from "./DownloadButtons";
import { TemplateGallery, TemplateType } from "./TemplateGallery";
import { TemplatePreviewSidePanel } from "./TemplatePreviewSidePanel";
import { ImportDialog } from "./ImportDialog";
import { ExportDialog } from "./ExportDialog";
import { Monitor, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generatePdfApi, generateDocxApi } from "@/services/apiService";

export interface ResumeData {
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  skills: string[];
}

const initialResumeData: ResumeData = {
  contact: {
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarahjohnson",
    website: "sarahjohnson.dev",
  },
  summary:
    "Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative software solutions. Proven track record of launching products that drive user engagement and revenue growth. Expert in agile methodologies, user research, and data-driven decision making.",
  experience: [
    {
      id: "1",
      company: "TechCorp Inc.",
      position: "Senior Product Manager",
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      description:
        "Lead product strategy and roadmap for flagship SaaS platform serving 100K+ users\n• Increased user retention by 35% through data-driven feature improvements\n• Managed cross-functional team of 12 engineers, designers, and analysts\n• Successfully launched 3 major product releases, generating $2M in additional revenue",
    },
    {
      id: "2",
      company: "InnovateSoft",
      position: "Product Manager",
      location: "San Francisco, CA",
      startDate: "Jun 2017",
      endDate: "Dec 2019",
      description:
        "Drove product development for mobile application with 500K+ downloads\n• Conducted extensive user research and A/B testing to optimize user experience\n• Collaborated with engineering team to reduce app crashes by 60%\n• Launched successful referral program that increased user acquisition by 45%",
    },
  ],
  education: [
    {
      id: "1",
      school: "Stanford University",
      degree: "Master of Business Administration",
      field: "Technology Management",
      graduationDate: "May 2017",
    },
    {
      id: "2",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "May 2014",
    },
  ],
  projects: [
    {
      id: "1",
      name: "Analytics Dashboard Platform",
      description:
        "Designed and launched a comprehensive real-time analytics dashboard serving 50K+ users • Increased dashboard adoption by 80% through intuitive UX improvements • Implemented custom reporting features reducing customer support tickets by 40%",
      technologies: "React, Node.js, PostgreSQL, D3.js",
      link: "https://analytics-platform.com",
      startDate: "Mar 2022",
      endDate: "Dec 2022",
    },
    {
      id: "2",
      name: "Mobile AI Assistant App",
      description:
        "Led development of AI-powered mobile assistant with 250K+ downloads • Optimized ML model performance reducing latency by 50% • Achieved 4.8-star rating through continuous user feedback iteration",
      technologies: "React Native, Python, TensorFlow, Firebase",
      link: "https://github.com/sarahjohnson/ai-assistant",
      startDate: "Jun 2021",
      endDate: "Nov 2021",
    },
  ],
  certifications: [
    {
      id: "1",
      name: "Certified Scrum Product Owner (CSPO)",
      issuer: "Scrum Alliance",
      issueDate: "Sep 2022",
      credentialId: "CSM-SA-12345",
      credentialUrl: "https://www.scrumalliance.org",
    },
    {
      id: "2",
      name: "Google Analytics Individual Qualification",
      issuer: "Google",
      issueDate: "Mar 2021",
      expirationDate: "Mar 2024",
      credentialId: "GA-IQ-67890",
    },
    {
      id: "3",
      name: "Lean Six Sigma Green Belt",
      issuer: "International Association for Six Sigma Certification",
      issueDate: "Jan 2020",
      credentialId: "IATF-GB-11111",
    },
  ],
  skills: [
    "Product Strategy",
    "Agile/Scrum",
    "User Research",
    "Data Analysis",
    "A/B Testing",
    "Roadmap Planning",
    "Stakeholder Management",
    "SQL",
    "JIRA",
    "Figma",
  ],
};

type MobileView = "editor" | "preview";

const STORAGE_KEY = "ai-resume-builder-data";
const TEMPLATE_KEY = "ai-resume-builder-template";

export const ResumeBuilder = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("professional");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("editor");
  const { toast } = useToast();

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedTemplate = localStorage.getItem(TEMPLATE_KEY);

      if (savedData) {
        setResumeData(JSON.parse(savedData));
      }
      if (savedTemplate) {
        // Validate template is one of the valid options
        const validTemplates: TemplateType[] = [
          "professional",
          "lora",
          "garamond",
          "calibri",
          "compact",
          "premiumModern",
          "premiumDark",
          "premiumCreative",
          "premiumMinimal",
          "premiumExecutive",
        ];
        if (validTemplates.includes(savedTemplate as TemplateType)) {
          setSelectedTemplate(savedTemplate as TemplateType);
        }
      }
    } catch (error) {
      console.error("Failed to load saved data:", error);
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
        localStorage.setItem(TEMPLATE_KEY, selectedTemplate);
      } catch (error) {
        console.error("Failed to save data:", error);
        toast({
          title: "Save failed",
          description: "Could not auto-save your changes.",
          variant: "destructive",
        });
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [resumeData, selectedTemplate, toast]);

  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData);
  };

  const handleImport = (importedData: ResumeData) => {
    setResumeData(importedData);
    toast({
      title: "Resume imported",
      description: "Your resume data has been loaded successfully.",
    });
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    // Validate that contact name is provided
    if (!resumeData.contact.fullName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name before downloading.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (format === "pdf") {
        await generatePdfApi(resumeData, selectedTemplate);
        toast({
          title: "Success",
          description: "Your PDF resume has been downloaded.",
        });
      } else if (format === "docx") {
        await generateDocxApi(resumeData);
        toast({
          title: "Success",
          description: "Your DOCX resume has been downloaded.",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate document";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateName = (templateId: TemplateType): string => {
    const templateNames: Record<TemplateType, string> = {
      professional: "Professional",
      lora: "Lora Modern",
      garamond: "Garamond Classic",
      calibri: "Calibri Clean",
      compact: "Compact Executive",
      premiumModern: "Premium Modern",
      premiumDark: "Premium Dark",
      premiumCreative: "Premium Creative",
      premiumMinimal: "Premium Minimal",
      premiumExecutive: "Premium Executive",
    };
    return templateNames[templateId];
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AI Resume Builder
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create your professional resume in minutes
            </p>
          </div>

          {/* Mobile View Toggle */}
          <div className="flex md:hidden gap-2">
            <Button
              variant={mobileView === "editor" ? "default" : "outline"}
              size="sm"
              onClick={() => setMobileView("editor")}
              className="transition-all"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant={mobileView === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setMobileView("preview")}
              className="transition-all"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex gap-2 items-center">
            <ImportDialog onImport={handleImport} />
            <ExportDialog resumeData={resumeData} />
            <DownloadButtons
              isLoading={isLoading}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-[60%_40%] gap-6 h-full">
          {/* Editor Panel - Desktop Always Visible, Mobile Conditional */}
          <div
            className={`${mobileView === "preview" ? "hidden md:block" : ""}`}
          >
            <TemplateGallery
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />
            <EditorForm resumeData={resumeData} onChange={handleDataChange} />
          </div>

          {/* Preview Panel - Desktop Always Visible, Mobile Conditional */}
          <div
            className={`${mobileView === "editor" ? "hidden md:block" : ""}`}
          >
            <div className="sticky top-24 h-[calc(100vh-150px)]">
              <TemplatePreviewSidePanel
                templateId={selectedTemplate}
                templateName={getTemplateName(selectedTemplate)}
                resumeData={resumeData}
                embedded={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="md:hidden glass-panel border-t border-border/50 sticky bottom-0 p-4 space-y-2">
        <div className="flex gap-2">
          <ImportDialog onImport={handleImport} />
          <ExportDialog resumeData={resumeData} />
        </div>
        <DownloadButtons isLoading={isLoading} onDownload={handleDownload} />
      </div>
    </div>
  );
};
