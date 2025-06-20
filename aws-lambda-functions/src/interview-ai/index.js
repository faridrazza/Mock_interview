const https = require('https');

/**
 * AWS Lambda function for advanced interview AI
 * Migrated from Supabase Edge Function for AWS Lambda Hackathon
 * 
 * This function demonstrates:
 * - Serverless AI processing
 * - Integration with OpenAI API
 * - Advanced conversation management
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
            reject(new Error(result.error?.message || 'OpenAI API error'));
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
 * Main Lambda handler function
 * @param {Object} event - Lambda event object
 * @param {Object} context - Lambda context object
 * @returns {Object} - HTTP response
 */
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Validate OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "OpenAI API key not configured",
        message: "Please set the OPENAI_API_KEY environment variable"
      })
    };
  }

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    const { jobRole, companyName, questions, conversationHistory } = requestBody;

    // Validate required parameters
    if (!jobRole || !companyName) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: "Missing required parameters",
          message: "jobRole and companyName are required"
        })
      };
    }

    // Enhanced system prompt for company-specific interviews
    let systemPrompt = `You are an expert interviewer for ${companyName}, conducting an interview for a ${jobRole} position.
    
    Interview Guidelines:
    - You have specific questions to cover from the provided list
    - Maintain a natural conversation flow while introducing new topics
    - Ask follow-up questions based on the candidate's responses to dive deeper
    - Assess both technical knowledge and soft skills relevant to ${jobRole} at ${companyName}
    - Adjust technical depth based on candidate's responses
    - Ask one question at a time - this is critical for a good interview experience
    - Don't say "As an AI interviewer" or similar phrases
    - Keep responses concise but thorough - typically 2-3 paragraphs maximum
    - Don't number your questions or use prefixes like "Technical Question:"
    
    Company-Specific Guidance:
    - Incorporate ${companyName}'s known values and culture in your assessment
    - Use the question list provided but feel free to add relevant follow-ups
    - Transition naturally between questions
    
    Remember:
    - Listen carefully to previous answers and reference them in follow-up questions
    - Keep the interview professional but conversational
    - Each response should contain exactly one clear, focused question
    `;

    // Create messages array for the API request
    const messages = [
      { role: "system", content: systemPrompt },
    ];

    // Add information about the prepared questions
    if (questions && questions.length > 0) {
      const questionsContent = `Here are the specific questions to cover during this interview:
      ${questions.map((q, i) => `${i+1}. ${q.questionText}`).join('\n')}
      
      Cover these questions naturally throughout the interview, but feel free to ask relevant follow-up questions based on the candidate's responses.`;
      
      messages.push({ role: "system", content: questionsContent });
    }

    // Add conversation history if it exists
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    } else {
      // If there's no history, this is the first question - make it a strong opening
      messages.push({
        role: "user",
        content: "I'm ready to start the interview."
      });
    }

    console.log("Sending request to OpenAI with messages:", JSON.stringify(messages.slice(0, 2)));

    // Call OpenAI API
    const openAIPayload = {
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    };

    const result = await callOpenAI(openAIPayload);
    console.log("OpenAI response received successfully");

    const generatedQuestion = result.choices[0].message.content;

    // Log usage for analytics (this could be stored in DynamoDB)
    console.log(`Interview AI used for ${jobRole} at ${companyName}`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        question: generatedQuestion,
        timestamp: new Date().toISOString(),
        metadata: {
          jobRole,
          companyName,
          questionCount: questions?.length || 0,
          conversationLength: conversationHistory?.length || 0
        }
      })
    };

  } catch (error) {
    console.error("Error in interview-ai Lambda:", error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error.message || "Internal server error",
        timestamp: new Date().toISOString()
      })
    };
  }
}; 