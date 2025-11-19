import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileJson } from "lucide-react";
import { ResumeData } from "./ResumeBuilder";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const experienceSchema = z.object({
  id: z.string(),
  company: z.string().max(100),
  position: z.string().max(100),
  location: z.string().max(100),
  startDate: z.string().max(50),
  endDate: z.string().max(50),
  description: z.string().max(2000),
});

const educationSchema = z.object({
  id: z.string(),
  school: z.string().max(100),
  degree: z.string().max(100),
  field: z.string().max(100),
  graduationDate: z.string().max(50),
});

const projectSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  description: z.string().max(2000),
  technologies: z.string().max(500).optional(),
  link: z.string().max(500).optional(),
  startDate: z.string().max(50).optional(),
  endDate: z.string().max(50).optional(),
});

const certificationSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  issuer: z.string().max(200),
  issueDate: z.string().max(50),
  expirationDate: z.string().max(50).optional(),
  credentialId: z.string().max(100).optional(),
  credentialUrl: z.string().max(500).optional(),
});

const resumeDataSchema = z.object({
  contact: z.object({
    fullName: z.string().max(100),
    email: z.string().email().max(255).or(z.literal("")),
    phone: z.string().max(50),
    location: z.string().max(100),
    linkedin: z.string().max(255).optional(),
    website: z.string().max(255).optional(),
  }),
  summary: z.string().max(2000),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  skills: z.array(z.string().max(50)),
});

interface ImportDialogProps {
  onImport: (data: ResumeData) => void;
}

export const ImportDialog = ({ onImport }: ImportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateAndImport = (jsonData: unknown) => {
    try {
      const validatedData = resumeDataSchema.parse(jsonData);
      onImport(validatedData as ResumeData);
      setOpen(false);
      toast({
        title: "Import successful",
        description: "Your resume has been loaded successfully.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid resume format",
          description: "The JSON file structure is invalid. Please check the format.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Import failed",
          description: "Could not read the file. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid file type",
        description: "Please select a JSON file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File must be less than 1MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        validateAndImport(jsonData);
      } catch {
        toast({
          title: "Invalid JSON",
          description: "Could not parse the JSON file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Resume</DialogTitle>
          <DialogDescription>
            Upload a JSON file with your resume data
          </DialogDescription>
        </DialogHeader>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FileJson className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop a JSON file here, or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
          >
            Select File
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Max file size: 1MB. Only .json files are supported.
        </p>
      </DialogContent>
    </Dialog>
  );
};
