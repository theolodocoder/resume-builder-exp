#!/bin/bash

# Resume Builder Upload Test Script
# ===================================
# This script tests the complete resume upload and parsing workflow
#
# Prerequisites:
# - Server running on http://127.0.0.1:3000
# - Redis running on localhost:6379
# - A test resume file (PDF, DOCX, or image)
#
# Usage:
#   bash TEST_UPLOAD.sh path/to/resume.pdf

set -e

API_BASE_URL="http://127.0.0.1:3000"
TEST_FILE="${1:-/path/to/resume.pdf}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check prerequisites
print_header "CHECKING PREREQUISITES"

# Check if file exists (if provided)
if [ "$1" != "" ] && [ ! -f "$TEST_FILE" ]; then
    print_error "Test file not found: $TEST_FILE"
    echo ""
    echo "Usage: bash TEST_UPLOAD.sh path/to/resume.pdf"
    exit 1
fi

# Check if server is running
print_info "Checking if server is running..."
if curl -s "$API_BASE_URL/health" > /dev/null; then
    print_success "Server is running on $API_BASE_URL"
else
    print_error "Server is not responding on $API_BASE_URL"
    echo "Make sure to run: npm start (in server directory)"
    exit 1
fi

# Check if Redis is running
print_info "Checking if Redis is running..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping > /dev/null 2>&1; then
        print_success "Redis is running"
    else
        print_error "Redis is not responding"
        exit 1
    fi
else
    print_info "redis-cli not found, but proceeding with test"
fi

# Test 1: Health Checks
print_header "TEST 1: HEALTH CHECKS"

print_info "Testing main server health..."
HEALTH_RESPONSE=$(curl -s "$API_BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
    print_success "Server health check passed"
    echo "Response: $HEALTH_RESPONSE"
else
    print_error "Server health check failed"
    exit 1
fi

print_info "Testing parser health..."
PARSER_HEALTH=$(curl -s "$API_BASE_URL/api/parser/health")
if echo "$PARSER_HEALTH" | grep -q "OK"; then
    print_success "Parser health check passed"
    echo "Response: $PARSER_HEALTH"
else
    print_error "Parser health check failed"
    exit 1
fi

# Test 2: Queue Statistics
print_header "TEST 2: QUEUE STATISTICS"

print_info "Fetching queue statistics..."
STATS=$(curl -s "$API_BASE_URL/api/parser/stats")
echo "Queue Stats: $STATS"

# Extract counts
WAITING=$(echo "$STATS" | grep -o '"waiting":[0-9]*' | cut -d: -f2)
ACTIVE=$(echo "$STATS" | grep -o '"active":[0-9]*' | cut -d: -f2)
COMPLETED=$(echo "$STATS" | grep -o '"completed":[0-9]*' | cut -d: -f2)
FAILED=$(echo "$STATS" | grep -o '"failed":[0-9]*' | cut -d: -f2)

print_success "Queue Stats Retrieved:"
echo "  - Waiting: $WAITING"
echo "  - Active: $ACTIVE"
echo "  - Completed: $COMPLETED"
echo "  - Failed: $FAILED"

# Test 3: File Upload
if [ -f "$TEST_FILE" ]; then
    print_header "TEST 3: FILE UPLOAD"

    print_info "Uploading resume file: $TEST_FILE"

    UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/parser/upload" \
        -F "file=@$TEST_FILE" \
        -H "Accept: application/json")

    echo "Upload Response:"
    echo "$UPLOAD_RESPONSE" | jq . 2>/dev/null || echo "$UPLOAD_RESPONSE"

    # Extract jobId
    JOB_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$JOB_ID" ]; then
        print_error "Failed to extract jobId from response"
        exit 1
    fi

    print_success "File uploaded successfully"
    echo "Job ID: $JOB_ID"

    # Test 4: Poll Job Status
    print_header "TEST 4: JOB STATUS POLLING"

    print_info "Polling job status (max 30 seconds)..."

    POLL_COUNT=0
    MAX_POLLS=30
    JOB_COMPLETED=false

    while [ $POLL_COUNT -lt $MAX_POLLS ]; do
        POLL_COUNT=$((POLL_COUNT + 1))

        print_info "Poll #$POLL_COUNT: Fetching job status..."

        STATUS_RESPONSE=$(curl -s "$API_BASE_URL/api/parser/jobs/$JOB_ID")
        echo "Status Response: $STATUS_RESPONSE" | jq . 2>/dev/null || echo "$STATUS_RESPONSE"

        # Extract status
        JOB_STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        PROGRESS=$(echo "$STATUS_RESPONSE" | grep -o '"progress":[0-9]*' | cut -d: -f2)

        echo "  Status: $JOB_STATUS, Progress: $PROGRESS%"

        if [ "$JOB_STATUS" = "completed" ]; then
            print_success "Job completed!"
            JOB_COMPLETED=true

            # Extract resumeId
            RESUME_ID=$(echo "$STATUS_RESPONSE" | grep -o '"resumeId":"[^"]*"' | cut -d'"' -f4)
            echo "  Resume ID: $RESUME_ID"
            break
        elif [ "$JOB_STATUS" = "failed" ]; then
            print_error "Job failed!"
            ERROR=$(echo "$STATUS_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
            echo "  Error: $ERROR"
            exit 1
        fi

        sleep 1
    done

    if [ "$JOB_COMPLETED" = false ]; then
        print_error "Job did not complete within timeout (30 seconds)"
        print_info "Job status may still be processing. Check manually:"
        echo "  curl $API_BASE_URL/api/parser/jobs/$JOB_ID"
        exit 1
    fi

    # Test 5: Get Parsed Results
    if [ ! -z "$RESUME_ID" ]; then
        print_header "TEST 5: GET PARSED RESULTS"

        print_info "Fetching parsed resume data..."

        RESULTS=$(curl -s "$API_BASE_URL/api/parser/results/$RESUME_ID")
        echo "Results:"
        echo "$RESULTS" | jq . 2>/dev/null || echo "$RESULTS"

        # Extract confidence
        CONFIDENCE=$(echo "$RESULTS" | grep -o '"confidence":[0-9.]*' | cut -d: -f2)

        if [ ! -z "$CONFIDENCE" ]; then
            print_success "Parsed results retrieved!"
            echo "  Confidence Score: $CONFIDENCE"
        fi
    fi
else
    print_header "SKIPPING FILE UPLOAD TEST"
    print_info "No test file provided. Provide a resume file path to test upload:"
    echo "  bash TEST_UPLOAD.sh /path/to/resume.pdf"
fi

# Summary
print_header "TEST SUMMARY"
print_success "All basic tests completed!"
echo ""
echo "Next steps:"
echo "1. Check the parsed results above"
echo "2. If parsing worked, your resume upload feature is ready!"
echo "3. Try uploading resumes from your React client UI"
echo ""
echo "For issues:"
echo "- Check server logs: npm start 2>&1 | grep -i error"
echo "- Check Redis: redis-cli ping"
echo "- Review documentation: BUG_REPORT_AND_FIX.md"
