import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Settings, AlertCircle } from "lucide-react";
import { TemplatePreview } from "./TemplatePreview";
import { ResumeData } from "./ResumeBuilder";

interface Template {
  id: string;
  name: string;
  description: string;
  htmlPath: string;
  cssPath: string;
  isProfessional: boolean;
}

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  resumeData: ResumeData;
  currentTemplate?: string;
}

const AVAILABLE_TEMPLATES: Template[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean, crisp design with Libre Baskerville serif font. Perfect for formal applications.",
    htmlPath: "/templates/resume-professional.html",
    cssPath: "/templates/resume-professional.css",
    isProfessional: true,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional resume format with clear sections and professional typography.",
    htmlPath: "/templates/resume-template.html",
    cssPath: "/templates/resume-style.css",
    isProfessional: false,
  },
];

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  resumeData,
  currentTemplate = "professional",
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateContent, setTemplateContent] = useState<{
    html: string;
    css: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async (template: Template) => {
    setSelectedTemplate(template);
    setLoading(true);

    try {
      // Fetch template HTML and CSS
      const [htmlResponse, cssResponse] = await Promise.all([
        fetch(template.htmlPath),
        fetch(template.cssPath),
      ]);

      const html = await htmlResponse.text();
      const css = await cssResponse.text();

      setTemplateContent({ html, css });
      setPreviewOpen(true);
    } catch (error) {
      console.error("Failed to load template:", error);
      alert("Failed to load template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Resume Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {AVAILABLE_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      {template.isProfessional && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePreview(template)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleSelectTemplate(template.id)}
                    variant={currentTemplate === template.id ? "default" : "outline"}
                    size="sm"
                  >
                    {currentTemplate === template.id ? "✓ Selected" : "Select"}
                  </Button>
                </div>
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Template Preview Tips:</p>
                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Use "Print Preview" to see how it looks when printed to PDF</li>
                  <li>The preview shows your actual resume data</li>
                  <li>Test different fonts and spacing before downloading</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTemplate && templateContent && (
        <TemplatePreview
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          templateName={selectedTemplate.name}
          templateHtml={templateContent.html}
          templateCss={templateContent.css}
          resumeData={resumeData}
        />
      )}
    </>
  );
};
