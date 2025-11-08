# Resume Template System Guide

## 🎯 Overview

This guide explains the new **professional template preview and management system** that allows you to:
- ✅ **Design templates** with complete control over HTML and CSS
- ✅ **Preview templates** before using them in production
- ✅ **Test printing** to ensure PDFs render correctly
- ✅ **Manage multiple templates** easily
- ✅ **Switch templates** without code changes

---

## 📁 File Structure

### Server Files

```
server/
├── templates/
│   ├── resume-professional.html    (NEW - Professional template)
│   ├── resume-professional.css     (NEW - Professional styling)
│   ├── resume-template.html        (Original classic template)
│   └── resume-style.css            (Original classic styling)
│
├── services/
│   ├── templateManager.js          (NEW - Template management)
│   ├── dataTransformer.js          (Converts client data)
│   └── pdfGenerator.js             (Updated to use templateManager)
│
├── routes/
│   ├── templates.js                (NEW - Template API routes)
│   └── generate.js                 (Updated with template support)
│
└── server.js                       (Updated to include template routes)
```

### Client Files

```
client/src/
├── components/
│   └── ResumeBuilder/
│       ├── TemplateManager.tsx     (NEW - Template selector)
│       ├── TemplatePreview.tsx     (NEW - Live preview)
│       └── ResumeBuilder.tsx       (Main component)
│
└── services/
    ├── templateService.ts          (NEW - Template utilities)
    └── apiService.ts               (Updated with template support)
```

---

## 🎨 Professional Template Design

### Template Structure

The professional template uses a clean, Libre Baskerville serif design:

```html
<!DOCTYPE html>
<html>
  <head>
    <style>{{{styles}}}</style>
  </head>
  <body>
    <div class="resume-container">
      <!-- Personal Info -->
      <div class="personal-info">
        <h1 class="full-name">{{name}}</h1>
        <div class="contact-line">
          <!-- Contact info with separators -->
        </div>
      </div>

      <!-- Sections (dynamically rendered) -->
      {{#each sections}}
      <div class="resume-section">
        <h2 class="section-title">{{title}}</h2>
        {{#each items}}
        <div class="section-item">
          <!-- Item content -->
        </div>
        {{/each}}
      </div>
      {{/each}}
    </div>
  </body>
</html>
```

### Key Design Features

**Typography:**
- Font: Libre Baskerville (Google Fonts)
- Title: 24pt, bold, uppercase
- Sections: 11pt, bold, uppercase
- Body: 10.5pt, regular
- Details: 10pt, regular/italic

**Spacing:**
- Section margins: 14px
- Item margins: 10px
- Header padding: 12px
- Proper line heights: 1.3-1.4

**Visual Elements:**
- Black underlines on section titles
- Bullet separators in contact info
- Professional color hierarchy
- Consistent margins for A4 printing

---

## 🔧 API Endpoints

### Get Available Templates

```bash
GET /api/templates
```

**Response:**
```json
{
  "templates": [
    {
      "id": "professional",
      "name": "Professional",
      "description": "Clean, crisp design with Libre Baskerville serif font"
    },
    {
      "id": "classic",
      "name": "Classic",
      "description": "Traditional resume format"
    }
  ]
}
```

### Get Specific Template

```bash
GET /api/templates/:templateId
```

**Response:**
```json
{
  "id": "professional",
  "name": "Professional",
  "html": "<html>...</html>",
  "css": "body { ... }"
}
```

### Generate PDF with Template

```bash
POST /api/generate/pdf?template=professional
Content-Type: application/json

{
  "contact": { ... },
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [ ... ]
}
```

---

## 💻 Client Components

### TemplateManager

Allows users to browse and select templates:

```typescript
<TemplateManager
  isOpen={isOpen}
  onClose={handleClose}
  onSelectTemplate={handleSelectTemplate}
  resumeData={resumeData}
  currentTemplate={currentTemplate}
/>
```

**Features:**
- Displays all available templates
- Shows template descriptions
- Highlights recommended template
- Preview button for each template

### TemplatePreview

Shows live preview of template with real data:

```typescript
<TemplatePreview
  isOpen={isOpen}
  onClose={handleClose}
  templateName="Professional"
  templateHtml={html}
  templateCss={css}
  resumeData={resumeData}
/>
```

**Features:**
- Live iframe preview
- Print preview functionality
- Download HTML option
- Shows actual resume data

---

## 📋 How to Add a New Template

### Step 1: Create Template Files

Create two files in `server/templates/`:

**resume-custom.html:**
```html
<!DOCTYPE html>
<html>
  <head>
    <style>{{{styles}}}</style>
  </head>
  <body>
    <!-- Your custom design -->
  </body>
</html>
```

**resume-custom.css:**
```css
/* Your custom styles */
body { ... }
```

### Step 2: Register Template

Update `server/services/templateManager.js`:

```javascript
const TEMPLATES = {
  // ... existing templates
  custom: {
    id: "custom",
    name: "Custom",
    description: "Your custom template description",
    htmlFile: "resume-custom.html",
    cssFile: "resume-custom.css",
    default: false,
  },
};
```

### Step 3: Use Template

Select from UI or call API:

```bash
POST /api/generate/pdf?template=custom
```

---

## 🎯 Template Variables

The template system supports Handlebars syntax:

### Simple Variables
```handlebars
{{name}}              <!-- Full name -->
{{email}}             <!-- Email address -->
{{phone}}             <!-- Phone number -->
{{location}}          <!-- Location -->
{{linkedin_display}}  <!-- LinkedIn display URL -->
{{website_display}}   <!-- Website display URL -->
```

### Sections (Repeating)
```handlebars
{{#each sections}}
  Title: {{this.title}}
  Type: {{this.type}}
  {{#each this.items}}
    {{this.primary}}
    {{this.secondary}}
    {{this.tertiary}}
    {{this.date}}
    {{#if this.descriptionPoints}}
      {{#each this.descriptionPoints}}
        {{this}}
      {{/each}}
    {{/if}}
  {{/each}}
{{/each}}
```

---

## 🖨️ Print Optimization

### CSS Print Styles

```css
@page {
  size: A4;
  margin: 0.5in 0.6in;
}

@media print {
  /* Hide screen-only elements */
  .no-print { display: none; }

  /* Prevent page breaks */
  .section-item { page-break-inside: avoid; }

  /* Set print colors */
  a { color: #0062BC; }
}
```

### Best Practices

1. **Use pt (points)** for font sizes in print media
2. **Avoid fixed heights** that cause content to overflow
3. **Use page-break-inside: avoid** on important elements
4. **Set explicit margins** for A4 sizing
5. **Test with different PDF viewers** (Chrome, Firefox, Adobe)

---

## 🧪 Testing Templates

### In Browser

1. Open template preview dialog
2. Click "Print Preview"
3. Check formatting in print dialog
4. Verify on different browsers

### After Download

1. Open PDF in your default viewer
2. Check spacing and alignment
3. Verify fonts rendered correctly
4. Test printing to physical paper
5. Check ATS compatibility

### Common Issues

| Issue | Solution |
|-------|----------|
| Fonts look wrong | Ensure @font-face imports work |
| Content gets cut off | Check @page margins and max-width |
| Spacing looks off | Verify px vs pt usage |
| Colors wrong in print | Add `!important` to print media rules |
| Page breaks wrong | Use `page-break-inside: avoid` |

---

## 🚀 Integration with ResumeBuilder

### In ResumeBuilder Component

Add template selector button:

```typescript
import { TemplateManager } from "./TemplateManager";

const [showTemplates, setShowTemplates] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState("professional");

<Button onClick={() => setShowTemplates(true)}>
  Change Template
</Button>

<TemplateManager
  isOpen={showTemplates}
  onClose={() => setShowTemplates(false)}
  onSelectTemplate={setSelectedTemplate}
  resumeData={resumeData}
  currentTemplate={selectedTemplate}
/>
```

### Pass template to download:

```typescript
const handleDownload = async (format: "pdf" | "docx") => {
  try {
    if (format === "pdf") {
      await generatePdfApi(resumeData, selectedTemplate);
    } else {
      await generateDocxApi(resumeData);
    }
  } catch (error) {
    // Handle error
  }
};
```

---

## 📊 Data Flow

```
User fills resume data
    ↓
[Select Template]
    ↓
Client sends to API:
  - Resume data
  - Template ID
    ↓
Server:
  1. Load template HTML and CSS
  2. Transform resume data
  3. Render with Handlebars
  4. Puppeteer → PDF
    ↓
Browser downloads file
```

---

## 🎨 Customizing Professional Template

### Change Fonts

Update CSS:
```css
@import url('https://fonts.googleapis.com/css2?family=YourFont&display=swap');

.resume-container {
  font-family: 'YourFont', serif;
}
```

### Adjust Colors

```css
.email-link {
  color: #0062BC; /* Change to your color */
}
```

### Modify Spacing

```css
.section-item {
  margin-bottom: 10px; /* Adjust spacing */
  padding-bottom: 8px;
}
```

### Change Section Titles

```css
.section-title {
  font-size: 11pt; /* Adjust size */
  text-transform: uppercase; /* Or capitalize */
  border-bottom: 1.25px solid #000; /* Adjust underline */
}
```

---

## ✅ Quality Checklist

Before deploying a new template:

- [ ] Template loads without errors
- [ ] All resume data displays correctly
- [ ] PDF generates successfully
- [ ] Print preview looks professional
- [ ] Contact info formats properly
- [ ] Dates display correctly
- [ ] Bullet points align correctly
- [ ] Section underlines render
- [ ] Spacing is consistent
- [ ] No text overlaps
- [ ] Links are colored correctly
- [ ] Works in Chrome print preview
- [ ] Works in Firefox print preview
- [ ] A4 page size respected
- [ ] Margins are appropriate

---

## 📞 Troubleshooting

### Template won't load

```
Check:
1. File names match in templateManager.js
2. CSS @font-face URLs are correct
3. No syntax errors in HTML
4. No syntax errors in CSS
```

### PDF looks different than preview

```
Check:
1. Screen CSS vs print media rules
2. Font rendering differences
3. Page margins (@page rules)
4. Browser-specific rendering
```

### Text overflows page

```
Check:
1. @page margin settings
2. Font sizes (use pt not em)
3. Line heights (1.3-1.4 recommended)
4. Container max-width
```

---

## 🎓 Best Practices

1. **Design mobile-first** - Create responsive CSS
2. **Use semantic HTML** - Proper structure for ATS
3. **Test extensively** - Multiple browsers and printers
4. **Keep it simple** - Less CSS = fewer issues
5. **Document changes** - Note any customizations
6. **Version templates** - Track iterations
7. **Get feedback** - Test with real resumes
8. **Measure performance** - Keep file sizes small

---

## 📚 Resources

- [Handlebars.js Docs](https://handlebarsjs.com/)
- [Google Fonts](https://fonts.google.com/)
- [CSS Print Media](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/print)
- [Puppeteer PDF Options](https://pptr.dev/api/puppeteer.pdfoptions)

---

## 🎉 Summary

You now have a **complete template system** that allows you to:

✅ Design custom resume templates
✅ Preview before generation
✅ Test PDF output in browser
✅ Manage multiple templates
✅ Switch templates dynamically
✅ Maintain professional quality

**Happy template designing! 🚀**
