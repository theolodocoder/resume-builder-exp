import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { uploadResumeForParsingApi, getParsingJobStatusApi, getParsedResumeApi } from "@/services/apiService";
import { ResumeData } from "./ResumeBuilder";

interface ResumeUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResumeLoaded: (data: ResumeData) => void;
}

export function ResumeUploadDialog({
  open,
  onOpenChange,
  onResumeLoaded,
}: ResumeUploadDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "image/jpeg", "image/png", "image/gif", "image/bmp"];

  const handleFileSelect = async (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, JPG, PNG, GIF, or BMP file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }

    await uploadAndParseResume(file);
  };

  const uploadAndParseResume = async (file: File) => {
    try {
      setIsUploading(true);
      setJobId(null);
      setJobProgress(0);
      setJobStatus(null);

      // Step 1: Upload file
      setJobStatus("Uploading file...");
      const uploadResponse = await uploadResumeForParsingApi(file);
      setJobId(uploadResponse.jobId);
      setJobProgress(10);

      // Step 2: Poll for job completion with exponential backoff
      setJobStatus("Processing resume...");
      let completed = false;
      let attempts = 0;
      const maxAttempts = 300; // 5 minutes max with adaptive polling
      let pollDelay = 500; // Start with 500ms, increase gradually

      while (!completed && attempts < maxAttempts) {
        const statusResponse = await getParsingJobStatusApi(uploadResponse.jobId);

        if (statusResponse.status === "completed") {
          setJobProgress(90);

          // Step 3: Fetch parsed result
          setJobStatus("Loading parsed data...");
          if (!statusResponse.result?.resumeId) {
            throw new Error("Job completed but no resumeId returned");
          }
          const parsedResult = await getParsedResumeApi(statusResponse.result.resumeId);
          setJobProgress(95);

          // Step 4: Validate parsed data has required fields
          if (!parsedResult.parsed || !parsedResult.parsed.contact) {
            throw new Error("Parsed data missing required fields");
          }

          // Step 5: Transform parsed data to ResumeData format
          const transformedData = transformParsedDataToResumeFormat(parsedResult.parsed);
          setJobProgress(100);

          // Show success toast
          toast({
            title: "Resume parsed successfully",
            description: `Confidence: ${(parsedResult.confidence * 100).toFixed(1)}%`,
          });

          // Load data into form
          onResumeLoaded(transformedData);
          setIsUploading(false);
          onOpenChange(false);
          completed = true;
        } else if (statusResponse.status === "failed") {
          throw new Error(statusResponse.error || "Parsing failed");
        } else {
          // Update progress based on job status
          const statusProgress: Record<string, number> = {
            wait: 15,
            active: 45,
            completed: 90,
            delayed: 25,
            paused: 35,
          };
          setJobProgress(statusProgress[statusResponse.status] || 30);
          const statusText = statusResponse.status.charAt(0).toUpperCase() + statusResponse.status.slice(1);
          setJobStatus(`${statusText}... (${statusResponse.progress}%)`);

          // Adaptive polling: increase delay as we wait longer
          // First 30 seconds: 500ms, then gradually increase to 2 seconds
          if (attempts > 60) {
            pollDelay = Math.min(2000, pollDelay + 50);
          }

          // Wait before polling again
          await new Promise((resolve) => setTimeout(resolve, pollDelay));
          attempts++;
        }
      }

      if (!completed) {
        throw new Error("Job processing timeout after 5 minutes. The resume might be too complex to parse. Please try a simpler resume.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to parse resume";
      toast({
        title: "Error parsing resume",
        description: errorMessage,
        variant: "destructive",
      });
      setIsUploading(false);
      setJobId(null);
      setJobProgress(0);
      setJobStatus(null);
    }
  };

  const transformParsedDataToResumeFormat = (parsed: any): ResumeData => {
    return {
      contact: {
        fullName: parsed.contact?.name || "",
        email: parsed.contact?.email || "",
        phone: parsed.contact?.phone || "",
        location: parsed.contact?.location || "",
        linkedin: parsed.contact?.links?.find((l: string) => l.includes("linkedin")) || "",
        website: parsed.contact?.links?.find((l: string) => !l.includes("linkedin")) || "",
      },
      summary: parsed.summary || "",
      experience: (parsed.experiences || []).map((exp: any, idx: number) => ({
        id: `exp-${idx}`,
        company: exp.company || "",
        position: exp.role || "",
        location: "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "Present",
        description: Array.isArray(exp.description) ? exp.description.join("\n") : exp.description || "",
      })),
      education: (parsed.education || []).map((edu: any, idx: number) => ({
        id: `edu-${idx}`,
        school: edu.school || "",
        degree: edu.degree || "",
        field: edu.field || "",
        graduationDate: edu.endDate || edu.startDate || "",
      })),
      projects: (parsed.projects || []).map((proj: any, idx: number) => ({
        id: `proj-${idx}`,
        name: proj.title || "",
        description: proj.description || "",
        link: proj.link || "",
      })),
      certifications: (parsed.certifications || []).map((cert: any, idx: number) => ({
        id: `cert-${idx}`,
        name: cert.title || "",
        issuer: cert.issuer || "",
        issueDate: cert.issueDate || "",
      })),
      skills: parsed.skills || [],
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Resume to Parse</DialogTitle>
          <DialogDescription>
            Upload an existing resume (PDF, DOCX, or image) to automatically extract and fill in your resume data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isUploading ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif,.bmp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                Drag and drop your resume here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports PDF, DOCX, JPG, PNG, GIF, BMP (Max 10MB)
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{jobStatus}</span>
                  <span className="text-sm text-gray-500">{jobProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${jobProgress}%` }}
                  />
                </div>
              </div>

              {jobProgress === 100 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Resume parsed successfully!</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (!isUploading) {
                onOpenChange(false);
              }
            }}
            disabled={isUploading}
          >
            {isUploading ? "Processing..." : "Cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
