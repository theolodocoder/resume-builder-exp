# Template System - Quick Start

## 🚀 Get Started in 3 Steps

### Step 1: Start Your Servers

**Terminal 1 - Server:**
```bash
cd server
npm start
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### Step 2: Open Browser

```
http://localhost:8080
```

### Step 3: Test Templates

1. Fill in your resume data
2. Look for "Template Settings" or similar button
3. Click "Preview" on "Professional" template
4. You'll see a live preview of your resume
5. Click "Print Preview" to see how it looks in PDF
6. Select the template and download PDF

---

## 📋 What Changed

### New Files (Client)

```
client/src/components/ResumeBuilder/
├── TemplateManager.tsx      - Select templates
└── TemplatePreview.tsx      - Preview before download

client/src/services/
└── templateService.ts       - Template utilities
```

### New Files (Server)

```
server/templates/
├── resume-professional.html - Professional design
├── resume-professional.css  - Professional styling

server/services/
└── templateManager.js       - Manage templates

server/routes/
└── templates.js             - Template API
```

---

## 🎨 Professional Template Features

✅ **Libre Baskerville serif font** - Professional, elegant
✅ **Clean design** - Minimal but beautiful
✅ **Perfect spacing** - Optimized for A4 printing
✅ **Section underlines** - Visual hierarchy
✅ **Bullet separators** - Clean contact info
✅ **Print-ready** - Consistent across viewers

---

## 📱 Preview System

### How It Works

1. **Live Preview**
   - See your resume in real-time
   - Uses your actual data
   - Shows exact formatting

2. **Print Preview**
   - Opens browser print dialog
   - Shows PDF rendering
   - Check before downloading

3. **Download HTML**
   - Get standalone HTML file
   - Can edit in any editor
   - Share with others

---

## 💾 API Endpoints

### Get Templates

```bash
curl http://127.0.0.1:3000/api/templates
```

Response:
```json
{
  "templates": [
    {"id": "professional", "name": "Professional"},
    {"id": "classic", "name": "Classic"}
  ]
}
```

### Generate PDF

```bash
curl -X POST http://127.0.0.1:3000/api/generate/pdf?template=professional \
  -H "Content-Type: application/json" \
  -d '{"contact": {...}, "experience": [...], ...}'
```

---

## 🎯 Use Cases

### Case 1: Quick Download
```
1. Fill resume
2. Click "Download PDF"
3. Uses "professional" template by default
```

### Case 2: Compare Templates
```
1. Fill resume
2. Click "Select Template"
3. Preview "Professional"
4. Preview "Classic"
5. Select your favorite
6. Download PDF
```

### Case 3: Custom Styling
```
1. Download HTML from preview
2. Edit CSS in text editor
3. Open in browser to test
4. Share custom version
```

---

## 🔧 Configuration

### Change Default Template

**In client** (ResumeBuilder.tsx):
```typescript
const [selectedTemplate, setSelectedTemplate] = useState("professional");
```

**In server** (templateManager.js):
```javascript
const TEMPLATES = {
  professional: { default: true }, // Set as default
  classic: { default: false }
};
```

### Change API URL

**In client** (.env file):
```env
VITE_API_URL=http://your-server:3000
```

---

## ✅ Template Checklist

### Before Downloading PDF

- [ ] Fill in your full name
- [ ] Add email address
- [ ] Add at least one experience entry
- [ ] Check preview looks good
- [ ] Contact info displays correctly
- [ ] Spacing seems reasonable
- [ ] Dates are formatted

### After Downloading

- [ ] Open PDF in your default viewer
- [ ] Check fonts look correct
- [ ] Verify spacing is professional
- [ ] Print to paper to test
- [ ] Check for any overlapping text
- [ ] Verify links are colored (if any)

---

## 🐛 Troubleshooting

### Preview won't load

```
Check:
1. Server is running (npm start in server/)
2. Client can reach server (http://127.0.0.1:3000)
3. Resume data is filled in
4. No console errors (F12)
```

### PDF looks wrong

```
Check:
1. Use latest Chrome/Firefox
2. Resume data is complete
3. Try "Print Preview" first
4. Clear browser cache (Ctrl+Shift+Delete)
```

### Template not showing

```
Check:
1. templateManager.js has the template
2. HTML and CSS files exist
3. File names match exactly
4. No typos in template ID
```

---

## 💡 Tips & Tricks

### Tip 1: Test Before Download
Always use "Print Preview" before downloading to catch issues early.

### Tip 2: Try Both Templates
Compare Professional vs Classic to see which works best for your style.

### Tip 3: Download HTML First
Download the HTML version to test editing before downloading PDF.

### Tip 4: Test Print
Always print one copy to verify it looks good on paper.

### Tip 5: Multiple Versions
Create multiple resume versions for different jobs using templates.

---

## 🎓 Learning Path

### Beginner
1. Use Professional template
2. Download PDF
3. Print to test

### Intermediate
1. Preview different templates
2. Use Print Preview
3. Download HTML to explore

### Advanced
1. Create custom template
2. Edit CSS styling
3. Test thoroughly before using

---

## 📞 Quick Reference

| Action | Steps |
|--------|-------|
| Download PDF | Fill resume → Click Download → Select template |
| Preview | Fill resume → Click Template Settings → Preview |
| Change Template | Click Template Settings → Select → Choose template |
| Test Print | Preview → Print Preview → Check in dialog |
| Get HTML | Preview → Download HTML button |

---

## 🎉 You're Ready!

Everything is set up. Just:

1. ✅ Start servers
2. ✅ Open browser
3. ✅ Fill resume
4. ✅ Preview template
5. ✅ Download PDF

**That's it! Enjoy creating professional resumes! 🚀**

---

## 📚 Need More Help?

- **Full Guide:** See `TEMPLATE_SYSTEM_GUIDE.md`
- **Integration:** See `INTEGRATION_SUMMARY.md`
- **Quick Start:** See `QUICK_START.md`

---

*Last updated: 2024*
