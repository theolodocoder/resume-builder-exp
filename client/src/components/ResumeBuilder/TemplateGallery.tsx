import { Card } from "@/components/ui/card";
import { Check, Zap, Star, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export type TemplateType =
  | "professional"
  | "lora"
  | "garamond"
  | "calibri"
  | "compact"
  | "premiumModern"
  | "premiumDark"
  | "premiumCreative"
  | "premiumMinimal"
  | "premiumExecutive";

interface Template {
  id: TemplateType;
  name: string;
  description: string;
  category: string;
  font: string;
  atsScore: number;
  icon: string;
}

const templates: Template[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean, crisp design with Libre Baskerville serif font. Traditional and elegant.",
    category: "Professional",
    font: "Libre Baskerville",
    atsScore: 9.5,
    icon: "📋",
  },
  {
    id: "lora",
    name: "Lora Modern",
    description: "Modern design with Lora font. Perfect for creative professionals.",
    category: "Professional",
    font: "Lora",
    atsScore: 9.0,
    icon: "✨",
  },
  {
    id: "garamond",
    name: "Garamond Classic",
    description: "Timeless elegance with Garamond. ATS-optimized classic design.",
    category: "ATS-Friendly",
    font: "Garamond",
    atsScore: 9.8,
    icon: "👔",
  },
  {
    id: "calibri",
    name: "Calibri Clean",
    description: "Professional and minimal with Calibri. Corporate standard font.",
    category: "Corporate",
    font: "Calibri",
    atsScore: 9.9,
    icon: "💼",
  },
  {
    id: "compact",
    name: "Compact Executive",
    description: "Minimalist design optimized for one-page resumes.",
    category: "Compact",
    font: "System Fonts",
    atsScore: 9.7,
    icon: "🎯",
  },
  {
    id: "premiumModern",
    name: "Premium Modern",
    description: "Contemporary two-column design with sidebar. Tech-forward aesthetic.",
    category: "Premium",
    font: "Inter",
    atsScore: 9.2,
    icon: "✨",
  },
  {
    id: "premiumDark",
    name: "Premium Dark",
    description: "Sleek dark theme with modern accent colors. Perfect for tech professionals.",
    category: "Premium",
    font: "Poppins",
    atsScore: 9.1,
    icon: "🌙",
  },
  {
    id: "premiumCreative",
    name: "Premium Creative",
    description: "Colorful, design-forward aesthetic. Ideal for designers and marketers.",
    category: "Premium",
    font: "Work Sans",
    atsScore: 8.9,
    icon: "🎨",
  },
  {
    id: "premiumMinimal",
    name: "Premium Minimal",
    description: "Ultra-clean design with maximum white space. Sophisticated and elegant.",
    category: "Premium",
    font: "Cormorant",
    atsScore: 9.3,
    icon: "🖤",
  },
  {
    id: "premiumExecutive",
    name: "Premium Executive",
    description: "Sophisticated corporate design for senior-level professionals.",
    category: "Premium",
    font: "Lora",
    atsScore: 9.4,
    icon: "💼",
  },
];

interface TemplateGalleryProps {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
}

export const TemplateGallery = ({ selectedTemplate, onSelectTemplate }: TemplateGalleryProps) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<TemplateType | null>(null);

  const selected = templates.find(t => t.id === selectedTemplate) || templates[0];

  return (
    <div className="glass-panel rounded-xl p-6 mb-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <span>📋</span>
          Resume Templates
        </h3>
        <p className="text-sm text-muted-foreground">
          {selected.icon} <strong>{selected.name}</strong> — {selected.category} • {selected.font} • ATS Score: {selected.atsScore}/10
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {templates.map((template) => (
          <div
            key={template.id}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all relative overflow-hidden h-full",
                selectedTemplate === template.id
                  ? "ring-2 ring-primary shadow-lg bg-primary/10 border-primary"
                  : hoveredTemplate === template.id
                  ? "ring-1 ring-primary/50 hover:shadow-md"
                  : "hover:shadow-sm"
              )}
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="p-4">
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                <div className="text-3xl mb-2">{template.icon}</div>

                <div className="text-sm font-bold mb-1 text-foreground">{template.name}</div>

                <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {template.description}
                </div>

                <div className="space-y-1 mt-3">
                  <div className="text-xs flex items-center gap-1 text-muted-foreground">
                    <span className="w-12 font-semibold">{template.font}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-green-600" />
                      ATS
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i < Math.round(template.atsScore)
                              ? "bg-green-600"
                              : "bg-border"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-secondary/20 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Zap className="h-3 w-3" />
          All templates are ATS-friendly and optimized for applicant tracking systems
        </p>
      </div>
    </div>
  );
};
