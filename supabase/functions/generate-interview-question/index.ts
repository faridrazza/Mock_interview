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
    // We're already expecting experienceLevel to be one of: 'fresher', 'intermediate', 'senior'
    const { jobRole, experienceLevel, yearsOfExperience, conversationHistory } = await req.json();

    // Enhanced system prompt for more realistic interviews
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

    // Create messages array for the API request
    const messages = [
      { role: "system", content: systemPrompt },
    ];

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

    console.log("Sending request to OpenAI with messages:", messages);

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
    console.log("OpenAI response:", result);

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
    console.error("Error in generate-interview-question:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
