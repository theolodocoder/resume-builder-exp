const fs = require("fs-extra");
const path = require("path");

const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

/**
 * Template configuration
 */
const TEMPLATES = {
  professional: {
    id: "professional",
    name: "Professional",
    description: "Clean, crisp design with Libre Baskerville serif font. Traditional and elegant.",
    category: "Professional",
    font: "Libre Baskerville",
    atsScore: 9.5,
    htmlFile: "resume-professional.html",
    cssFile: "resume-professional.css",
    default: true,
  },
  lora: {
    id: "lora",
    name: "Lora Modern",
    description: "Modern design with Lora font. Perfect for creative professionals.",
    category: "Professional",
    font: "Lora",
    atsScore: 9.0,
    htmlFile: "resume-lora.html",
    cssFile: "resume-lora.css",
    default: false,
  },
  garamond: {
    id: "garamond",
    name: "Garamond Classic",
    description: "Timeless elegance with Garamond. ATS-optimized classic design.",
    category: "ATS-Friendly",
    font: "Garamond",
    atsScore: 9.8,
    htmlFile: "resume-garamond.html",
    cssFile: "resume-garamond.css",
    default: false,
  },
  calibri: {
    id: "calibri",
    name: "Calibri Clean",
    description: "Professional and minimal with Calibri. Corporate standard font.",
    category: "Corporate",
    font: "Calibri",
    atsScore: 9.9,
    htmlFile: "resume-calibri.html",
    cssFile: "resume-calibri.css",
    default: false,
  },
  compact: {
    id: "compact",
    name: "Compact Executive",
    description: "Minimalist design optimized for one-page resumes.",
    category: "Compact",
    font: "System Fonts",
    atsScore: 9.7,
    htmlFile: "resume-compact.html",
    cssFile: "resume-compact.css",
    default: false,
  },
  premiumModern: {
    id: "premiumModern",
    name: "Premium Modern",
    description: "Contemporary two-column design with sidebar. Perfect for tech and creative professionals.",
    category: "Premium",
    font: "Inter",
    atsScore: 9.2,
    htmlFile: "resume-premium-modern.html",
    cssFile: "resume-premium-modern.css",
    default: false,
  },
  premiumDark: {
    id: "premiumDark",
    name: "Premium Dark",
    description: "Sleek dark theme with modern accent colors. Ideal for tech professionals.",
    category: "Premium",
    font: "Poppins",
    atsScore: 9.1,
    htmlFile: "resume-premium-dark.html",
    cssFile: "resume-premium-dark.css",
    default: false,
  },
  premiumCreative: {
    id: "premiumCreative",
    name: "Premium Creative",
    description: "Colorful, design-forward aesthetic with vibrant accents. Perfect for designers and marketers.",
    category: "Premium",
    font: "Work Sans",
    atsScore: 8.9,
    htmlFile: "resume-premium-creative.html",
    cssFile: "resume-premium-creative.css",
    default: false,
  },
  premiumMinimal: {
    id: "premiumMinimal",
    name: "Premium Minimal",
    description: "Ultra-clean design with maximum white space. Sophisticated and elegant.",
    category: "Premium",
    font: "Cormorant",
    atsScore: 9.3,
    htmlFile: "resume-premium-minimal.html",
    cssFile: "resume-premium-minimal.css",
    default: false,
  },
  premiumExecutive: {
    id: "premiumExecutive",
    name: "Premium Executive",
    description: "Sophisticated corporate design for senior-level professionals. Traditional with modern refinement.",
    category: "Premium",
    font: "Lora",
    atsScore: 9.4,
    htmlFile: "resume-premium-executive.html",
    cssFile: "resume-premium-executive.css",
    default: false,
  },
};

/**
 * Get all available templates
 */
async function getAvailableTemplates() {
  return Object.keys(TEMPLATES).map((key) => ({
    id: TEMPLATES[key].id,
    name: TEMPLATES[key].name,
    description: TEMPLATES[key].description,
  }));
}

/**
 * Get a specific template
 */
async function getTemplate(templateId) {
  const template = TEMPLATES[templateId];

  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const htmlPath = path.join(TEMPLATES_DIR, template.htmlFile);
  const cssPath = path.join(TEMPLATES_DIR, template.cssFile);

  const [html, css] = await Promise.all([
    fs.readFile(htmlPath, "utf-8"),
    fs.readFile(cssPath, "utf-8"),
  ]);

  return {
    id: template.id,
    name: template.name,
    html,
    css,
  };
}

/**
 * Get default template
 */
async function getDefaultTemplate() {
  const defaultId = Object.keys(TEMPLATES).find(
    (key) => TEMPLATES[key].default
  );
  return getTemplate(defaultId || "professional");
}

/**
 * Load template HTML and CSS
 */
async function loadTemplate(templateId = "professional") {
  const template = TEMPLATES[templateId];

  if (!template) {
    console.warn(`Template not found: ${templateId}, using default`);
    return loadTemplate("professional");
  }

  const htmlPath = path.join(TEMPLATES_DIR, template.htmlFile);
  const cssPath = path.join(TEMPLATES_DIR, template.cssFile);

  const [html, css] = await Promise.all([
    fs.readFile(htmlPath, "utf-8"),
    fs.readFile(cssPath, "utf-8"),
  ]);

  return { html, css, templateId: template.id };
}

/**
 * Validate template exists
 */
function isValidTemplate(templateId) {
  return templateId in TEMPLATES;
}

module.exports = {
  getAvailableTemplates,
  getTemplate,
  getDefaultTemplate,
  loadTemplate,
  isValidTemplate,
  TEMPLATES,
};
