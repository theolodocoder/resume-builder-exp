import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface DownloadButtonsProps {
  isLoading: boolean;
  onDownload: (format: "pdf" | "docx") => void;
  className?: string;
}

export const DownloadButtons = ({ isLoading, onDownload, className = "" }: DownloadButtonsProps) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      <Button
        onClick={() => onDownload("pdf")}
        disabled={isLoading}
        className="group relative overflow-hidden transition-all hover:shadow-[0_0_20px_hsl(var(--primary-glow)/0.3)]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </>
        )}
      </Button>
      <Button
        variant="outline"
        onClick={() => onDownload("docx")}
        disabled={isLoading}
        className="group relative overflow-hidden transition-all hover:shadow-[0_0_15px_hsl(var(--primary-glow)/0.2)]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download DOCX
          </>
        )}
      </Button>
    </div>
  );
};
