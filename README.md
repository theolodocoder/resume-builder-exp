# AI Resume Builder

Professional resume builder application that generates stunning resumes in PDF and DOCX formats with real-time preview and multiple template options.

> ✨ Build beautiful, professional resumes in minutes with our modern resume builder featuring live preview, multiple templates, and instant export options.

## Features

- 🎨 **Multiple Templates** - Choose from 5 professional resume designs
  - Professional (clean and modern)
  - Lora (elegant serif design)
  - Garamond (classic and professional)
  - Calibri (clean and simple)
  - Compact (space-efficient layout)

- 📝 **Real-time Preview** - See your resume as you type
- 📥 **Multiple Export Formats** - Download as PDF or DOCX
- 💾 **Data Import/Export** - Save and load resume data as JSON
- 📱 **Responsive Design** - Works on desktop and tablet devices
- ✅ **Form Validation** - Comprehensive client-side validation
- 🚀 **Fast and Reliable** - Optimized for performance

## Quick Start

### Prerequisites

- Node.js 16+ ([install](https://nodejs.org/))
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-builder-exp
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

**Terminal 1 - Start the backend server:**
```bash
cd server
npm start
```
Server runs on `http://localhost:3000`

**Terminal 2 - Start the frontend development server:**
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:8080`

Open your browser and navigate to `http://localhost:8080` to start using the resume builder.

## Project Structure

```
resume-builder-exp/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── ResumeBuilder/       # Main resume builder components
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── services/                # API service layer
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utility functions
│   │   └── App.tsx                  # Root component
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── README.md                    # Frontend documentation
│
├── server/                          # Express.js backend application
│   ├── routes/                      # API route handlers
│   │   ├── generate.js              # PDF/DOCX generation routes
│   │   └── templates.js             # Template management routes
│   ├── services/                    # Business logic services
│   │   ├── pdfGenerator.js          # Puppeteer PDF generation
│   │   ├── docxGenerator.js         # DOCX document generation
│   │   ├── dataTransformer.js       # Data transformation logic
│   │   └── templateManager.js       # Template loading and management
│   ├── templates/                   # Resume template files
│   │   ├── resume-professional.html
│   │   ├── resume-professional.css
│   │   └── [other templates]
│   ├── server.js                    # Express app setup
│   ├── package.json
│   └── README.md                    # Backend documentation
│
├── docs/                            # Documentation
│   ├── INDEX.md                     # Documentation index
│   ├── QUICK_START.md               # Quick setup guide
│   ├── API_REFERENCE.md             # API documentation
│   ├── COMPLETE_SYSTEM_OVERVIEW.md  # System architecture
│   ├── DATA_FLOW.md                 # Data flow diagrams
│   ├── TEMPLATES_GUIDE.md           # Template usage guide
│   └── [other documentation]
│
├── test.json                        # Sample resume data
└── README.md                        # This file
```

## Technology Stack

### Frontend
- **React** 18.3.1 - UI library
- **TypeScript** 5.8.3 - Type safety
- **Vite** 5.4.19 - Build tool
- **Tailwind CSS** 3.4.17 - Styling
- **shadcn/ui** - Component library
- **React Hook Form** 7.61.1 - Form management
- **Zod** 3.25.76 - Schema validation
- **React Query** 5.83.0 - Data fetching
- **React Router** 6.30.1 - Routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** 5.1.0 - Web framework
- **Puppeteer** 24.29.1 - PDF generation
- **docx** 9.5.1 - DOCX generation
- **Handlebars** 4.7.8 - Template engine
- **CORS** 2.8.5 - Cross-origin requests

## API Endpoints

### Resume Generation
- `POST /api/generate/pdf` - Generate PDF resume
- `POST /api/generate/docx` - Generate DOCX resume

### Templates
- `GET /api/templates` - List available templates
- `GET /api/templates/:templateId` - Get specific template

For detailed API documentation, see [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)

## Development

### Frontend Development

```bash
cd client
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Backend Development

```bash
cd server
npm run dev       # Start with nodemon (auto-reload)
npm start         # Start production server
```

### Code Quality

The frontend uses:
- TypeScript for type safety
- ESLint for code consistency
- Tailwind CSS for styling
- React Hook Form for efficient form handling

The backend includes:
- Comprehensive error handling
- Browser pooling and resource management
- Automatic retry logic for failed requests
- Well-documented service functions

## Resume Data Structure

The application supports comprehensive resume data with the following sections:

```javascript
{
  contact: {
    fullName: string,
    email: string,
    phone: string,
    location: string,
    linkedin: string,
    website: string
  },
  summary: string,
  experience: [
    {
      company: string,
      position: string,
      startDate: string,
      endDate: string,
      description: string
    }
  ],
  education: [
    {
      school: string,
      degree: string,
      field: string,
      graduationDate: string
    }
  ],
  projects: [
    {
      title: string,
      description: string,
      link: string
    }
  ],
  certifications: [
    {
      title: string,
      issuer: string,
      issueDate: string
    }
  ],
  skills: [string],
  awards: [
    {
      title: string,
      issuer: string
    }
  ],
  languages: [string],
  interests: [string]
}
```

## Deployment

### Build for Production

**Frontend:**
```bash
cd client
npm run build
# Output: dist/ folder with static files
```

**Backend:**
No build step required. Use Node.js to run directly.

### Deployment Platforms

- **Frontend**: Deploy `client/dist` to Vercel, Netlify, AWS S3, GitHub Pages, etc.
- **Backend**: Deploy to Heroku, AWS EC2, DigitalOcean, Railway, etc.

### Environment Variables

**Backend (.env):**
```
PORT=3000
NODE_ENV=production
```

**Frontend:**
- API endpoint is configured for `http://localhost:3000` in development
- Update `client/src/services/apiService.ts` for production URLs

## Documentation

Complete documentation is available in the [docs/](./docs/) folder:

- [Documentation Index](./docs/INDEX.md) - Overview of all documentation
- [Quick Start Guide](./docs/QUICK_START.md) - Setup and first steps
- [API Reference](./docs/API_REFERENCE.md) - API endpoint details
- [Complete System Overview](./docs/COMPLETE_SYSTEM_OVERVIEW.md) - Full architecture
- [Data Flow](./docs/DATA_FLOW.md) - Data transformation flow
- [Templates Guide](./docs/TEMPLATES_GUIDE.md) - Template usage
- [Template System Guide](./docs/TEMPLATE_SYSTEM_GUIDE.md) - Template architecture

## Features in Detail

### Live Preview
- Real-time resume preview as you type
- Instant template switching
- WYSIWYG (What You See Is What You Get)

### Multiple Templates
- 5 professionally designed templates
- Different font families and layouts
- All ATS (Applicant Tracking System) friendly

### Export Options
- **PDF** - Professional PDF output with proper formatting
- **DOCX** - Microsoft Word compatible format for easy editing

### Data Management
- **Import** - Load resume data from JSON
- **Export** - Save resume data as JSON for later editing
- **Local Storage** - Auto-save to browser (if implemented)

## Performance

- Optimized Puppeteer browser pooling
- Efficient React component rendering
- Lazy loading of UI components
- Responsive design for all devices
- Fast page load times with Vite

## Security

- CORS configured for safe cross-origin requests
- Input validation on all form fields
- JSON payload size limits (10MB)
- No sensitive data stored on server
- All PDF/DOCX generation done server-side

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome! Please ensure:

1. Code follows existing style conventions
2. TypeScript types are properly defined
3. Components are reusable and well-documented
4. All changes are tested

## License

ISC License - See LICENSE file for details

## Support

For issues, feature requests, or questions:
1. Check the [Documentation](./docs/)
2. Review [Quick Start Guide](./docs/QUICK_START.md)
3. Check [API Reference](./docs/API_REFERENCE.md)

## Changelog

See [What's New](./docs/WHATS_NEW.md) for recent updates and features.

---

**Made with ❤️ for professionals everywhere**

Last Updated: November 8, 2025
