# Resume Builder - Quick Reference Card

## 🟢 Current Status: OPERATIONAL ✅

All systems running. Resume upload feature is **working and tested**.

---

## 🚀 Quick Commands

### Start Everything (in order)

**Terminal 1: Start Redis**
```bash
# If using Docker
docker run -d -p 6379:6379 redis:latest

# OR if you have redis installed locally
redis-server
```

**Terminal 2: Start Server**
```bash
cd server/
npm start
```

**Terminal 3: Start Client** (if not running)
```bash
cd client/
npm start
```

### Verify System is Ready

```bash
# Check Redis
redis-cli ping
# Expected: PONG

# Check Server Health
curl http://127.0.0.1:3000/health
# Expected: {"status":"OK",...}

# Check Parser
curl http://127.0.0.1:3000/api/parser/health
# Expected: {"status":"OK","service":"resume-parser",...}

# Check Queue
curl http://127.0.0.1:3000/api/parser/stats
# Expected: {"queue":{"waiting":0,"active":0,...}}
```

---

## 📤 How to Upload a Resume

### From React Client UI
1. Open http://localhost:5173
2. Click "Upload Resume" button
3. Select or drag-drop a file (PDF, DOCX, or image)
4. Wait for parsing (~5-30 seconds)
5. Resume data auto-populates in form

### From Command Line (cURL)
```bash
# Upload file
curl -X POST http://127.0.0.1:3000/api/parser/upload \
  -F "file=@resume.pdf"

# Response example:
# {"jobId":"abc-123","message":"Resume parsing started",...}

# Check status (replace abc-123 with actual jobId)
curl http://127.0.0.1:3000/api/parser/jobs/abc-123

# Get results when done
curl http://127.0.0.1:3000/api/parser/results/resume-uuid
```

---

## 📁 Important Directories

```
resume-builder-exp/
├── client/                      # React frontend
│   └── src/
│       ├── services/apiService.ts  # API calls
│       └── components/ResumeBuilder/
│
├── server/                      # Node.js backend
│   ├── server.js               # Main server file
│   ├── parser/                 # Resume parsing logic
│   │   ├── services/           # Parsing pipeline
│   │   ├── workers/            # BullMQ worker
│   │   ├── controllers/        # Request handlers
│   │   └── config/             # Configuration
│   ├── data/
│   │   └── resume_parser.json  # Database
│   └── uploads/                # Temp file uploads
│
└── Documentation/
    ├── BUG_REPORT_AND_FIX.md
    ├── REDIS_SETUP_GUIDE.md
    ├── NEXT_STEPS.md
    ├── VERIFICATION_STATUS.md
    └── QUICK_REFERENCE.md      # This file
```

---

## 🔧 Configuration

### Redis URL
Default: `redis://localhost:6379`

Change with:
```bash
export REDIS_URL=redis://my-redis-server:6379
npm start
```

### Worker Concurrency
Default: 2 jobs at a time

Change with:
```bash
export WORKER_CONCURRENCY=4
npm start
```

### Server Port
Default: 3000

Change with:
```bash
export PORT=5000
npm start
```

---

## 🧪 Test Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/health` | GET | Server status | ✅ |
| `/api/parser/health` | GET | Parser status | ✅ |
| `/api/parser/stats` | GET | Queue stats | ✅ |
| `/api/parser/upload` | POST | Upload file | ✅ |
| `/api/parser/jobs/:id` | GET | Job status | ✅ |
| `/api/parser/results/:id` | GET | Parse results | ✅ |

---

## 🐛 Common Issues & Fixes

### Redis not running
```bash
# Start Redis
docker run -d -p 6379:6379 redis:latest

# Verify
redis-cli ping
```

### Server won't start
```bash
# Check if port is in use
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Install dependencies
npm install

# Start again
npm start
```

### Upload returns 500 error
```bash
# Check Redis connection
redis-cli ping  # Should respond PONG

# Check server logs
npm start 2>&1 | grep -i error

# Ensure uploads directory exists
mkdir -p server/uploads
```

### Parsing is slow
```bash
# Check queue stats
curl http://127.0.0.1:3000/api/parser/stats

# Increase concurrency
WORKER_CONCURRENCY=4 npm start

# Check file size (should be <10MB)
ls -lh server/uploads/
```

---

## 📊 Supported File Formats

| Format | Support | Library |
|--------|---------|---------|
| PDF | ✅ | pdfjs-dist |
| DOCX | ✅ | mammoth |
| JPG/JPEG | ✅ | tesseract.js (OCR) |
| PNG | ✅ | tesseract.js (OCR) |
| GIF | ✅ | tesseract.js (OCR) |
| BMP | ✅ | tesseract.js (OCR) |

**Max size:** 10MB

---

## 📖 Documentation Map

Need help? Find the right doc:

- **Starting out?** → Read `NEXT_STEPS.md`
- **Technical details?** → Read `BUG_REPORT_AND_FIX.md`
- **Installing Redis?** → Read `REDIS_SETUP_GUIDE.md`
- **Checking system?** → Read `VERIFICATION_STATUS.md`
- **Quick answers?** → Read this file (QUICK_REFERENCE.md)

---

## 🔑 Key Facts

- ✅ **Fix Applied:** Redis dependency added to `server/package.json`
- ✅ **Status:** All endpoints working correctly
- ✅ **Database:** JSON file-based (no external DB needed)
- ✅ **Queue:** BullMQ + Redis for async processing
- ✅ **Workers:** 2 concurrent jobs by default
- ✅ **Parsing:** Multi-stage pipeline (extract → detect → normalize)

---

## 💾 Database Location

```
server/data/resume_parser.json
```

Contains all parsed resumes. **Do not delete!**

---

## 🚨 Emergency Troubleshooting

**Nothing works - start fresh:**

```bash
# 1. Kill all node processes
pkill -9 node

# 2. Clear Redis
redis-cli FLUSHALL

# 3. Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install

# 4. Start Redis
docker run -d -p 6379:6379 redis:latest

# 5. Start server
npm start
```

---

## 📞 Need Help?

1. ✅ Check if Redis is running: `redis-cli ping`
2. ✅ Check server logs: `npm start 2>&1 | grep -i error`
3. ✅ Read `VERIFICATION_STATUS.md` for system health
4. ✅ Read `NEXT_STEPS.md` for detailed setup
5. ✅ Check `BUG_REPORT_AND_FIX.md` for technical details

---

## ✨ What's Working

✅ Resume file upload (all formats)
✅ Async job processing with progress
✅ Text extraction from PDFs, docs, images
✅ Resume section detection
✅ Entity extraction (emails, phones, dates, companies)
✅ Data normalization
✅ Confidence scoring (0.0-1.0)
✅ Job status polling
✅ Real-time updates
✅ Automatic retry on failure

---

## 🎯 Next Step

**Upload a resume!**

1. Start Redis: `docker run -d -p 6379:6379 redis:latest`
2. Start server: `cd server && npm start`
3. Open client: http://localhost:5173
4. Click upload and select a resume
5. Wait for parsing to complete
6. Resume data appears in the form

**That's it!** Your resume builder is ready to use.

---

**Last Updated:** 2024-11-20
**Status:** ✅ Fully Operational
**All Tests:** ✅ Passed
