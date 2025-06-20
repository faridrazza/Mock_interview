const fetch = require('node-fetch');

/**
 * AWS Lambda function for Advanced Interview AI
 * Handles company-specific interview conversations with intelligent question flow
 * 
 * This function provides:
 * - Company-specific interview experiences
 * - Intelligent conversation flow management
 * - Follow-up question generation based on responses
 * - Professional interview assessment capabilities
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Main Lambda handler for advanced interview AI
 */
exports.handler = async (event) => {
  console.log('Advanced Interview AI request received:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: 'ok'
    };
  }

  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key not found");
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: "OpenAI API key not found",
        message: "Please set the OPENAI_API_KEY environment variable."
      })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { jobRole, companyName, questions, conversationHistory } = body;

    if (!jobRole || !companyName) {
      throw new Error("Job role and company name are required");
    }

    console.log(`Processing advanced interview for ${jobRole} at ${companyName}`);

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

    console.log("Sending request to OpenAI with messages count:", messages.length);

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    console.log("OpenAI API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(errorData.error?.message || "Failed to generate interview question");
    }

    const result = await response.json();
    console.log("OpenAI response received successfully");

    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      throw new Error("Invalid response structure from OpenAI API");
    }

    const generatedQuestion = result.choices[0].message.content;

    console.log("Successfully generated advanced interview question");

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question: generatedQuestion,
        metadata: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          companyName,
          jobRole,
          timestamp: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Error in advanced interview AI:', error);
    
    // Provide detailed error information for debugging
    const errorResponse = {
      error: error.message || 'Unknown error occurred',
      provider: 'openai',
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(errorResponse)
    };
  }
}; 