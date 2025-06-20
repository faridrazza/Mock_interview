const fetch = require('node-fetch');

/**
 * AWS Lambda function for generating company-specific interview questions
 * Creates realistic interview questions based on company and role
 * 
 * This function provides:
 * - Company-specific question generation
 * - Role-appropriate technical and behavioral questions
 * - Interview preparation suggestions
 * - Reference links and categorization
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Fallback suggestions for interview preparation
 */
const getFallbackSuggestions = (companyName, jobRole) => [
  {
    title: "Research the Company",
    description: `Learn about ${companyName}'s products, services, culture, and recent news to demonstrate your interest and preparation.`
  },
  {
    title: "Practice Common Questions",
    description: "Prepare answers for common interview questions using the STAR method (Situation, Task, Action, Result)."
  },
  {
    title: "Review Technical Fundamentals",
    description: `Brush up on key technical skills relevant to the ${jobRole} position.`
  },
  {
    title: "Prepare Your Questions",
    description: "Have thoughtful questions ready to ask your interviewers about the role, team, and company."
  },
  {
    title: "Mock Interviews",
    description: "Practice with a friend or mentor to get comfortable with the interview format and receive feedback."
  }
];

/**
 * Main Lambda handler for generating company questions
 */
exports.handler = async (event) => {
  console.log('Generate company questions request received:', JSON.stringify(event, null, 2));
  
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
    const { jobRole, companyName } = body;

    if (!jobRole || !companyName) {
      throw new Error("Job role and company name are required");
    }

    console.log(`Generating interview questions for ${jobRole} at ${companyName}`);

    // Create system prompt for question generation
    const systemPrompt = `You are an expert interview coach who specializes in preparing candidates for technical interviews.
    
I need you to generate 10 realistic interview questions that a candidate might face when interviewing for a ${jobRole} position at ${companyName}.

For each question:
1. Provide the detailed question text
2. Include 1-2 reference links where similar questions or topics have been reported (Stack Overflow, LeetCode, Glassdoor, or credible tech blogs)
3. Indicate an approximate year when this type of question was reportedly asked (based on your knowledge)

Format your response as a valid JSON array of question objects with the following structure:
{
  "questions": [
    {
      "questionText": "detailed question here",
      "references": ["url1", "url2"],
      "year": "2023",
      "category": "one of: Technical, Behavioral, System Design, Problem Solving, or Leadership"
    },
    ...more questions
  ]
}

Make the questions realistic and company-specific, incorporating known interview practices at ${companyName} for ${jobRole} positions.`;

    console.log("Sending questions request to OpenAI...");

    // Call OpenAI API for questions
    const questionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!questionsResponse.ok) {
      const errorData = await questionsResponse.json();
      console.error("OpenAI API error for questions:", errorData);
      
      // Return a more helpful error message based on the status code
      let errorMessage = "Unknown error occurred while generating questions";
      
      if (questionsResponse.status === 401) {
        errorMessage = "Authentication error: Invalid OpenAI API key";
      } else if (questionsResponse.status === 429) {
        errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
      } else if (questionsResponse.status >= 500) {
        errorMessage = "OpenAI service is currently unavailable. Please try again later.";
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      throw new Error(errorMessage);
    }

    const questionsData = await questionsResponse.json();
    console.log("Questions data received successfully");

    if (!questionsData.choices || !questionsData.choices[0] || !questionsData.choices[0].message || !questionsData.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI API for questions');
    }

    // Parse questions
    let questions = [];
    try {
      const questionsContent = questionsData.choices[0].message.content;
      const parsedQuestions = JSON.parse(questionsContent);
      questions = parsedQuestions.questions || [];
      console.log(`Parsed ${questions.length} questions successfully`);
    } catch (error) {
      console.error("Error parsing questions:", error);
      throw new Error("Failed to parse questions from OpenAI API response");
    }

    // Generate preparation suggestions
    const suggestionsPrompt = `Based on the role of ${jobRole} at ${companyName}, provide 5 key interview preparation suggestions. 
    These should be specific to this company and role, covering technical preparation, behavioral question preparation, 
    and any company-specific culture or values to be aware of. Format as a JSON array of suggestion objects:
    {
      "suggestions": [
        {
          "title": "Short title",
          "description": "Detailed suggestion"
        }
      ]
    }`;

    console.log("Sending suggestions request to OpenAI...");

    // Call OpenAI API for suggestions
    const suggestionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: suggestionsPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    let suggestions = [];
    
    if (!suggestionsResponse.ok) {
      console.error("OpenAI API error for suggestions, using fallback");
      suggestions = getFallbackSuggestions(companyName, jobRole);
    } else {
      try {
        const suggestionsData = await suggestionsResponse.json();
        console.log("Suggestions data received successfully");
        
        const suggestionsContent = suggestionsData.choices[0].message.content;
        const parsedSuggestions = JSON.parse(suggestionsContent);
        suggestions = parsedSuggestions.suggestions || [];
        console.log(`Parsed ${suggestions.length} suggestions successfully`);
      } catch (error) {
        console.error("Error parsing suggestions, using fallback:", error);
        suggestions = getFallbackSuggestions(companyName, jobRole);
      }
    }

    // Ensure we have fallback suggestions if none were generated
    if (!suggestions || suggestions.length === 0) {
      suggestions = getFallbackSuggestions(companyName, jobRole);
    }

    console.log("Successfully generated company questions and suggestions");

    // Return both questions and suggestions
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        questions: questions,
        suggestions: suggestions,
        metadata: {
          provider: 'openai',
          model: 'gpt-4o-mini',
          companyName,
          jobRole,
          timestamp: new Date().toISOString(),
          questionsCount: questions.length,
          suggestionsCount: suggestions.length
        }
      })
    };

  } catch (error) {
    console.error('Error in generate company questions:', error);
    
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