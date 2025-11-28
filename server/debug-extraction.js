const path = require('path');
const fs = require('fs-extra');

// Test text extraction directly
const extractTextService = require('./parser/services/extract-text.service');
const { cleanText, splitParagraphs } = require('./parser/utils/text-cleaner');

async function testExtraction() {
  try {
    const filePath = path.join(__dirname, 'Promise_Resume.pdf');

    console.log('📄 Testing PDF text extraction...\n');
    console.log(`📍 File: ${filePath}`);
    console.log(`✓ File exists: ${await fs.pathExists(filePath)}\n`);

    // Extract raw text
    console.log('🔍 Step 1: Extracting raw text from PDF...');
    const rawText = await extractTextService.extractText(filePath, 'pdf');

    console.log(`✓ Raw text extracted\n`);
    console.log('--- RAW TEXT (first 500 chars) ---');
    console.log(rawText.substring(0, 500));
    console.log(`\n--- RAW TEXT LENGTH: ${rawText.length} chars ---\n`);

    // Check for newlines
    const newlineCount = (rawText.match(/\n/g) || []).length;
    const doubleNewlineCount = (rawText.match(/\n\n/g) || []).length;
    console.log(`📊 Newlines found: ${newlineCount}`);
    console.log(`📊 Double newlines found: ${doubleNewlineCount}\n`);

    // Test paragraph splitting
    console.log('🔍 Step 2: Splitting into paragraphs...');
    const paragraphs = rawText.split(/\n\n+/).filter(p => p.trim());
    console.log(`✓ Paragraphs detected: ${paragraphs.length}\n`);

    // Show first few paragraphs
    console.log('--- PARAGRAPHS (first 5) ---');
    paragraphs.slice(0, 5).forEach((p, i) => {
      console.log(`\n[Paragraph ${i + 1}] (${p.length} chars)`);
      console.log(p.substring(0, 200) + (p.length > 200 ? '...' : ''));
    });

    // Test section detection
    console.log('\n\n🔍 Step 3: Testing section detection...');
    const { detectSectionType } = require('./parser/config/section-headers');

    paragraphs.forEach((p, i) => {
      const firstLine = p.split('\n')[0];
      const sectionType = detectSectionType(firstLine);
      console.log(`  Paragraph ${i + 1}: "${firstLine.substring(0, 50)}" → ${sectionType || 'NOT A HEADER'}`);
    });

    // Test cleanText effect
    console.log('\n\n🔍 Step 4: Testing cleanText function...');
    const testText = 'Promise Okafor\n\nExperience\nCompany ABC';
    const cleaned = cleanText(testText);
    console.log(`Input:  "${testText}"`);
    console.log(`Output: "${cleaned}"`);
    console.log(`Newlines preserved: ${cleaned.includes('\n')}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testExtraction();
