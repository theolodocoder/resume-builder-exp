import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getTemplatePreviewApi } from "@/services/apiService";
import { ResumeData } from "./ResumeBuilder";

interface TemplatePreviewSidePanelProps {
  isOpen?: boolean;
  templateId: string;
  templateName: string;
  resumeData: ResumeData;
  onClose?: () => void;
  embedded?: boolean;
}

export const TemplatePreviewSidePanel = ({
  isOpen = true,
  templateId,
  templateName,
  resumeData,
  onClose = () => {},
  embedded = false,
}: TemplatePreviewSidePanelProps) => {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((embedded || isOpen) && resumeData.contact.fullName) {
      loadPreview();
    }
  }, [isOpen, templateId, resumeData, embedded]);

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const previewHtml = await getTemplatePreviewApi(resumeData, templateId as any);
      setHtml(previewHtml);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  // Embedded mode - render as part of the layout
  if (embedded) {
    return (
      <div className="bg-background border border-border rounded-lg overflow-hidden flex flex-col h-full">
        {/* Header */}
        <div className="bg-secondary/20 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-foreground">Live Preview</h2>
            <span className="text-sm text-muted-foreground">— {templateName}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">Error: {error}</p>
              </div>
            </div>
          ) : html ? (
            <iframe
              srcDoc={html}
              className="w-full h-full border-none"
              title={`Preview of ${templateName}`}
            />
          ) : (
            <div className="p-6">
              <p className="text-sm text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Side panel mode - render as overlay
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-full md:w-3/4 lg:w-1/2 bg-background border-l border-border shadow-lg z-50 transition-transform duration-300 ease-in-out overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-secondary/20 border-b border-border p-4 sticky top-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-foreground">Template Preview</h2>
            <span className="text-sm text-muted-foreground">— {templateName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-md transition-colors"
            aria-label="Close preview"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive">Error: {error}</p>
              </div>
            </div>
          ) : html ? (
            <iframe
              srcDoc={html}
              className="w-full h-full border-none"
              title={`Preview of ${templateName}`}
            />
          ) : (
            <div className="p-6">
              <p className="text-sm text-muted-foreground">No preview available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
