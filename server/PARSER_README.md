# Resume Parser System

Complete resume parsing system for extracting and structuring data from uploaded resume files (PDF, DOCX, images).

## Overview

The resume parser is a production-ready microservice that:
- **Accepts resume uploads** in multiple formats (PDF, DOCX, JPG, PNG, GIF, BMP)
- **Extracts raw text** with automatic OCR fallback for scanned documents
- **Detects sections** (Experience, Education, Skills, etc.) using heuristics
- **Extracts entities** (emails, phone numbers, URLs, companies) using regex patterns
- **Normalizes data** with consistent formatting
- **Stores results** in SQLite database
- **Provides APIs** for job tracking and result retrieval

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Client Application (React Frontend)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────────────┐
    │ Express API Server (Node.js)                     │
    │  - POST /api/parser/upload                       │
    │  - GET /api/parser/jobs/:jobId                   │
    │  - GET /api/parser/results/:resumeId             │
    └──────────────────────┬──────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │ BullMQ Job Queue (Redis)            │
        │ - File upload details              │
        │ - Job metadata                     │
        └─────────────────────────────────────┘
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │ Worker Process (Node.js)            │
        │ - Extracts text from document      │
        │ - Detects sections                │
        │ - Extracts entities (regex)       │
        │ - Normalizes data                 │
        │ - Saves to database              │
        └──────┬──────────────────────┬─────┘
               │                      │
               ▼                      ▼
    ┌─────────────────────┐  ┌───────────────────────┐
    │ SQLite Database     │  │ OCR Service           │
    │ - Parsed resumes    │  │ (Tesseract.js)        │
    │ - Job metadata      │  │ - Image text extract  │
    └─────────────────────┘  └───────────────────────┘
```

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Redis (for BullMQ queue)

### Installation

1. **Install Node.js dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Redis:**
   ```bash
   redis-server
   ```

### Running the System

**Terminal 1 - Start the Express API server:**
```bash
cd server
npm start
```
Server runs on http://localhost:3000

**Terminal 2 - Start the job worker:**
```bash
cd server
node parser-worker.js
```

## API Endpoints

### Upload Resume

**POST /api/parser/upload**

Upload a resume file and start parsing job.

**Form Data:**
```
- file (required) - Resume file (PDF, DOCX, JPG, PNG, etc.)
- userId (optional) - User ID for tracking
```

**Request:**
```bash
curl -X POST http://localhost:3000/api/parser/upload \
  -F "file=@resume.pdf" \
  -F "userId=user123"
```

**Response (202 Accepted):**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Resume parsing started",
  "status": "pending",
  "statusUrl": "/api/parser/jobs/550e8400-e29b-41d4-a716-446655440000"
}
```

### Get Job Status

**GET /api/parser/jobs/:jobId**

Check the status of a parsing job.

**Request:**
```bash
curl http://localhost:3000/api/parser/jobs/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": 100,
  "attempts": 1,
  "result": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "resumeId": "abc-123",
    "parsed": { ... },
    "confidence": 0.85,
    "metadata": { ... }
  }
}
```

Job states:
- `wait` - Waiting in queue
- `active` - Currently processing
- `completed` - Successfully parsed
- `failed` - Parsing failed

### Get Parsed Result

**GET /api/parser/results/:resumeId**

Retrieve the parsed resume data.

**Request:**
```bash
curl http://localhost:3000/api/parser/results/abc-123
```

**Response (200 OK):**
```json
{
  "resumeId": "abc-123",
  "parsed": {
    "contact": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-123-4567",
      "location": "San Francisco, CA",
      "links": ["https://linkedin.com/in/johndoe"]
    },
    "summary": "Experienced full-stack developer...",
    "skills": ["Python", "JavaScript", "React", "Node.js"],
    "experiences": [
      {
        "company": "Tech Corp",
        "role": "Senior Engineer",
        "startDate": "2020-01",
        "endDate": "2023-12",
        "description": ["Led team of 5 engineers", "Built REST APIs"]
      }
    ],
    "education": [
      {
        "school": "University of California",
        "degree": "Bachelor of Science",
        "field": "Computer Science",
        "startDate": "2016-09",
        "endDate": "2020-05"
      }
    ],
    "certifications": [],
    "projects": [],
    "languages": ["English", "Spanish"],
    "awards": []
  },
  "confidence": 0.85,
  "metadata": {
    "fileType": "pdf",
    "fileName": "John_Doe_Resume.pdf",
    "rawTextLength": 4521,
    "paragraphCount": 45,
    "detectedSections": ["contact", "summary", "experiences", "education", "skills"],
    "entityCount": 12,
    "processingTime": 3245
  },
  "createdAt": "2024-11-19T10:30:45.123Z"
}
```

### Get User's Resumes

**GET /api/parser/user/:userId/resumes**

Retrieve all parsed resumes for a user.

**Query Parameters:**
- `limit` (optional, default: 10) - Number of results to return (max: 100)

**Request:**
```bash
curl "http://localhost:3000/api/parser/user/user123/resumes?limit=20"
```

**Response (200 OK):**
```json
{
  "userId": "user123",
  "resumes": [
    {
      "id": "abc-123",
      "file_name": "John_Doe_Resume.pdf",
      "confidence": 0.85,
      "created_at": "2024-11-19T10:30:45.123Z"
    }
  ],
  "count": 1
}
```

### Get Queue Statistics

**GET /api/parser/stats**

View job queue statistics.

**Request:**
```bash
curl http://localhost:3000/api/parser/stats
```

**Response (200 OK):**
```json
{
  "queue": {
    "waiting": 5,
    "active": 2,
    "completed": 145,
    "failed": 3
  }
}
```

### Health Check

**GET /api/parser/health**

Check if parser service is healthy.

**Request:**
```bash
curl http://localhost:3000/api/parser/health
```

**Response (200 OK):**
```json
{
  "status": "OK",
  "service": "resume-parser",
  "timestamp": "2024-11-19T10:30:45.123Z"
}
```

## Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```bash
# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=INFO

# Redis & Queue
REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=2

# Files
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,doc,jpg,jpeg,png,gif,bmp

# Database
DATABASE_PATH=./data/resume_parser.db
```

## Parsing Pipeline

### 1. Text Extraction
- **PDF**: Uses pdfjs-dist to extract text
  - If no text found, falls back to Tesseract OCR
- **DOCX**: Uses mammoth library to extract text
- **Images**: Uses Tesseract OCR

### 2. Section Detection
Identifies resume sections using regex patterns:
- Contact/Personal Information
- Summary/Profile
- Work Experience
- Education
- Skills
- Certifications
- Projects
- Languages
- Awards/Honors

### 3. Named Entity Extraction
Regex-based extraction for:
- Email addresses
- Phone numbers
- URLs (http, https, LinkedIn)
- Company names
- Years and dates

### 4. Data Structure Building
Combines section detection + NER to build:
- Contact information
- Work experiences with descriptions
- Education entries
- Skill lists
- Certifications
- Projects
- Languages

### 5. Normalization
Standardizes extracted data:
- Date formats: `YYYY-MM`
- Phone numbers: International format
- Emails: Lowercased, validated
- Skills: Capitalized, deduplicated
- URLs: Valid format with https://

### 6. Persistence
Stores parsed data in SQLite with metadata:
- Resume ID
- File information
- Parsed JSON
- Confidence score
- Processing metadata

## Confidence Scoring

The parser calculates a confidence score (0-1) based on:
- **Contact info completeness** (20%)
- **Experience entries** (20%)
- **Education entries** (15%)
- **Skills extraction** (15%)
- **Other sections** (10%)
- **Base score** (20%)

## Production Deployment

### Docker

Create a `Dockerfile` in the server directory:

```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t resume-parser .
docker run -p 3000:3000 -e REDIS_URL=redis://redis:6379 resume-parser
```

### Environment Setup for Production

```bash
NODE_ENV=production
LOG_LEVEL=WARN
WORKER_CONCURRENCY=4
REDIS_URL=redis://redis:6379
```

### Horizontal Scaling

1. **API Server**: Scale Node.js processes horizontally behind a load balancer
2. **Workers**: Run multiple `parser-worker.js` processes
3. **Redis**: Use Redis cluster for queue/cache
4. **Database**: Migrate to PostgreSQL for better concurrency

## Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution**: Ensure Redis is running
```bash
redis-server
```

### File Size Limit
```
Error: File too large
```
**Solution**: Increase `MAX_FILE_SIZE` in `.env` (default: 10MB)

### OCR Not Working
```
Error: Worker pool exhausted
```
**Solution**: Ensure Tesseract.js can find the worker file or use smaller images

### Database Lock
```
Error: database is locked
```
**Solution**: Only one process should write to the database. Use Redis for queue instead of in-process.

## API Client Example (JavaScript/React)

```javascript
// Upload resume
const formData = new FormData();
formData.append('file', resumeFile);
formData.append('userId', 'user123');

const uploadResponse = await fetch('/api/parser/upload', {
  method: 'POST',
  body: formData
});

const { jobId } = await uploadResponse.json();

// Poll for job status
let jobStatus = null;
while (jobStatus?.status !== 'completed') {
  const response = await fetch(`/api/parser/jobs/${jobId}`);
  jobStatus = await response.json();

  if (jobStatus.status === 'failed') {
    console.error('Parsing failed:', jobStatus.error);
    break;
  }

  // Wait before polling again
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// Get parsed result
const resultResponse = await fetch(`/api/parser/results/${jobStatus.result.resumeId}`);
const result = await resultResponse.json();

console.log('Parsed resume:', result.parsed);
console.log('Confidence:', result.confidence);
```

## Performance

### Typical Processing Times
- **Text-based PDF**: 200-500ms
- **Scanned PDF (OCR)**: 2-5s
- **DOCX**: 100-300ms
- **Image**: 1-3s

### Optimization Tips
1. Use smaller images for OCR (reduce resolution)
2. Run multiple workers for high volume
3. Use Redis cluster for better queue performance
4. Enable caching for frequently accessed resumes

## Support and Contributing

For issues or questions:
1. Check the troubleshooting section above
2. Review the architecture and API documentation
3. Check environment variables configuration
4. Enable DEBUG logging: `LOG_LEVEL=DEBUG`

## License

ISC
