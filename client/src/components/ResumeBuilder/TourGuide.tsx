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
          <h2>🚀 Welcome to Resume Builder</h2>
          <p>
            Create a professional resume in minutes with our AI-powered builder.
          </p>
          <p style={{ fontSize: "13px", marginTop: "12px", fontWeight: 500 }}>
            Let's guide you through creating and downloading your first resume!
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
          <h3>✏️ Step 1: Enter Your Information</h3>
          <p style={{ marginBottom: "10px" }}>
            Start by filling in your details:
          </p>
          <ul style={{ marginBottom: "10px" }}>
            <li>👤 Contact info (name, email, phone)</li>
            <li>💼 Work experience & achievements</li>
            <li>🎓 Education & certifications</li>
            <li>💡 Skills & technologies</li>
          </ul>
          <p style={{ fontSize: "12px", color: "#a0aec0" }}>
            💡 Tip: Use quantifiable results (e.g., "improved sales by 30%")
          </p>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: ".tour-open-templates-drawer",
      content: (
        <div className="tour-content">
          <h3>🎨 Step 2: Open Templates</h3>
          <p style={{ marginBottom: "10px" }}>
            Click the <strong>"Templates"</strong> button above to open the templates drawer!
          </p>
          <ul style={{ marginBottom: "10px" }}>
            <li>👔 21 premium templates</li>
            <li>⭐ ATS-optimized</li>
            <li>👁️ Live preview included</li>
          </ul>
          <p style={{ fontSize: "12px", color: "#a0aec0" }}>
            💡 The drawer pops up from the bottom on mobile, or as a modal on desktop
          </p>
        </div>
      ),
      placement: "bottom" as const,
    },
    {
      target: ".tour-template-gallery",
      content: (
        <div className="tour-content">
          <h3>🎨 Step 3: Choose Your Template</h3>
          <p style={{ marginBottom: "10px" }}>
            Select from <strong>21 premium templates</strong>:
          </p>
          <ul style={{ marginBottom: "10px" }}>
            <li>👔 Professional & Corporate</li>
            <li>🎯 Specialized for your role</li>
            <li>⭐ ATS-optimized (9.0-9.6 score)</li>
          </ul>
          <p style={{ fontSize: "12px", color: "#a0aec0" }}>
            🔄 Click any template to see instant preview
          </p>
        </div>
      ),
      placement: "left" as const,
    },
    {
      target: ".tour-template-preview",
      content: (
        <div className="tour-content">
          <h3>👁️ Step 4: Preview Your Resume</h3>
          <p style={{ marginBottom: "10px" }}>
            See your resume in real-time with:
          </p>
          <ul style={{ marginBottom: "10px" }}>
            <li>📄 Live formatting preview</li>
            <li>🔄 Instant template switching</li>
            <li>✨ Print-ready quality</li>
          </ul>
          <p style={{ fontSize: "12px", color: "#a0aec0" }}>
            Make sure everything looks perfect before downloading!
          </p>
        </div>
      ),
      placement: "left" as const,
    },
    {
      target: ".tour-download-buttons",
      content: (
        <div className="tour-content">
          <h3>⬇️ Step 5: Download Your Resume</h3>
          <p style={{ marginBottom: "10px" }}>
            Choose your format:
          </p>
          <ul style={{ marginBottom: "10px" }}>
            <li>📄 <strong>PDF</strong> - For applying online</li>
            <li>📑 <strong>DOCX</strong> - To edit in Word</li>
          </ul>
          <p style={{ fontSize: "12px", color: "#a0aec0" }}>
            ✅ Ready? Click download to get your professional resume!
          </p>
        </div>
      ),
      placement: "top" as const,
    },
    {
      target: ".tour-import-upload",
      content: (
        <div className="tour-content">
          <h3>📤 Step 6: Import Your Resume</h3>
          <p style={{ marginBottom: "10px" }}>
            Already have a resume? Upload it and we'll:
          </p>
          <ul style={{ marginBottom: "10px" }}>
            <li>🤖 Use AI to extract your data</li>
            <li>📋 Auto-fill all sections</li>
            <li>✨ Reformat with our templates</li>
          </ul>
          <p style={{ fontSize: "12px", color: "#a0aec0" }}>
            Supports PDF and DOCX files
          </p>
        </div>
      ),
      placement: "right" as const,
    },
    {
      target: "body",
      content: (
        <div className="tour-final">
          <h2>✨ You're Ready to Create!</h2>
          <p style={{ marginBottom: "16px" }}>
            You now have everything to build a professional resume that gets interviews. Start by filling in your information, then explore templates, preview your resume, and download it!
          </p>
          <div className="tour-tips">
            <p style={{ fontWeight: 600, marginBottom: "8px", color: "#A78BFA" }}>
              💡 Pro Tips for Success:
            </p>
            <ul style={{ fontSize: "13px", lineHeight: "1.6" }}>
              <li>✅ Use action verbs (Led, Designed, Increased)</li>
              <li>✅ Include metrics & numbers (30% growth)</li>
              <li>✅ Tailor content to each job</li>
              <li>✅ Try 2-3 templates to find your fit</li>
              <li>✅ Proofread before downloading</li>
            </ul>
          </div>
          <p style={{ marginTop: "16px", fontSize: "12px", color: "#a0aec0" }}>
            Need help again? Click the help button (💬) in the bottom-right corner anytime.
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
            primaryColor: "#6B46C1",
            backgroundColor: "#2D1B4E",
            textColor: "#E0E7FF",
            overlayColor: "rgba(0, 0, 0, 0.6)",
            arrowColor: "#2D1B4E",
            spotlightShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
            beaconSize: 48,
          },
          tooltip: {
            backgroundColor: "#2D1B4E",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(107, 70, 193, 0.3)",
            padding: 0,
            color: "#E0E7FF",
            border: "1px solid rgba(107, 70, 193, 0.4)",
          },
          tooltipContainer: {
            textAlign: "left" as const,
          },
          badge: {
            backgroundColor: "#6B46C1",
            color: "#E0E7FF",
            fontWeight: "bold",
            fontSize: "12px",
          },
          buttonNext: {
            backgroundColor: "#6B46C1",
            color: "#E0E7FF",
            borderRadius: "8px",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.2s ease",
          },
          buttonSkip: {
            color: "#A78BFA",
            fontSize: "12px",
            cursor: "pointer",
            transition: "color 0.2s ease",
          },
          buttonBack: {
            color: "#A78BFA",
            fontSize: "13px",
            cursor: "pointer",
            transition: "color 0.2s ease",
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
