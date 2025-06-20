
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not found" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { jobRole, companyName, questions, conversationHistory } = await req.json();

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
      ${questions.map((q: any, i: number) => `${i+1}. ${q.questionText}`).join('\n')}
      
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

    const result = await response.json();
    console.log("OpenAI response received");

    if (!response.ok) {
      throw new Error(result.error?.message || "Failed to generate interview question");
    }

    const generatedQuestion = result.choices[0].message.content;

    return new Response(
      JSON.stringify({ question: generatedQuestion }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in advanced-interview-ai:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
