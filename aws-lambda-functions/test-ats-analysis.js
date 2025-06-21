const axios = require('axios');

// Test data - simplified resume content
const testResumeContent = {
  contactInfo: {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1-555-123-4567",
    location: "New York, NY"
  },
  summary: "Experienced software engineer with 5 years in full-stack development",
  experience: [
    {
      company: "Tech Corp",
      position: "Senior Software Engineer",
      startDate: "2020-01",
      endDate: "2024-12",
      location: "New York, NY",
      description: "Led development of web applications using React and Node.js",
      achievements: [
        "Increased application performance by 40%",
        "Mentored 3 junior developers"
      ]
    }
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2016-09",
      endDate: "2020-05",
      location: "New York, NY"
    }
  ],
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2023-06"
    }
  ],
  projects: [
    {
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce platform using React and Express",
      technologies: ["React", "Express", "MongoDB", "Stripe"]
    }
  ]
};

const testJobDescription = `
We are looking for a Senior Software Engineer to join our team. 
Requirements:
- 5+ years of experience in software development
- Strong knowledge of JavaScript, React, and Node.js
- Experience with cloud platforms (AWS preferred)
- Bachelor's degree in Computer Science or related field
- Experience with agile development methodologies
- Strong problem-solving skills and attention to detail
`;

async function testATSAnalysis() {
  const lambdaEndpoint = 'https://apb59k8zqg.execute-api.us-east-1.amazonaws.com/prod/ats-analysis';
  
  const payload = {
    resumeContent: testResumeContent,
    jobDescription: testJobDescription,
    forceReAnalysis: true,
    templateId: 'standard',
    isPublicUpload: true
  };

  try {
    console.log('🚀 Testing ATS Analysis Lambda Function...');
    console.log('📡 Endpoint:', lambdaEndpoint);
    
    const startTime = Date.now();
    
    const response = await axios.post(lambdaEndpoint, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 seconds timeout
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Success! Response received in', duration, 'ms');
    console.log('📊 ATS Analysis Results:');
    console.log('   Score:', response.data.score);
    console.log('   Feedback length:', response.data.feedback?.length || 0, 'characters');
    console.log('   Keyword matches:', response.data.keyword_matches?.length || 0);
    console.log('   Missing keywords:', response.data.missing_keywords?.length || 0);
    console.log('   Improvement suggestions:', response.data.improvement_suggestions?.length || 0);
    console.log('   Has detailed assessment:', !!response.data.detailed_assessment);
    
    if (response.data.detailed_assessment) {
      const assessment = response.data.detailed_assessment;
      console.log('   Detailed Scores:');
      console.log('     Hard Skills:', assessment.hard_skills_score || 'N/A');
      console.log('     Job Title:', assessment.job_title_score || 'N/A');
      console.log('     Soft Skills:', assessment.soft_skills_score || 'N/A');
      console.log('     Achievements:', assessment.achievements_score || 'N/A');
      console.log('     Education:', assessment.education_score || 'N/A');
      console.log('     Formatting:', assessment.formatting_score || 'N/A');
      console.log('     Relevance:', assessment.relevance_score || 'N/A');
    }
    
    console.log('\n🎉 ATS Analysis Lambda function is working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
    }
    
    return false;
  }
}

// Run the test
testATSAnalysis()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 