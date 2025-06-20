
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key is configured
    if (!openAIApiKey) {
      console.error("OpenAI API key is not configured");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable." }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { jobRole, companyName } = await req.json();

    if (!jobRole || !companyName) {
      return new Response(
        JSON.stringify({ error: "Job role and company name are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating interview questions for ${jobRole} at ${companyName}`);

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

    // Add timeout and retry logic for OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Return a more helpful error message based on the status code
      let errorMessage = "Unknown error occurred while generating questions";
      
      if (response.status === 401) {
        errorMessage = "Authentication error: Invalid OpenAI API key";
      } else if (response.status === 429) {
        errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
      } else if (response.status >= 500) {
        errorMessage = "OpenAI service is currently unavailable. Please try again later.";
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("OpenAI response received");

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response from OpenAI API');
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

    const suggestionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
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

    if (!suggestionsResponse.ok) {
      const errorData = await suggestionsResponse.json();
      console.error("OpenAI API error for suggestions:", errorData);
      
      // Provide fallback suggestions if we couldn't get them from the API
      const fallbackSuggestions = [
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
      
      // Parse the questions from the first API call
      const questionsContent = data.choices[0].message.content;
      let parsedContent;
      try {
        parsedContent = JSON.parse(questionsContent);
      } catch (e) {
        console.error("Error parsing OpenAI response:", e);
        throw new Error("Failed to parse response from OpenAI. Invalid JSON format.");
      }
      
      const questions = parsedContent.questions || [];
      
      // Return questions with fallback suggestions
      return new Response(
        JSON.stringify({ 
          questions: questions,
          suggestions: fallbackSuggestions
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the suggestions response
    const suggestionsData = await suggestionsResponse.json();
    console.log("Suggestions data received");
    
    let suggestions = [];
    try {
      // Parse the content and extract the suggestions array
      const suggestionsContent = suggestionsData.choices[0].message.content;
      const parsedSuggestions = JSON.parse(suggestionsContent);
      suggestions = parsedSuggestions.suggestions || [];
      console.log("Parsed suggestions:", suggestions);
    } catch (error) {
      console.error("Error parsing suggestions:", error);
      // Provide fallback suggestions
      suggestions = [
        {
          title: "Research the Company",
          description: `Learn about ${companyName}'s products, services, culture, and recent news.`
        },
        {
          title: "Practice STAR Method",
          description: "Prepare answers using Situation, Task, Action, Result format."
        },
        {
          title: "Technical Review",
          description: `Review key ${jobRole} technical concepts.`
        },
        {
          title: "Prepare Questions",
          description: "Have questions ready for your interviewers."
        },
        {
          title: "Mock Interviews",
          description: "Practice with someone to get feedback."
        }
      ];
    }

    // Parse the questions
    let questions = [];
    try {
      const questionsContent = data.choices[0].message.content;
      const parsedQuestions = JSON.parse(questionsContent);
      questions = parsedQuestions.questions || [];
      console.log("Parsed questions:", questions);
    } catch (error) {
      console.error("Error parsing questions:", error);
      throw new Error("Failed to parse questions from OpenAI API response");
    }

    // Return both questions and suggestions
    return new Response(
      JSON.stringify({ 
        questions: questions,
        suggestions: suggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-company-questions function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
