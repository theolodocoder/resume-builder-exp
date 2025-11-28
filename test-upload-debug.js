const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const API_URL = 'http://127.0.0.1:3000/api/parser';

async function testUploadAndParse() {
  try {
    console.log('🧪 Testing Resume Upload and Parsing...\n');

    // Get first PDF from uploads directory
    const uploadsDir = path.join(__dirname, 'server/uploads');
    const files = await fs.readdir(uploadsDir);
    const pdfFile = files.find(f => f.endsWith('.pdf'));

    if (!pdfFile) {
      console.error('❌ No PDF files found in uploads directory');
      console.log('Please upload a resume first via the web interface');
      return;
    }

    const testFilePath = path.join(uploadsDir, pdfFile);
    console.log(`📄 Test file: ${pdfFile}`);
    console.log(`📍 File path: ${testFilePath}`);

    const fileExists = await fs.pathExists(testFilePath);
    console.log(`✓ File exists: ${fileExists}\n`);

    // Step 1: Upload the file
    console.log('📤 Step 1: Uploading resume...');
    const formData = new FormData();
    const fileStream = await fs.readFile(testFilePath);
    const blob = new Blob([fileStream], { type: 'application/pdf' });
    formData.append('file', blob, pdfFile);
    formData.append('userId', 'test-user');

    const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const jobId = uploadResponse.data.jobId;
    console.log(`✓ Upload successful`);
    console.log(`  Job ID: ${jobId}`);
    console.log(`  Status URL: ${uploadResponse.data.statusUrl}\n`);

    // Step 2: Poll job status
    console.log('⏳ Step 2: Polling job status...');
    let jobStatus;
    let pollAttempts = 0;
    const maxAttempts = 60;

    while (pollAttempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await axios.get(`${API_URL}/jobs/${jobId}`);
      jobStatus = statusResponse.data;

      console.log(`  Attempt ${pollAttempts + 1}: Status = ${jobStatus.status}, Progress = ${jobStatus.progress}%`);

      if (jobStatus.status === 'completed') {
        console.log(`✓ Job completed!\n`);
        break;
      } else if (jobStatus.status === 'failed') {
        console.error(`✗ Job failed: ${jobStatus.error}\n`);
        return;
      }

      pollAttempts++;
    }

    if (pollAttempts >= maxAttempts) {
      console.error('✗ Job timeout\n');
      return;
    }

    // Step 3: Get parsed result
    if (jobStatus.result && jobStatus.result.resumeId) {
      console.log('📋 Step 3: Retrieving parsed result...');
      const resultResponse = await axios.get(`${API_URL}/results/${jobStatus.result.resumeId}`);
      const parsed = resultResponse.data;

      console.log(`✓ Parse result retrieved:`);
      console.log(`  Resume ID: ${parsed.resumeId}`);
      console.log(`  Confidence: ${(parsed.confidence * 100).toFixed(1)}%`);
      console.log(`  Parsed keys:`, Object.keys(parsed.parsed || {}));
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testUploadAndParse();
