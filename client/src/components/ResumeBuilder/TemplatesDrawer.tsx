import React, { useState, useEffect } from "react";
import { Palette, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateGallery, TemplateType } from "./TemplateGallery";
import { TemplatePreviewSidePanel } from "./TemplatePreviewSidePanel";
import { ResumeData } from "./ResumeBuilder";

interface TemplatesDrawerProps {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  resumeData: ResumeData;
  getTemplateName: (template: TemplateType) => string;
}

export const TemplatesDrawer: React.FC<TemplatesDrawerProps> = ({
  selectedTemplate,
  onSelectTemplate,
  resumeData,
  getTemplateName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectTemplate = (template: TemplateType) => {
    onSelectTemplate(template);
  };

  return (
    <>
      {/* Open Button - Always visible */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 tour-open-templates-drawer"
        title="Open templates and preview"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Templates</span>
      </Button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Drawer - Mobile & Desktop */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50 rounded-t-2xl shadow-2xl transition-all duration-300 ease-out ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        } ${
          isMobile
            ? "h-[90vh]"
            : "h-[95vh] left-1/2 -translate-x-1/2 w-[95%]  bottom-4 rounded-2xl"
        }`}
      >
        {/* Handle / Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50 rounded-t-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-1 bg-border/50 rounded-full mx-auto lg:hidden" />
          </div>
          <h2 className="font-semibold text-lg flex items-center gap-2 flex-1 justify-center">
            <Palette className="h-5 w-5 text-primary" />
            Templates & Preview
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-full">
          <div className="p-6 lg:p-8 h-full flex flex-col">
            {/* Desktop: Two Column Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8 h-full">
              {/* Template Gallery - Left */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold mb-6">
                  Choose Your Template
                </h3>
                <div className="overflow-y-auto flex-1 pr-2">
                  <TemplateGallery
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={handleSelectTemplate}
                  />
                </div>
              </div>

              {/* Live Preview - Right */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold mb-6">Live Preview</h3>
                <div className="border-2 border-border/50 rounded-lg overflow-hidden bg-muted/50 flex-1">
                  <TemplatePreviewSidePanel
                    templateId={selectedTemplate}
                    templateName={getTemplateName(selectedTemplate)}
                    resumeData={resumeData}
                    embedded={true}
                  />
                </div>
              </div>
            </div>

            {/* Mobile: Stacked Layout */}
            <div className="lg:hidden space-y-8">
              {/* Template Gallery */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold mb-6">
                  Choose Your Template
                </h3>
                <div className="max-h-[50vh] overflow-y-auto">
                  <TemplateGallery
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={(template) => {
                      handleSelectTemplate(template);
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50" />

              {/* Live Preview */}
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold mb-6">Live Preview</h3>
                <div className="border-2 border-border/50 rounded-lg overflow-hidden bg-muted/50 h-[50vh]">
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
        </div>
      </div>
    </>
  );
};
