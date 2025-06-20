const https = require('https');

/**
 * AWS Lambda function for generating interview feedback
 * Migrated from Supabase Edge Function for AWS Lambda Hackathon
 * 
 * This function demonstrates:
 * - Advanced AI-powered feedback generation
 * - Comprehensive interview assessment
 * - Professional evaluation criteria
 * - Real-world HR/recruiting application
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
 * Generate feedback system prompt
 * @param {string} jobRole - The job role
 * @param {string} experienceLevel - Experience level
 * @param {string} companyName - Company name (optional)
 * @returns {string} - System prompt for feedback generation
 */
function generateFeedbackPrompt(jobRole, experienceLevel, companyName) {
  return `You are an experienced technical interviewer and hiring manager specializing in ${jobRole} positions.
Your task is to provide comprehensive, honest feedback on a technical interview for a ${experienceLevel} level ${jobRole} position at ${companyName || 'a tech company'}.

CRITICAL EVALUATION AREAS:
1. Technical Accuracy & Expertise Assessment:
   - Evaluate whether the candidate's technical knowledge matches their claimed experience level
   - Identify any discrepancies between claimed experience/skills and demonstrated knowledge
   - Assess depth of technical understanding in core ${jobRole} concepts

2. Technical Interview Performance:
   - Evaluate problem-solving approach and technical reasoning
   - Assess code/solution quality (if coding questions were asked)
   - Evaluate system design understanding appropriate to their claimed level

3. Professional Assessment:
   - Communication clarity and ability to explain technical concepts
   - Professional demeanor and confidence
   - Ability to handle challenging technical questions

4. Experience Verification:
   - Flag any signs that suggest the candidate may have misrepresented their experience level
   - Identify inconsistencies in their technical narrative or project descriptions
   - Note when answers to basic questions don't align with claimed years of experience

CRITICAL INSTRUCTIONS:
- Be direct and honest about technical shortcomings while maintaining professionalism
- If you observe a significant mismatch between claimed experience and demonstrated knowledge, explicitly note this
- Provide specific examples from the transcript to support your assessment
- For candidates claiming senior/experienced roles, hold them to appropriate technical standards
- Don't accept vague answers or theoretical knowledge as substitutes for hands-on experience

Provide your feedback in the following specific JSON format:
{
  "overallScore": [number between 1-10],
  "technicalAccuracy": [number between 1-10],
  "communicationClarity": [number between 1-10],
  "confidence": [number between 1-10],
  "experienceLevelMatch": [number between 1-10, rating how well their answers match their claimed experience],
  "strengths": [array of 3-5 specific strengths with examples],
  "improvements": [array of 3-5 specific areas for improvement with examples],
  "experienceAssessment": [paragraph specifically addressing whether their technical knowledge aligns with their claimed experience level],
  "detailedFeedback": [comprehensive technical assessment with specific examples from the transcript],
  "hiringRecommendation": ["Highly Recommend", "Recommend", "Consider", "Do Not Recommend"]
}

Your assessment must be technically accurate, fair, and evidence-based while providing actionable feedback.`;
}

/**
 * Generate fallback feedback when AI fails
 * @param {string} jobRole - The job role
 * @param {string} experienceLevel - Experience level
 * @returns {Object} - Fallback feedback object
 */
function generateFallbackFeedback(jobRole, experienceLevel) {
  return {
    overallScore: 6,
    technicalAccuracy: 6,
    communicationClarity: 7,
    confidence: 6,
    experienceLevelMatch: 6,
    strengths: [
      "Showed willingness to engage in the interview process",
      "Attempted to answer technical questions",
      "Demonstrated basic communication skills"
    ],
    improvements: [
      "Could provide more specific examples from real-world experience",
      "Should focus on deeper technical explanations",
      "Consider practicing more technical interview scenarios"
    ],
    experienceAssessment: `The candidate participated in the interview but we were unable to provide detailed assessment due to technical limitations. Manual review recommended.`,
    detailedFeedback: `This feedback was generated using our backup system due to temporary AI service unavailability. The candidate showed engagement during the interview process. For a more detailed assessment, please review the interview transcript manually or try generating feedback again when our AI services are restored.`,
    hiringRecommendation: "Consider"
  };
}

/**
 * Post-process feedback to remove generic critiques without specific examples
 * @param {Object} feedbackData - The feedback object to process
 * @returns {Object} - Processed feedback object
 */
function postProcessFeedback(feedbackData) {
  if (!feedbackData.improvements || !Array.isArray(feedbackData.improvements)) {
    return feedbackData;
  }

  const irrelevanceKeywords = [
    'pleasantries', 'directly address', 'on topic', 'off topic', 
    'irrelevant', 'stay focused', 'distract from', 'unrelated'
  ];
  
  // Look for mentions of irrelevance in detailed feedback
  const hasSpecificIrrelevanceExample = 
    feedbackData.detailedFeedback && 
    feedbackData.detailedFeedback.includes('For instance') && 
    irrelevanceKeywords.some(keyword => 
      feedbackData.detailedFeedback.toLowerCase().includes(keyword)
    );
  
  // If there are no specific examples, filter out generic relevance critiques
  if (!hasSpecificIrrelevanceExample) {
    feedbackData.improvements = feedbackData.improvements.filter(improvement => 
      !irrelevanceKeywords.some(keyword => 
        improvement.toLowerCase().includes(keyword)
      )
    );
    
    // If we've filtered out too many items, add a more relevant improvement
    if (feedbackData.improvements.length < 2) {
      feedbackData.improvements.push(
        "Consider providing more specific examples to illustrate technical concepts."
      );
    }
    
    // Also clean up the detailed feedback
    if (feedbackData.detailedFeedback) {
      const sentences = feedbackData.detailedFeedback.split(/(?<=[.!?])\s+/);
      const filteredSentences = sentences.filter(sentence => 
        !irrelevanceKeywords.some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      );
      feedbackData.detailedFeedback = filteredSentences.join(' ');
    }
  }

  return feedbackData;
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

    const { jobRole, companyName, conversation, experienceLevel } = requestBody;

    console.log(`Generating feedback for ${jobRole} role at ${companyName || 'company'}`);
    console.log(`Request parameters:`, { 
      jobRole, 
      experienceLevel, 
      companyName: companyName || 'undefined',
      conversationLength: conversation ? conversation.length : 'undefined',
      hasYearsOfExperience: requestBody.yearsOfExperience !== undefined 
    });

    // Validate required parameters
    if (!jobRole || !conversation) {
      console.error("Missing required parameters:", { jobRole: !!jobRole, conversation: !!conversation });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: "Missing required parameters",
          details: "jobRole and conversation are required"
        })
      };
    }

    // Validate conversation data
    if (!Array.isArray(conversation) || conversation.length < 2) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: "Invalid conversation data",
          details: "Need at least one question and answer pair"
        })
      };
    }

    const finalExperienceLevel = experienceLevel || 'mid-level';

    try {
      // Generate system prompt for feedback
      const systemPrompt = generateFeedbackPrompt(jobRole, finalExperienceLevel, companyName);

      // Call OpenAI API
      const openAIResponse = await callOpenAI({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversation
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      console.log("OpenAI response received");

      if (!openAIResponse.choices || !openAIResponse.choices[0] || !openAIResponse.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI');
      }

      // Parse the JSON response
      let feedbackData;
      try {
        feedbackData = JSON.parse(openAIResponse.choices[0].message.content);
      } catch (parseError) {
        console.error("Failed to parse feedback JSON:", parseError);
        throw new Error('Failed to parse feedback data from AI response');
      }

      // Validate the feedback data structure
      if (!feedbackData.overallScore || 
          !feedbackData.technicalAccuracy || 
          !feedbackData.communicationClarity || 
          !feedbackData.confidence || 
          !Array.isArray(feedbackData.strengths) || 
          !Array.isArray(feedbackData.improvements) || 
          !feedbackData.detailedFeedback) {
        
        console.warn("Invalid feedback data structure, using defaults");
        
        // Try to fix the data if possible
        feedbackData = {
          overallScore: feedbackData.overallScore || 5,
          technicalAccuracy: feedbackData.technicalAccuracy || 5,
          communicationClarity: feedbackData.communicationClarity || 5,
          confidence: feedbackData.confidence || 5,
          experienceLevelMatch: feedbackData.experienceLevelMatch || 5,
          strengths: Array.isArray(feedbackData.strengths) ? feedbackData.strengths : 
                    ["Shows enthusiasm for the role", "Demonstrates basic technical knowledge"],
          improvements: Array.isArray(feedbackData.improvements) ? feedbackData.improvements : 
                       ["Could provide more detailed examples", "Should focus on structured problem-solving"],
          experienceAssessment: feedbackData.experienceAssessment || 
                               "Further evaluation needed to assess experience alignment.",
          detailedFeedback: feedbackData.detailedFeedback || 
                           "The interview shows potential but needs improvement in key areas. Consider practicing more technical questions and focusing on clear communication.",
          hiringRecommendation: feedbackData.hiringRecommendation || "Consider"
        };
      }

      // Post-process feedback to clean up irrelevant critiques
      feedbackData = postProcessFeedback(feedbackData);

      console.log("Successfully generated feedback via OpenAI");

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          feedback: feedbackData,
          source: 'openai'
        })
      };

    } catch (openAIError) {
      console.error('OpenAI API error:', {
        message: openAIError.message,
        status: openAIError.status,
        code: openAIError.code,
        type: openAIError.type,
        requestParams: { jobRole, experienceLevel, companyName: companyName || 'undefined' }
      });
      
      // Use fallback feedback when OpenAI fails
      const fallbackFeedback = generateFallbackFeedback(jobRole, finalExperienceLevel);
      
      console.log('Using fallback feedback due to OpenAI error');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          feedback: fallbackFeedback,
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