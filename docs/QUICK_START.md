# Quick Start Guide

## 🚀 Run Your Resume Builder

### Step 1: Start the Server (Terminal 1)
```bash
cd server
npm start
```

### Step 2: Start the Client (Terminal 2)
```bash
cd client
npm run dev
```

### Step 3: Open in Browser
```
http://localhost:8080
```

### Step 4: Create Your Resume
1. Fill in contact information
2. Add your work experience
3. Add education
4. Add skills
5. Click "Download PDF" or "Download DOCX"

## ✨ What Was Fixed

### Before
- ❌ Resume downloads empty
- ❌ No data showing in PDF
- ❌ Large, spread-out styling

### After
- ✅ Resume downloads with all your data
- ✅ Professional, compact layout
- ✅ Section underlines
- ✅ Optimized spacing and typography
- ✅ 93KB PDFs with complete content

## 📋 Data Format

Your resume data structure (automatically handled):
```json
{
  "contact": {
    "fullName": "Your Name",
    "email": "email@example.com",
    "phone": "+1-234-567-8900",
    "location": "City, State",
    "linkedin": "https://linkedin.com/in/...",
    "website": "https://yourwebsite.com"
  },
  "summary": "Your professional summary...",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "location": "City, State",
      "startDate": "2024-01",
      "endDate": "Present",
      "description": "What you did..."
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "graduationDate": "May 2024"
    }
  ],
  "skills": ["Skill1", "Skill2", "Skill3"]
}
```

## 🎯 Key Files

- `client/src/services/apiService.ts` - API calls to server
- `server/services/dataTransformer.js` - Converts data format
- `server/services/pdfGenerator.js` - Creates PDFs
- `server/services/docxGenerator.js` - Creates Word docs
- `server/templates/resume-template.html` - HTML template
- `server/templates/resume-style.css` - Professional styling

## 🔧 Troubleshooting

### "Cannot fetch from server"
- Check server is running (`npm start`)
- Ensure you see `Server is running on http://localhost:3000`

### "Resume is empty"
- Verify you filled in at least your name
- Check browser console for errors
- Reload the page

### "Styling looks wrong"
- Clear your browser cache (Ctrl+Shift+Delete)
- Restart the server
- Regenerate the PDF

## 💻 Supported Formats

- ✅ **PDF** - Professional, print-ready
- ✅ **DOCX** - Word document, editable

## 📧 Contact Info Features

Your contact info automatically formats as:
```
YOUR NAME
email@example.com • +1-234-567-8900 • City, State • linkedin.com/in/yourname
```

## 🎨 Resume Styling

- **Font:** Professional serif (Lora)
- **Layout:** Compact, single-page optimized
- **Spacing:** Smart margins and padding
- **Sections:** Underlined headers
- **Print:** ATS-compatible format

## 📥 Download Options

Both formats automatically use your name:
- `YourName_Resume.pdf`
- `YourName_Resume.docx`

## 🚦 Check Status

**Server Running:**
```bash
# In another terminal, test:
curl http://127.0.0.1:3000/health
# Should return: {"status":"OK"}
```

## 🎓 Example Resume

Use this as a template:

```json
{
  "contact": {
    "fullName": "Promise Okafor",
    "email": "goforprodev@gmail.com",
    "phone": "+234-808-156-0989",
    "location": "Calgary, Alberta, CA",
    "linkedin": "https://linkedin.com/in/promise",
    "website": "https://github.com/theolodocoder"
  },
  "summary": "Full-Stack Developer with 5+ years experience building scalable web applications.",
  "experience": [
    {
      "company": "Solace Imaging",
      "position": "Frontend Developer",
      "location": "Calgary, Alberta, CA",
      "startDate": "2024-01",
      "endDate": "Present",
      "description": "Led frontend development for imaging platform using React and TypeScript."
    }
  ],
  "education": [
    {
      "school": "University of Ibadan",
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "graduationDate": "March 2024"
    }
  ],
  "skills": ["React", "TypeScript", "Node.js", "Docker", "PostgreSQL"]
}
```

## ✅ Success Checklist

- [ ] Server running on port 3000
- [ ] Client running on port 8080
- [ ] Can access `http://localhost:8080`
- [ ] Can fill in resume data
- [ ] Can download PDF
- [ ] Can download DOCX
- [ ] Resume shows your name and info
- [ ] Styling looks professional

---

**You're all set! Start building amazing resumes! 🎉**
