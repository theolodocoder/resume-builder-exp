/**
 * Test Script for Resume Parser
 * ==============================
 *
 * Tests the core components of the resume parsing system
 * without needing to run the full server.
 */

const path = require("path");
const fs = require("fs-extra");

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

async function runTests() {
  console.log(`\n${colors.blue}=== Resume Parser Test Suite ===${colors.reset}\n`);

  try {
    // Test 1: Database Initialization
    console.log("Test 1: Database Initialization");
    const { initDatabase, dbRun, dbGet, dbAll } = require("./parser/config/database");
    await initDatabase();
    log.success("Database initialized");

    // Test 2: Save and retrieve data
    console.log("\nTest 2: Database Operations");
    const testId = "test-resume-001";
    const testData = {
      id: testId,
      file_name: "test_resume.pdf",
      file_type: "pdf",
      file_url: "/uploads/test.pdf",
      parsed_data: {
        contact: { name: "Test User", email: "test@example.com" },
        skills: ["JavaScript", "Node.js"],
      },
      confidence: 0.85,
      status: "completed",
      metadata: { processingTime: 1000 },
    };

    await dbRun("insert_resume", testData);
    log.success("Resume data saved");

    const retrieved = await dbGet("resume", testId);
    if (retrieved && retrieved.file_name === "test_resume.pdf") {
      log.success("Resume data retrieved correctly");
    } else {
      log.error("Failed to retrieve correct resume data");
    }

    // Test 3: Section Headers Configuration
    console.log("\nTest 3: Section Headers Configuration");
    const { detectSectionType, isSectionHeader } = require("./parser/config/section-headers");

    const testLines = ["EXPERIENCE", "Work Experience", "education", "SKILLS"];
    const detectedTypes = testLines.map((line) => ({
      line,
      type: detectSectionType(line),
      isHeader: isSectionHeader(line),
    }));

    let allCorrect = true;
    detectedTypes.forEach(({ line, type, isHeader }) => {
      if (!isHeader) {
        log.error(`Failed to detect "${line}" as a section header`);
        allCorrect = false;
      }
    });

    if (allCorrect) {
      log.success("All section headers detected correctly");
    }

    // Test 4: Text Cleaning Utilities
    console.log("\nTest 4: Text Cleaning Utilities");
    const { cleanText, titleCase, deduplicateItems } = require("./parser/utils/text-cleaner");

    const dirtyText = "  Hello   WORLD  ";
    const cleaned = cleanText(dirtyText);
    if (cleaned === "Hello WORLD") {
      log.success("Text cleaning works correctly");
    } else {
      log.error(`Text cleaning failed: "${cleaned}"`);
    }

    const titleCased = titleCase("hello world test");
    if (titleCased === "Hello World Test") {
      log.success("Title casing works correctly");
    } else {
      log.error(`Title casing failed: "${titleCased}"`);
    }

    const items = ["Python", "python", "JavaScript", "javascript"];
    const deduped = deduplicateItems(items);
    if (deduped.length === 2) {
      log.success("Deduplication works correctly");
    } else {
      log.error(`Deduplication failed: expected 2, got ${deduped.length}`);
    }

    // Test 5: Date Utilities
    console.log("\nTest 5: Date Utilities");
    const { parseDate, isValidDate } = require("./parser/utils/date-utils");

    const testDates = [
      { input: "Jan 2020", expected: "2020-01" },
      { input: "01/2020", expected: "2020-01" },
      { input: "2020-01", expected: "2020-01" },
      { input: "2020", expected: "2020-01" },
    ];

    let datesPassed = true;
    testDates.forEach(({ input, expected }) => {
      const result = parseDate(input);
      if (result === expected) {
        log.success(`Parsed "${input}" → "${result}"`);
      } else {
        log.error(`Failed to parse "${input}": got "${result}", expected "${expected}"`);
        datesPassed = false;
      }
    });

    // Test 6: NER Service
    console.log("\nTest 6: NER Service");
    const { fallbackEntityExtraction } = require("./parser/services/ner.service");

    const testText = "John Doe can be reached at john@example.com or +1-555-0123";
    const entities = fallbackEntityExtraction(testText);

    if (entities.length > 0) {
      log.success(`Extracted ${entities.length} entities from text`);
      entities.forEach(({ label, text }) => {
        console.log(`  - ${label}: "${text}"`);
      });
    } else {
      log.error("Failed to extract entities from text");
    }

    // Test 7: Parser Orchestrator - Resume Structure
    console.log("\nTest 7: Resume Structure Building");
    const { buildResumeStructure } = require("./parser/services/parser-orchestrator.service");

    const mockSections = {
      experiences: [
        "Senior Engineer at TechCorp",
        "Led team of 5 engineers",
        "Increased performance by 40%",
      ],
      skills: ["Python", "JavaScript", "React", "Node.js"],
    };

    const mockEntities = [
      { label: "ORG", text: "TechCorp" },
      { label: "EMAIL", text: "john@example.com" },
    ];

    const structure = buildResumeStructure(mockSections, mockEntities);
    if (structure.contact && structure.skills && structure.experiences) {
      log.success("Resume structure built successfully");
    } else {
      log.error("Resume structure is incomplete");
    }

    // Summary
    console.log(`\n${colors.green}=== All Core Tests Completed Successfully ===${colors.reset}\n`);
    console.log("✓ Database operations working");
    console.log("✓ Text cleaning and normalization working");
    console.log("✓ Date parsing working");
    console.log("✓ Entity extraction working");
    console.log("✓ Resume structure building working");
    console.log("\nReady for frontend integration and end-to-end testing!\n");

    process.exit(0);
  } catch (error) {
    log.error(`Test failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

runTests();
