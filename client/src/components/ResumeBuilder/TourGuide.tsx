import React, { useState, useEffect } from "react";
import Joyride, { Step, STATUS, ACTIONS } from "react-joyride";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./TourGuide.css";

export interface TourGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
  run?: boolean;
}

export const TourGuide: React.FC<TourGuideProps> = ({
  isOpen: initialOpen = false,
  onClose,
  run: initialRun = false,
}) => {
  const [run, setRun] = useState(initialRun);
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    const saved = localStorage.getItem("resume-builder-tour-seen");
    return saved === "true";
  });

  useEffect(() => {
    setIsOpen(initialOpen);
    setRun(initialRun);
  }, [initialOpen, initialRun]);

  const tourSteps: Step[] = [
    {
      target: "body",
      content: (
        <div className="tour-welcome">
          <h2>Welcome to AI Resume Builder 🚀</h2>
          <p>
            Let's take a quick tour to help you create an amazing resume in
            minutes!
          </p>
          <p style={{ fontSize: "12px", marginTop: "12px", opacity: 0.7 }}>
            You can restart this tour anytime from the help button.
          </p>
        </div>
      ),
      placement: "center" as const,
      disableBeacon: true,
    },
    {
      target: ".tour-editor-form",
      content: (
        <div className="tour-content">
          <h3>📝 Build Your Resume</h3>
          <p>
            Fill in your information here. Start with your contact details, then
            add your professional experience, education, and skills.
          </p>
          <ul>
            <li>✓ Contact information</li>
            <li>✓ Professional summary</li>
            <li>✓ Work experience</li>
            <li>✓ Education & certifications</li>
          </ul>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: ".tour-template-gallery",
      content: (
        <div className="tour-content">
          <h3>🎨 Choose Your Template</h3>
          <p>
            Select from 21 professionally designed templates. Each is ATS-optimized
            (9.0-9.6 score) to pass applicant tracking systems.
          </p>
          <p>
            <strong>Pro tip:</strong> Try different templates - the live preview
            updates instantly!
          </p>
        </div>
      ),
      placement: "bottom" as const,
    },
    {
      target: ".tour-template-preview",
      content: (
        <div className="tour-content">
          <h3>👁️ Live Preview</h3>
          <p>
            See exactly how your resume will look in real-time. This preview
            reflects your selected template and all your changes instantly.
          </p>
          <p>
            <strong>Perfect for:</strong> Checking formatting before download
          </p>
        </div>
      ),
      placement: "left" as const,
    },
    {
      target: ".tour-download-buttons",
      content: (
        <div className="tour-content">
          <h3>⬇️ Download Your Resume</h3>
          <p>Export your resume in multiple formats:</p>
          <ul>
            <li>📄 PDF - Professional & printable</li>
            <li>📑 DOCX - Edit in Microsoft Word</li>
          </ul>
          <p style={{ marginTop: "8px" }}>
            All downloads are perfectly formatted with your selected template.
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: ".tour-import-upload",
      content: (
        <div className="tour-content">
          <h3>📤 Import Your Existing Resume</h3>
          <p>
            Have an existing resume? You can:
          </p>
          <ul>
            <li>🔼 Upload a PDF or DOCX file</li>
            <li>📋 Paste data directly</li>
            <li>📱 Our AI will parse it for you</li>
          </ul>
          <p style={{ marginTop: "8px" }}>
            <strong>Note:</strong> Resume parsing uses AI to extract your information.
          </p>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: "body",
      content: (
        <div className="tour-final">
          <h2>✨ You're All Set!</h2>
          <p>
            Now you have everything you need to create a professional resume that
            gets results.
          </p>
          <div className="tour-tips">
            <p style={{ fontWeight: 600, marginBottom: "8px" }}>
              💡 Pro Tips:
            </p>
            <ul>
              <li>Use a professional email address</li>
              <li>Quantify your achievements (e.g., "increased by 50%")</li>
              <li>Keep formatting consistent</li>
              <li>Try multiple templates to find your best fit</li>
              <li>Proofread everything before downloading</li>
            </ul>
          </div>
          <p style={{ marginTop: "12px", fontSize: "12px", opacity: 0.7 }}>
            Questions? Click the help button anytime to restart this tour.
          </p>
        </div>
      ),
      placement: "center" as const,
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status, action } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      setIsOpen(false);
      localStorage.setItem("resume-builder-tour-seen", "true");
      setHasSeenTour(true);

      if (onClose) {
        onClose();
      }
    }

    if (action === ACTIONS.CLOSE) {
      setRun(false);
      setIsOpen(false);

      if (onClose) {
        onClose();
      }
    }
  };

  const startTour = () => {
    setIsOpen(true);
    setRun(true);
  };

  return (
    <>
      {/* Help Button - Always visible */}
      <Button
        onClick={startTour}
        size="icon"
        variant="outline"
        className="help-button"
        title="Start tour guide"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Joyride Tour Component */}
      <Joyride
        steps={tourSteps}
        run={run}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: "#667eea",
            backgroundColor: "#ffffff",
            textColor: "#2d3748",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            arrowColor: "#ffffff",
            spotlightShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          },
          tooltip: {
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            padding: 0,
            color: "#2d3748",
          },
          tooltipContainer: {
            textAlign: "left" as const,
          },
          badge: {
            backgroundColor: "#667eea",
            color: "#ffffff",
            fontWeight: "bold",
          },
          buttonNext: {
            backgroundColor: "#667eea",
            color: "#ffffff",
            borderRadius: "6px",
            padding: "8px 16px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
          },
          buttonSkip: {
            color: "#a0aec0",
            fontSize: "12px",
            cursor: "pointer",
          },
          buttonBack: {
            color: "#667eea",
            fontSize: "13px",
            cursor: "pointer",
          },
        }}
        locale={{
          back: "Back",
          close: "Close",
          last: "Finish",
          next: "Next",
          open: "Open",
          skip: "Skip Tour",
        }}
      />
    </>
  );
};
