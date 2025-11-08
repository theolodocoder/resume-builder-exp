# Resume Builder - Complete Data Flow Documentation

## Overview
This document describes how resume data flows from the client through to PDF and DOCX generation, including the new Projects and Certifications sections.

---

## 1. Default Data (Client-Side)

### Location: `client/src/components/ResumeBuilder/ResumeBuilder.tsx`

The `initialResumeData` object contains complete sample data including:

**Contact Information:**
- Sarah Johnson
- sarah.johnson@email.com
- +1 (555) 123-4567
- San Francisco, CA
- LinkedIn & Website

**Professional Summary:**
- Detailed 2-sentence summary about product management experience

**Work Experience:** 2 positions
- TechCorp Inc. (Jan 2020 - Present)
- InnovateSoft (Jun 2017 - Dec 2019)

**Education:** 2 degrees
- Stanford MBA (May 2017)
- UC Berkeley BS Computer Science (May 2014)

**Projects:** 2 projects ⭐ NEW
1. Analytics Dashboard Platform (Mar 2022 - Dec 2022)
   - Technologies: React, Node.js, PostgreSQL, D3.js
   - Link: https://analytics-platform.com
   - Description with bullet points

2. Mobile AI Assistant App (Jun 2021 - Nov 2021)
   - Technologies: React Native, Python, TensorFlow, Firebase
   - Link: https://github.com/sarahjohnson/ai-assistant
   - Description with bullet points

**Certifications:** 3 certifications ⭐ NEW
1. Certified Scrum Product Owner (CSPO)
   - Issuer: Scrum Alliance
   - Issue Date: Sep 2022
   - Credential ID: CSM-SA-12345
   - URL: https://www.scrumalliance.org

2. Google Analytics Individual Qualification
   - Issuer: Google
   - Issue Date: Mar 2021
   - Expiration Date: Mar 2024
   - Credential ID: GA-IQ-67890

3. Lean Six Sigma Green Belt
   - Issuer: International Association for Six Sigma Certification
   - Issue Date: Jan 2020
   - Credential ID: IATF-GB-11111

**Skills:** 10 skills
- Product Strategy, Agile/Scrum, User Research, Data Analysis, A/B Testing, etc.

---

## 2. Data Flow: Client to Backend

### Step 1: Form Editing
**Component:** `client/src/components/ResumeBuilder/EditorForm.tsx`

Users can:
- Edit all sections including **Projects** and **Certifications**
- Add/remove projects and certifications using "Add Project" and "Add Certification" buttons
- Changes are immediately reflected in the live preview

Handler Functions:
- `addProject()`, `updateProject()`, `removeProject()`
- `addCertification()`, `updateCertification()`, `removeCertification()`

### Step 2: Live Preview
**Component:** `client/src/components/ResumeBuilder/ResumePreview.tsx`

Displays:
- All sections including **Projects** section with technologies and links
- **Certifications** section with issuer and credential info

### Step 3: Export API Call
**Service:** `client/src/services/apiService.ts`

When user clicks "Download PDF" or "Download DOCX":

```typescript
// Data is sent via JSON.stringify() including all sections
body: JSON.stringify(resumeData)

// API Endpoints:
// PDF: POST /api/generate/pdf?template=professional
// DOCX: POST /api/generate/docx
```

The entire `ResumeData` object is sent, containing:
```
{
  contact: {...},
  summary: "...",
  experience: [...],
  education: [...],
  projects: [...],           // ⭐ NEW
  certifications: [...],     // ⭐ NEW
  skills: [...]
}
```

---

## 3. Data Transformation (Server-Side)

### Location: `server/services/dataTransformer.js`

**Input Format (from client):**
```javascript
{
  contact: { fullName, email, phone, location, linkedin, website },
  summary: string,
  experience: Array<{id, company, position, location, startDate, endDate, description}>,
  education: Array<{id, school, degree, field, graduationDate}>,
  projects: Array<{id, name, description, technologies, link, startDate, endDate}>,
  certifications: Array<{id, name, issuer, issueDate, expirationDate, credentialId, credentialUrl}>,
  skills: Array<string>
}
```

**Transformation Process:**

1. **Destructure all data** including projects and certifications
2. **Build sections array** with proper structure:
   - Projects section (if present)
   - Certifications section (if present)
   - All other sections (experience, education, skills, summary)

3. **Transform each project:**
   ```javascript
   {
     primary: project.name,
     secondary: "",
     tertiary: project.description,
     date: formatDateRange(startDate, endDate),
     technologies: project.technologies,
     link: project.link,
     descriptionPoints: splitDescriptionPoints(description)
   }
   ```

4. **Transform each certification:**
   ```javascript
   {
     primary: cert.name,
     secondary: cert.issuer,
     tertiary: "",
     date: cert.issueDate,
     credentialId: cert.credentialId,
     credentialUrl: cert.credentialUrl
   }
   ```

**Output Format (for templates):**
```javascript
{
  name: "Sarah Johnson",
  email: "...",
  phone: "...",
  sections: [
    { title: "Professional Summary", type: "summary", items: [...] },
    { title: "Experience", type: "experience", items: [...] },
    { title: "Education", type: "education", items: [...] },
    { title: "Projects", type: "projects", items: [...] },        // ⭐ NEW
    { title: "Certifications", type: "certifications", items: [...] }, // ⭐ NEW
    { title: "Skills", type: "skills", items: [...] }
  ]
}
```

---

## 4. PDF Generation

### Services:
- `server/services/pdfGenerator.js` - Renders HTML and converts to PDF using Puppeteer
- `server/templates/resume-professional.html` - Handlebars template
- `server/templates/resume-professional.css` - Styling with Libre Baskerville font

### Data Flow:
1. Transformed data → Handlebars template
2. Template iterates through `sections` array
3. For each section, displays items with:
   - **Projects:** Name, technologies, dates, description, link
   - **Certifications:** Name, issuer, date, credential ID
4. CSS applies consistent Libre Baskerville font throughout
5. Puppeteer converts HTML → PDF

### Key Features:
- ✅ Font consistency (Libre Baskerville serif)
- ✅ Bullet point formatting (split by •, \n, ~, |)
- ✅ Professional layout with proper spacing
- ✅ Print-ready (A4 size, proper margins)

---

## 5. DOCX Generation

### Service: `server/services/docxGenerator.js`

Directly builds Word document structure:

```javascript
// For each project:
- Project name (bold, size 22)
- Dates (italics, size 20)
- Description bullet points (List Bullet style)
- Technologies (size 20)
- Link (size 20)

// For each certification:
- Certification name (bold, size 22)
- Issuer and date (size 20, italics)
- Credential ID (size 20)
- Expiration date if present (size 20)
```

### Key Features:
- ✅ Native Word bullet lists
- ✅ Proper spacing between sections
- ✅ Consistent formatting with other sections
- ✅ All data fields preserved

---

## 6. Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT - ResumeBuilder Component                           │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ initialResumeData with:                              │  │
│ │ - Contact, Summary, Experience, Education           │  │
│ │ - Projects (2 items) ⭐                               │  │
│ │ - Certifications (3 items) ⭐                         │  │
│ │ - Skills                                              │  │
│ └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ EditorForm + ResumePreview                          │  │
│ │ - Edit all sections including Projects & Certs     │  │
│ │ - Live preview of all changes                        │  │
│ └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ apiService - Download Handler                        │  │
│ │ POST /api/generate/pdf  (with template param)      │  │
│ │ POST /api/generate/docx                             │  │
│ └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND - Data Processing                                   │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ Express Route: /api/generate/pdf|docx               │  │
│ │ Receives: Full ResumeData JSON                       │  │
│ └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│ ┌──────────────────────────────────────────────────────┐  │
│ │ dataTransformer.js                                   │  │
│ │ - Destructures all fields                            │  │
│ │ - Transforms Projects array ⭐                        │  │
│ │ - Transforms Certifications array ⭐                  │  │
│ │ - Builds sections array for template                │  │
│ └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│ ┌────────────────────────────────────────────────┐        │
│ │ PDF Path           │ DOCX Path                │        │
│ ├────────────────────────────────────────────────┤        │
│ │ pdfGenerator.js    │ docxGenerator.js        │        │
│ │                    │                         │        │
│ │ Template Rendering │ Direct Word Building   │        │
│ │ + Puppeteer        │ with docx library      │        │
│ │ Conversion         │                         │        │
│ └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ OUTPUT - Downloaded Files                                   │
│                                                             │
│ ✅ Sarah Johnson_Resume.pdf                                │
│    - Professional layout with Libre Baskerville font       │
│    - All sections including Projects & Certifications      │
│    - Print-ready format                                     │
│                                                             │
│ ✅ Sarah Johnson_Resume.docx                               │
│    - Fully editable Word document                          │
│    - All sections with proper Word formatting             │
│    - Bullet points in native Word format                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Testing the Data Flow

### Run Test Script:
```bash
cd server
node test-generation.js
```

This will:
1. Show a summary of all data being sent
2. List all projects and certifications
3. Generate PDF and save to Desktop
4. Generate DOCX and save to Desktop
5. Display verification checklist

### What to Verify:
- PDF file appears on Desktop with correct name
- DOCX file appears on Desktop with correct name
- Projects section visible with both projects and all details
- Certifications section visible with all 3 certifications
- Font consistency throughout (Libre Baskerville)
- Bullet points formatted correctly (one per line)

---

## 8. Key Points

### Default Data ✅
- Pre-populated in client for immediate preview
- Includes 2 sample projects
- Includes 3 sample certifications
- Matches exactly between client and test

### Data Sending ✅
- API service uses `JSON.stringify(resumeData)`
- Entire object including projects/certifications sent
- No data filtering or transformation on client

### Backend Processing ✅
- dataTransformer properly handles projects array
- dataTransformer properly handles certifications array
- Both are transformed with all required fields
- Data properly passed to PDF and DOCX generators

### Font Consistency ✅
- CSS explicitly includes `font-family: 'Libre Baskerville', 'Georgia', serif;` on description list
- All text uses same serif font family
- Consistent across projects and certifications sections

### Resume Quality ✅
- Professional layout maintained
- All sections properly ordered
- Proper spacing between items
- Print-ready PDF format
- Editable Word document format

---

## Files Modified for Projects & Certifications Feature

**Client:**
- ✅ `client/src/components/ResumeBuilder/ResumeBuilder.tsx` - Sample data
- ✅ `client/src/components/ResumeBuilder/EditorForm.tsx` - Form handlers and UI
- ✅ `client/src/components/ResumeBuilder/ResumePreview.tsx` - Preview rendering

**Server:**
- ✅ `server/services/dataTransformer.js` - Data transformation
- ✅ `server/services/docxGenerator.js` - DOCX rendering
- ✅ `server/templates/resume-professional.html` - Template structure
- ✅ `server/templates/resume-professional.css` - Styling and fonts

**Testing:**
- ✅ `server/test-generation.js` - End-to-end test script
