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
    // Log request information for debugging
    console.log("Generating interview feedback - request received");
    
    const requestData = await req.json();
    const { jobRole, companyName, conversation } = requestData;

    console.log(`Generating feedback for ${jobRole} role at ${companyName}`);
    
    if (!conversation || !Array.isArray(conversation) || conversation.length < 2) {
      console.error("Invalid conversation data:", JSON.stringify(conversation));
      return new Response(
        JSON.stringify({
          error: 'Invalid conversation data. Need at least one question and answer.',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error("OpenAI API key is missing");
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key is not configured. Please contact the administrator.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const experienceLevel = requestData.experienceLevel || 'mid-level'; // Default to mid-level if not provided

    // Enhancing the feedback system prompt
    const systemPrompt = `You are an experienced technical interviewer and hiring manager specializing in ${jobRole} positions.
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

    console.log("Calling OpenAI API");
    
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversation,
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    console.log("OpenAI response received");

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Invalid OpenAI response structure:", data);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API', details: data }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse the JSON response
    const feedbackContent = data.choices[0].message.content;
    let feedbackData;
    
    try {
      feedbackData = JSON.parse(feedbackContent);
    } catch (error) {
      console.error("Failed to parse feedback JSON:", error);
      console.log("Raw feedback content:", feedbackContent);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse feedback data', 
          rawContent: feedbackContent 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Post-process feedback to remove generic relevance critiques if no specific examples
    if (feedbackData.improvements && Array.isArray(feedbackData.improvements)) {
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
    }

    // Validate the feedback data
    if (!feedbackData.overallScore || 
        !feedbackData.technicalAccuracy || 
        !feedbackData.communicationClarity || 
        !feedbackData.confidence || 
        !Array.isArray(feedbackData.strengths) || 
        !Array.isArray(feedbackData.improvements) || 
        !feedbackData.detailedFeedback) {
      
      console.error("Invalid feedback data structure:", feedbackData);
      
      // Try to fix the data if possible
      const fixedFeedback = {
        overallScore: feedbackData.overallScore || 5,
        technicalAccuracy: feedbackData.technicalAccuracy || 5,
        communicationClarity: feedbackData.communicationClarity || 5,
        confidence: feedbackData.confidence || 5,
        strengths: Array.isArray(feedbackData.strengths) ? feedbackData.strengths : 
                  ["Shows enthusiasm for the role", "Demonstrates basic technical knowledge"],
        improvements: Array.isArray(feedbackData.improvements) ? feedbackData.improvements : 
                     ["Could provide more detailed examples", "Should focus on structured problem-solving"],
        detailedFeedback: feedbackData.detailedFeedback || 
                         "The interview shows potential but needs improvement in key areas. Consider practicing more technical questions and focusing on clear communication."
      };

      console.log("Returning fixed feedback data:", fixedFeedback);
      
      return new Response(
        JSON.stringify({ feedback: fixedFeedback }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log("Successfully generated feedback");
    
    return new Response(
      JSON.stringify({ 
        feedback: feedbackData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-interview-feedback function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
