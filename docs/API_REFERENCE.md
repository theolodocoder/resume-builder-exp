# Resume Builder API Reference

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Generate PDF
**Endpoint:** `POST /api/generate/pdf`

**Query Parameters:**
- `template` (optional): Template ID, defaults to "professional"
  - Supported values: "professional", "classic"

**Request Body:**
```typescript
{
  contact: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    graduationDate: string;
  }>;
  projects?: Array<{
    id: string;
    name: string;
    description: string;
    technologies?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
  }>;
  skills: string[];
}
```

**Response:**
- **Status:** 200 OK
- **Content-Type:** application/pdf
- **Body:** PDF file stream
- **Headers:**
  - `Content-Disposition: attachment; filename={name}_Resume.pdf`

**Example:**
```bash
curl -X POST http://localhost:3000/api/generate/pdf?template=professional \
  -H "Content-Type: application/json" \
  -d @resume-data.json \
  --output resume.pdf
```

---

### 2. Generate DOCX
**Endpoint:** `POST /api/generate/docx`

**Request Body:** Same as PDF endpoint

**Response:**
- **Status:** 200 OK
- **Content-Type:** application/vnd.openxmlformats-officedocument.wordprocessingml.document
- **Body:** DOCX file stream
- **Headers:**
  - `Content-Disposition: attachment; filename={name}_Resume.docx`

**Example:**
```bash
curl -X POST http://localhost:3000/api/generate/docx \
  -H "Content-Type: application/json" \
  -d @resume-data.json \
  --output resume.docx
```

---

### 3. Get Available Templates
**Endpoint:** `GET /api/templates`

**Response:**
```json
{
  "templates": ["professional", "classic"]
}
```

---

### 4. Get Specific Template
**Endpoint:** `GET /api/templates/{templateId}`

**Response:**
```json
{
  "id": "professional",
  "name": "Professional Template",
  "html": "<!DOCTYPE html>...",
  "css": "body { ... }"
}
```

---

## Default Sample Data

The application comes with pre-configured default data for testing and demonstration:

### Contact Information
```javascript
{
  fullName: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/sarahjohnson",
  website: "sarahjohnson.dev"
}
```

### Professional Summary
> Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative software solutions. Proven track record of launching products that drive user engagement and revenue growth. Expert in agile methodologies, user research, and data-driven decision making.

### Experience (2 items)
1. **Senior Product Manager** - TechCorp Inc. (Jan 2020 - Present)
2. **Product Manager** - InnovateSoft (Jun 2017 - Dec 2019)

### Education (2 items)
1. Stanford University - MBA in Technology Management (May 2017)
2. UC Berkeley - BS in Computer Science (May 2014)

### Projects (2 items) ⭐
1. **Analytics Dashboard Platform** (Mar 2022 - Dec 2022)
   - Technologies: React, Node.js, PostgreSQL, D3.js
   - Link: https://analytics-platform.com
   - Description: Comprehensive real-time analytics dashboard serving 50K+ users

2. **Mobile AI Assistant App** (Jun 2021 - Nov 2021)
   - Technologies: React Native, Python, TensorFlow, Firebase
   - Link: https://github.com/sarahjohnson/ai-assistant
   - Description: AI-powered mobile assistant with 250K+ downloads

### Certifications (3 items) ⭐
1. **Certified Scrum Product Owner (CSPO)**
   - Issuer: Scrum Alliance
   - Issue Date: Sep 2022
   - Credential ID: CSM-SA-12345
   - URL: https://www.scrumalliance.org

2. **Google Analytics Individual Qualification**
   - Issuer: Google
   - Issue Date: Mar 2021
   - Expiration Date: Mar 2024
   - Credential ID: GA-IQ-67890

3. **Lean Six Sigma Green Belt**
   - Issuer: International Association for Six Sigma Certification
   - Issue Date: Jan 2020
   - Credential ID: IATF-GB-11111

### Skills (10 items)
- Product Strategy
- Agile/Scrum
- User Research
- Data Analysis
- A/B Testing
- Roadmap Planning
- Stakeholder Management
- SQL
- JIRA
- Figma

---

## Description Format

Descriptions support multiple bullet point separators:
- `•` (bullet character)
- `\n` (newline)
- `~` (tilde)
- `|` (pipe)

**Example:**
```
Lead product strategy and roadmap • Increased retention by 35% • Managed team of 12 • Launched 3 releases
```

This will be split into 4 bullet points in both PDF and DOCX output.

---

## Error Handling

### Invalid Request (400)
```json
{
  "message": "No data provided"
}
```

### Server Error (500)
```json
{
  "message": "Error generating PDF",
  "error": "Specific error message"
}
```

---

## Client Integration

### Using apiService (Recommended)

**For PDF:**
```typescript
import { generatePdfApi } from "@/services/apiService";

try {
  await generatePdfApi(resumeData, "professional");
  // PDF automatically downloads
} catch (error) {
  console.error("PDF generation failed:", error);
}
```

**For DOCX:**
```typescript
import { generateDocxApi } from "@/services/apiService";

try {
  await generateDocxApi(resumeData);
  // DOCX automatically downloads
} catch (error) {
  console.error("DOCX generation failed:", error);
}
```

### Manual Fetch

```typescript
const response = await fetch("http://localhost:3000/api/generate/pdf?template=professional", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(resumeData),
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "resume.pdf";
link.click();
```

---

## Testing

### Using test script
```bash
cd server
node test-generation.js
```

This will:
1. Display summary of default data
2. Generate PDF with all sections
3. Generate DOCX with all sections
4. Save files to Desktop for verification
5. Show checklist of what to verify

### Using cURL
```bash
# Test PDF generation
curl -X POST http://localhost:3000/api/generate/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "contact": {"fullName": "Test User", "email": "test@example.com", "phone": "+1-555-0000", "location": "City, State"},
    "summary": "Test summary",
    "experience": [],
    "education": [],
    "projects": [],
    "certifications": [],
    "skills": ["Skill1", "Skill2"]
  }' \
  --output test.pdf
```

---

## Data Validation

All fields with `?` are optional. Required fields:
- `contact.fullName`
- `contact.email`
- `contact.phone`
- `contact.location`
- `summary`
- `experience` (array, can be empty)
- `education` (array, can be empty)
- `skills` (array, can be empty)

Optional sections:
- `projects` - Array of project objects
- `certifications` - Array of certification objects

---

## Response Headers

### PDF Response
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Sarah Johnson_Resume.pdf"
Content-Length: 93456 (varies)
```

### DOCX Response
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="Sarah Johnson_Resume.docx"
Content-Length: 12345 (varies)
```

---

## Performance Notes

- PDF generation using Puppeteer: ~2-5 seconds
- DOCX generation: <1 second
- Recommended timeout: 30 seconds
- Max data size: 10MB (configured in express middleware)

---

## Troubleshooting

### PDF Returns 404
- Ensure server is running: `npm start` in server directory
- Check port 3000 is available: `netstat -an | grep 3000`
- Verify template exists: GET /api/templates

### DOCX Generation Fails
- Ensure `docx` npm package is installed
- Check server has sufficient disk space
- Verify data format matches schema

### Missing Sections in Output
- Check `projects` and `certifications` arrays are not undefined
- Ensure arrays contain objects with required fields
- Verify data was properly sent (check network tab in browser)

### Font Issues in PDF
- CSS must explicitly set font-family
- Current default: Libre Baskerville, Georgia, serif
- Puppeteer downloads fonts from Google Fonts
- Check network connection on server

---

## Updates and Changes

### Recent Changes (Projects & Certifications Support)
- ✅ Added support for `projects` array in resume data
- ✅ Added support for `certifications` array in resume data
- ✅ Updated dataTransformer to handle new sections
- ✅ Updated PDF template to render projects and certifications
- ✅ Updated DOCX generator with projects and certifications support
- ✅ Enhanced CSS for proper project and certification formatting
- ✅ Default sample data includes 2 projects and 3 certifications

---

## Support

For issues or questions:
1. Check the DATA_FLOW.md document for complete flow explanation
2. Run test-generation.js to verify all features work
3. Check browser console for client-side errors
4. Check server console for backend errors
5. Verify sample data in ResumeBuilder.tsx matches test script
