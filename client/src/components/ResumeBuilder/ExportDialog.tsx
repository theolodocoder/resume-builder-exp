import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { ResumeData } from "./ResumeBuilder";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  resumeData: ResumeData;
}

export const ExportDialog = ({ resumeData }: ExportDialogProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(resumeData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Your resume data has been downloaded.",
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Could not export resume data.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Resume Data</DialogTitle>
          <DialogDescription>
            Download your resume data as a JSON file to import later
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will download a JSON file containing all your resume information.
            You can import this file later to restore your resume.
          </p>
          <Button onClick={handleExport} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
