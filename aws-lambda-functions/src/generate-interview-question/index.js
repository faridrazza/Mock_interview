const https = require('https');

/**
 * AWS Lambda function for generating interview questions
 * Migrated from Supabase Edge Function for AWS Lambda Hackathon
 * 
 * This function demonstrates:
 * - Serverless AI question generation
 * - Integration with OpenAI API
 * - Advanced interview logic
 * - Real-world business application
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Make HTTP request to OpenAI API
 * @param {Object} payload - Request payload for OpenAI
 * @returns {Promise<Object>} - OpenAI response
 */
async function callOpenAI(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (res.statusCode === 200) {
            resolve(result);
          } else {
            reject(new Error(result.error?.message || `HTTP ${res.statusCode}`));
          }
        } catch (error) {
          reject(new Error('Failed to parse OpenAI response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Generate interview system prompt based on job role and experience
 * @param {string} jobRole - The job role for the interview
 * @param {string} experienceLevel - Experience level (fresher, intermediate, senior)
 * @param {number} yearsOfExperience - Years of experience
 * @returns {string} - System prompt for OpenAI
 */
function generateSystemPrompt(jobRole, experienceLevel, yearsOfExperience) {
  let systemPrompt = `You are an expert technical interviewer for a ${jobRole} position with a candidate who has a ${experienceLevel} experience level`;
  
  if (experienceLevel === 'fresher') {
    systemPrompt += ` (no professional experience).`;
  } else {
    systemPrompt += ` (${yearsOfExperience} years of experience).`;
  }
  
  systemPrompt += `
  CRITICAL INTERVIEW ASSESSMENT GUIDELINES:
  - You must critically evaluate the candidate's responses for technical accuracy and depth
  - If answers suggest the candidate lacks the claimed experience level, adapt your questions accordingly:
    * If they claim 5+ years but give junior-level answers, ask more targeted follow-ups to verify skills
    * If they can't answer basic questions relevant to their claimed experience, directly ask about this discrepancy
    * Notice contradictions in their claims about experience and actual knowledge demonstrated
  
  DETAILED QUESTIONING APPROACH:
  - Begin with open-ended questions about their experience and projects
  - Always follow up with deeper technical questions about specifics they mention
  - For any technology or concept they mention, ask implementation details that someone with their claimed experience would know
  - If they mention a project, ask specific technical challenges and how they solved them
  - Include ${jobRole}-specific technical scenarios that test practical knowledge
  
  QUESTION CATEGORIES (rotate between these throughout the interview):
  1. Core ${jobRole} Technical Knowledge - test fundamentals and advanced concepts
  2. Specific Technology Experience - probe depth on tools/frameworks they've mentioned
  3. System Design and Architecture - appropriate to their claimed experience level
  4. Technical Problem-Solving - ask them to describe solutions to realistic problems
  5. Technical Decision-Making - ask about tradeoffs and reasoning behind technical choices
  
  EXPERIENCE-LEVEL SPECIFIC APPROACH:`;
  
  if (experienceLevel === 'fresher') {
    systemPrompt += `
    - Focus on fundamentals and baseline knowledge verification
    - If they claim academic/personal projects, verify actual implementation details
    - Test for problem-solving potential with simple but insightful questions
    - Keep questions at an appropriate entry level but don't accept vague or incorrect answers`;
  } else if (experienceLevel === 'intermediate') {
    systemPrompt += `
    - Verify they have deeper knowledge than a beginner
    - Test for specific experience with frameworks, libraries, and tools common in ${jobRole}
    - Ask about architectural decisions in previous projects
    - Expect concrete examples of problems they've solved independently
    - Look for signs of good technical judgment and independent work capability`;
  } else if (experienceLevel === 'senior') {
    systemPrompt += `
    - Expect deep technical expertise and leadership evidence
    - Questions should probe system design skills and architectural decision-making
    - Verify experience leading technical initiatives or mentoring others
    - Test advanced problem-solving capabilities with complex scenarios
    - Probe their knowledge of optimization, security, scalability and best practices
    - Expect clear communication about complex technical topics`;
  }
  
  systemPrompt += `
  
  IMPORTANT GUIDELINES:
  - Each response should contain exactly one clear, focused question
  - If their answers consistently don't match their claimed experience level, directly address this: "I notice your answers suggest less hands-on experience with X than your years of experience might indicate. Could you clarify your specific role and responsibilities in your previous work?"
  - Always maintain a professional and respectful tone
  - If they struggle with a question, follow up with an easier related question to better gauge their knowledge level
  - Ask for specific examples rather than accepting theoretical or vague answers
  - Don't accept non-answers or deflections - politely persist until you get a substantive response
  `;

  return systemPrompt;
}

/**
 * Generate fallback questions for when OpenAI fails
 * @param {string} jobRole - The job role
 * @param {string} experienceLevel - Experience level
 * @returns {string} - Fallback question
 */
function getFallbackQuestion(jobRole, experienceLevel) {
  const fallbackQuestions = {
    fresher: [
      "Could you tell me about any personal or academic projects you've worked on related to this role?",
      "What programming languages or technologies are you most comfortable with?",
      "How do you approach learning new technologies?",
      "Tell me about a challenging problem you solved during your studies.",
      "What interests you most about working as a " + jobRole + "?"
    ],
    intermediate: [
      "Could you walk me through a recent project you worked on and your specific contributions?",
      "How do you handle technical debt in your projects?",
      "Tell me about a time when you had to learn a new technology quickly.",
      "What's your approach to code reviews and collaboration?",
      "How do you ensure the quality of your code?"
    ],
    senior: [
      "How do you approach system design for scalable applications?",
      "Tell me about a time when you had to make a critical architectural decision.",
      "How do you mentor junior developers and share knowledge?",
      "What's your approach to technical leadership in cross-functional teams?",
      "How do you balance technical debt with feature development?"
    ]
  };

  const questions = fallbackQuestions[experienceLevel] || fallbackQuestions.intermediate;
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Validate environment variables
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: "OpenAI API key not configured",
          details: "OPENAI_API_KEY environment variable is missing"
        })
      };
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: "Invalid JSON in request body",
          details: parseError.message
        })
      };
    }

    const { jobRole, experienceLevel, yearsOfExperience, conversationHistory } = requestBody;

    // Validate required parameters
    if (!jobRole || !experienceLevel) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: "Missing required parameters",
          details: "jobRole and experienceLevel are required"
        })
      };
    }

    console.log(`Generating question for ${jobRole} (${experienceLevel} level)`);

    // Generate system prompt
    const systemPrompt = generateSystemPrompt(jobRole, experienceLevel, yearsOfExperience);

    // Create messages array for OpenAI API
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Add conversation history if it exists
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    } else {
      // If there's no history, this is the first question
      messages.push({
        role: "user",
        content: "I'm ready to start the interview."
      });
    }

    try {
      // Call OpenAI API
      const openAIResponse = await callOpenAI({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      if (!openAIResponse.choices || !openAIResponse.choices[0] || !openAIResponse.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      const generatedQuestion = openAIResponse.choices[0].message.content;

      console.log('Successfully generated question via OpenAI');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          question: generatedQuestion,
          source: 'openai'
        })
      };

    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError);
      
      // Use fallback question when OpenAI fails
      const fallbackQuestion = getFallbackQuestion(jobRole, experienceLevel);
      
      console.log('Using fallback question due to OpenAI error');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          question: fallbackQuestion,
          source: 'fallback',
          warning: 'Generated using fallback due to AI service unavailability'
        })
      };
    }

  } catch (error) {
    console.error('Lambda function error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "Internal server error",
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 