# AI Resume Builder - Frontend

Professional resume builder application built with modern web technologies.

## Getting Started

### Prerequisites

- Node.js 16+ ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn

### Installation

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

```sh
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run build:dev # Build for development
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Project Structure

```
src/
├── components/        # React components
│   ├── ResumeBuilder/ # Main feature components
│   └── ui/           # shadcn/ui components
├── services/         # API services and utilities
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── lib/              # Utility functions
├── App.tsx           # Root component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## Technology Stack

- **React** 18.3.1 - UI library
- **Vite** 5.4.19 - Build tool
- **TypeScript** 5.8.3 - Type safety
- **Tailwind CSS** 3.4.17 - Styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Query** - Data fetching & caching
- **React Router** - Client-side routing

## Key Features

- **Live Preview** - Real-time resume preview as you type
- **Multiple Templates** - Professional, modern, classic, and compact designs
- **Export Options** - Download as PDF or DOCX
- **Import/Export Data** - Save and load resume data as JSON
- **Responsive Design** - Works on desktop and tablet devices
- **Form Validation** - Comprehensive client-side validation

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`:

- `POST /api/generate/pdf` - Generate PDF resume
- `POST /api/generate/docx` - Generate DOCX resume
- `GET /api/templates` - Fetch available templates
- `GET /api/templates/:templateId` - Get specific template

## Environment Variables

Create a `.env` file if you need to customize the API endpoint:

```
VITE_API_URL=http://localhost:3000
```

## Development

### Component Architecture

The application uses a modular component structure with a clear separation of concerns:

- **ResumeBuilder** - Main orchestrator component
- **EditorForm** - Handles all resume data input
- **ResumePreview** - Live preview rendering
- **TemplateGallery** - Template selection interface
- **DownloadButtons** - Export functionality

### Code Quality

- TypeScript for type safety
- ESLint for code consistency
- Tailwind CSS for styling
- React Hook Form for efficient form handling

## Building for Production

```sh
npm run build
```

The production build will be available in the `dist/` directory.

## Deployment

The built application can be deployed to any static hosting service (Vercel, Netlify, AWS S3, etc.).

Example deployment command for production build:
```sh
npm run build
# Upload the 'dist' folder contents to your hosting service
```
