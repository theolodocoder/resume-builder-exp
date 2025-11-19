import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Download, X } from "lucide-react";
import { ResumeData } from "./ResumeBuilder";

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  templateHtml: string;
  templateCss: string;
  resumeData: ResumeData;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  isOpen,
  onClose,
  templateName,
  templateHtml,
  templateCss,
  resumeData,
}) => {
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    if (isOpen && templateHtml && templateCss) {
      // Transform resume data to template format
      const transformedData = transformResumeData(resumeData);

      // Simple template rendering (replace {{variable}} with values)
      let html = templateHtml;

      // Replace simple variables
      html = html.replace(/{{name}}/g, transformedData.name);
      html = html.replace(/{{email}}/g, transformedData.email);
      html = html.replace(/{{phone}}/g, transformedData.phone);
      html = html.replace(/{{location}}/g, transformedData.location);
      html = html.replace(/{{linkedin}}/g, transformedData.linkedin);
      html = html.replace(/{{linkedin_display}}/g, transformedData.linkedin_display);
      html = html.replace(/{{website}}/g, transformedData.website);
      html = html.replace(/{{website_display}}/g, transformedData.website_display);

      // Replace CSS placeholder
      html = html.replace(/\{{{styles}}}/g, `<style>${templateCss}</style>`);

      setPreviewHtml(html);
    }
  }, [isOpen, templateHtml, templateCss, resumeData]);

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=800,width=800");
    if (printWindow) {
      printWindow.document.write(previewHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadHtml = () => {
    const element = document.createElement("a");
    const file = new Blob([previewHtml], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${templateName}-preview.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between w-full">
            <DialogTitle>Template Preview: {templateName}</DialogTitle>
            <X
              className="w-5 h-5 cursor-pointer"
              onClick={onClose}
            />
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Eye className="w-4 h-4" />
              Print Preview
            </Button>
            <Button
              onClick={handleDownloadHtml}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Download HTML
            </Button>
          </div>

          <div className="border rounded-lg bg-white">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[600px] border-0"
              title="Template Preview"
            />
          </div>

          <div className="text-xs text-gray-500">
            <p>💡 Tip: Use "Print Preview" to see how it will look in PDF format</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
    experience,
    education,
    skills,
  };
}
