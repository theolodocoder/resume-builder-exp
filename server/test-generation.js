const fs = require("fs-extra");
const path = require("path");
const http = require("http");

// Sample resume data with projects and certifications - matching client defaults
const resumeData = {
  contact: {
    fullName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarahjohnson",
    website: "sarahjohnson.dev",
  },
  summary: "Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative software solutions. Proven track record of launching products that drive user engagement and revenue growth. Expert in agile methodologies, user research, and data-driven decision making.",
  experience: [
    {
      id: "1",
      company: "TechCorp Inc.",
      position: "Senior Product Manager",
      location: "San Francisco, CA",
      startDate: "Jan 2020",
      endDate: "Present",
      description: "Lead product strategy and roadmap for flagship SaaS platform serving 100K+ users\n• Increased user retention by 35% through data-driven feature improvements\n• Managed cross-functional team of 12 engineers, designers, and analysts\n• Successfully launched 3 major product releases, generating $2M in additional revenue",
    },
    {
      id: "2",
      company: "InnovateSoft",
      position: "Product Manager",
      location: "San Francisco, CA",
      startDate: "Jun 2017",
      endDate: "Dec 2019",
      description: "Drove product development for mobile application with 500K+ downloads\n• Conducted extensive user research and A/B testing to optimize user experience\n• Collaborated with engineering team to reduce app crashes by 60%\n• Launched successful referral program that increased user acquisition by 45%",
    },
  ],
  education: [
    {
      id: "1",
      school: "Stanford University",
      degree: "Master of Business Administration",
      field: "Technology Management",
      graduationDate: "May 2017",
    },
    {
      id: "2",
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      graduationDate: "May 2014",
    },
  ],
  projects: [
    {
      id: "1",
      name: "Analytics Dashboard Platform",
      description: "Designed and launched a comprehensive real-time analytics dashboard serving 50K+ users • Increased dashboard adoption by 80% through intuitive UX improvements • Implemented custom reporting features reducing customer support tickets by 40%",
      technologies: "React, Node.js, PostgreSQL, D3.js",
      link: "https://analytics-platform.com",
      startDate: "Mar 2022",
      endDate: "Dec 2022",
    },
    {
      id: "2",
      name: "Mobile AI Assistant App",
      description: "Led development of AI-powered mobile assistant with 250K+ downloads • Optimized ML model performance reducing latency by 50% • Achieved 4.8-star rating through continuous user feedback iteration",
      technologies: "React Native, Python, TensorFlow, Firebase",
      link: "https://github.com/sarahjohnson/ai-assistant",
      startDate: "Jun 2021",
      endDate: "Nov 2021",
    },
  ],
  certifications: [
    {
      id: "1",
      name: "Certified Scrum Product Owner (CSPO)",
      issuer: "Scrum Alliance",
      issueDate: "Sep 2022",
      credentialId: "CSM-SA-12345",
      credentialUrl: "https://www.scrumalliance.org",
    },
    {
      id: "2",
      name: "Google Analytics Individual Qualification",
      issuer: "Google",
      issueDate: "Mar 2021",
      expirationDate: "Mar 2024",
      credentialId: "GA-IQ-67890",
    },
    {
      id: "3",
      name: "Lean Six Sigma Green Belt",
      issuer: "International Association for Six Sigma Certification",
      issueDate: "Jan 2020",
      credentialId: "IATF-GB-11111",
    },
  ],
  skills: [
    "Product Strategy",
    "Agile/Scrum",
    "User Research",
    "Data Analysis",
    "A/B Testing",
    "Roadmap Planning",
    "Stakeholder Management",
    "SQL",
    "JIRA",
    "Figma",
  ],
};

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let responseData = Buffer.alloc(0);

      res.on("data", (chunk) => {
        responseData = Buffer.concat([responseData, chunk]);
      });

      res.on("end", () => {
        resolve({
          status: res.statusCode,
          data: responseData,
          headers: res.headers,
        });
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testGeneration() {
  console.log("============================================");
  console.log("Resume Generation Test with All Data");
  console.log("============================================\n");

  // Show data summary
  console.log("Resume Data Summary:");
  console.log(`  Contact: ${resumeData.contact.fullName}`);
  console.log(`  Email: ${resumeData.contact.email}`);
  console.log(`  Experience items: ${resumeData.experience.length}`);
  console.log(`  Education items: ${resumeData.education.length}`);
  console.log(`  Projects: ${resumeData.projects.length}`);
  console.log(`  Certifications: ${resumeData.certifications.length}`);
  console.log(`  Skills: ${resumeData.skills.length}\n`);

  console.log("Projects being sent:");
  resumeData.projects.forEach((proj, i) => {
    console.log(`  ${i + 1}. ${proj.name} (${proj.startDate} - ${proj.endDate})`);
  });

  console.log("\nCertifications being sent:");
  resumeData.certifications.forEach((cert, i) => {
    console.log(`  ${i + 1}. ${cert.name} from ${cert.issuer}`);
  });

  console.log("\n============================================");
  console.log("Starting generation tests...\n");

  try {
    // Test PDF generation
    console.log("1. Testing PDF generation...");
    const pdfResponse = await makeRequest("POST", "/api/generate/pdf", resumeData);

    if (pdfResponse.status === 200) {
      const outputPath = "C:\\Users\\USER\\Desktop\\test-resume.pdf";
      fs.writeFileSync(outputPath, pdfResponse.data);
      const sizeKB = (pdfResponse.data.length / 1024).toFixed(2);
      console.log(`   OK PDF generated (${sizeKB} KB)`);
      console.log(`   Saved to: ${outputPath}`);
    } else {
      console.log(`   ERROR PDF generation failed: ${pdfResponse.status}`);
      const responseText = pdfResponse.data.toString().substring(0, 200);
      console.log(`   Response: ${responseText}`);
    }

    // Test DOCX generation
    console.log("\n2. Testing DOCX generation...");
    const docxResponse = await makeRequest("POST", "/api/generate/docx", resumeData);

    if (docxResponse.status === 200) {
      const outputPath = "C:\\Users\\USER\\Desktop\\test-resume.docx";
      fs.writeFileSync(outputPath, docxResponse.data);
      const sizeKB = (docxResponse.data.length / 1024).toFixed(2);
      console.log(`   OK DOCX generated (${sizeKB} KB)`);
      console.log(`   Saved to: ${outputPath}`);
    } else {
      console.log(`   ERROR DOCX generation failed: ${docxResponse.status}`);
      const responseText = docxResponse.data.toString().substring(0, 200);
      console.log(`   Response: ${responseText}`);
    }

    console.log("\n============================================");
    console.log("Testing Complete!");
    console.log("============================================");
    console.log("\nVerify in the generated files:");
    console.log("  PDF File: Check that:");
    console.log("    ✓ Projects section appears with both projects");
    console.log("    ✓ Certifications section appears with all 3 certs");
    console.log("    ✓ Font is consistent (Libre Baskerville)");
    console.log("    ✓ Bullet points are properly formatted per line");
    console.log("    ✓ Technologies are displayed for projects");
    console.log("    ✓ Credential IDs are shown for certifications\n");
    console.log("  DOCX File: Check that:");
    console.log("    ✓ Projects section appears with all fields");
    console.log("    ✓ Certifications section appears");
    console.log("    ✓ Proper Word formatting with bullet lists");

  } catch (error) {
    console.error("ERROR Test failed:", error.message);
    process.exit(1);
  }
}

testGeneration();
