import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create a content hash
function createContentHash(resumeContent: any, jobDescription: string = '', templateId: string = 'raw'): string {
  // Create a normalized string representation for consistent hashing
  const normalizedContent = JSON.stringify({
    resumeContent: resumeContent,
    jobDescription: jobDescription.trim().toLowerCase(),
    templateId: templateId
  }, Object.keys(resumeContent).sort()); // Sort keys for consistency
  
  // Simple hash function (in production, consider using crypto.subtle for SHA-256)
  let hash = 0;
  for (let i = 0; i < normalizedContent.length; i++) {
    const char = normalizedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resumeContent, jobDescription, resumeId, forceReAnalysis, templateId, isPublicUpload, isAutoAnalysis } = await req.json();

    if (!resumeContent) {
      return new Response(
        JSON.stringify({ error: 'Missing resume content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for caching
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create content hash for caching (include template info)
    const contentHash = createContentHash(resumeContent, jobDescription || '', templateId || 'raw');
    
    // Check if we have a cached analysis for this exact content (unless forced)
    if (!forceReAnalysis && resumeId && !isPublicUpload) {
      const { data: cachedResume } = await supabase
        .from('user_resumes')
        .select('ats_score, content')
        .eq('id', resumeId)
        .single();
      
      if (cachedResume && cachedResume.content) {
        // Check if the content has an existing analysis and the content hash matches
        const existingAnalysis = cachedResume.content.ats_analysis;
        if (existingAnalysis && existingAnalysis.content_hash === contentHash) {
          console.log('Returning cached ATS analysis for unchanged content');
          return new Response(
            JSON.stringify({
              score: existingAnalysis.score,
              feedback: existingAnalysis.feedback,
              keyword_matches: existingAnalysis.keyword_matches || [],
              missing_keywords: existingAnalysis.missing_keywords || [],
              formatting_issues: existingAnalysis.formatting_issues || [],
              improvement_suggestions: existingAnalysis.improvement_suggestions || [],
              detailed_assessment: existingAnalysis.detailed_assessment || {},
              keyword_match_percentage: existingAnalysis.keyword_match_percentage || 0,
              content_hash: existingAnalysis.content_hash,
              analyzed_at: existingAnalysis.analyzed_at,
              from_cache: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Convert resume content to a string representation for analysis
    const resumeText = convertResumeToText(resumeContent);

    // Determine if this is being analyzed with an ATS-optimized template
    const isATSOptimizedTemplate = templateId && 
      ['professional', 'standard', 'minimal', 'executive', 'technical', 'modern'].includes(templateId);
    
    // Enhanced prompt for OpenAI with template-aware analysis
    let prompt = `Analyze this resume for ATS compatibility across major Applicant Tracking Systems like Workday, Taleo, Lever, and Greenhouse. Provide a score from 0-100, where 100 is perfect ATS compatibility.`;
    
    if (isATSOptimizedTemplate) {
      prompt += `\n\nIMPORTANT: This resume is being rendered using an ATS-optimized template (${templateId}) that provides:
- Clean, professional formatting with proper section hierarchy
- Standard ATS-friendly fonts and spacing
- Consistent formatting that ATS systems can easily parse
- Proper section headings and organization
- No complex graphics or tables that confuse ATS systems
- Optimal whitespace and layout for scanning

Please account for these template formatting benefits in your analysis. The template automatically addresses many common formatting issues.`;
    }
    
    prompt += `\n\n**CRITICAL**: You MUST provide detailed assessment for ALL 7 categories below. Do not skip any category:

1. HARD SKILLS MATCH (0-40 points): Evaluate technical skills, programming languages, tools, and software mentioned. Compare against job requirements if provided.
   - REQUIRED: Provide hard_skills_score, hard_skills_feedback, and hard_skills_tips

2. JOB TITLE MATCH (0-15 points): Assess how well the candidate's current/target title aligns with the job posting and career progression.
   - REQUIRED: Provide job_title_score, job_title_feedback, and job_title_tips

3. SOFT SKILLS MATCH (0-15 points): Evaluate interpersonal skills, leadership abilities, communication skills, teamwork, problem-solving mentioned in the resume.
   - REQUIRED: Provide soft_skills_score, soft_skills_feedback, and soft_skills_tips

4. QUANTIFIED ACHIEVEMENTS (0-10 points): Check for measurable results, metrics, percentages, dollar amounts, timeframes, and specific accomplishments.
   - REQUIRED: Provide achievements_score, achievements_feedback, and achievements_tips

5. EDUCATION & CERTIFICATIONS (0-10 points): Assess educational background, relevant degrees, certifications, training, and professional development.
   - REQUIRED: Provide education_score, education_feedback, and education_tips

6. ATS FORMATTING (0-5 points): Evaluate technical formatting compatibility - section headings, bullet points, font consistency, no graphics/tables.
   - REQUIRED: Provide formatting_score, formatting_feedback, and formatting_tips

7. OVERALL RELEVANCE (0-5 points): General alignment with job requirements, industry standards, and career level appropriateness.
   - REQUIRED: Provide relevance_score, relevance_feedback, and relevance_tips

**MANDATORY REQUIREMENTS**:
- You MUST provide a score, feedback, and 2-3 improvement tips for EVERY single category above
- If a section seems perfect, still provide constructive feedback and tips for further enhancement
- If information is missing for a category, provide feedback about what's missing and tips to add it
- Do not leave any feedback or tips arrays empty

Additionally, provide general formatting issues and overall improvement suggestions.`;
    
    if (jobDescription) {
      prompt += `

Also analyze how well this resume matches the provided job description:
1. Identify exact keyword matches and semantic/similar concept matches
2. Highlight critical skills, qualifications, or requirements missing from the resume
3. Suggest specific content additions or modifications to better align with the job
4. Evaluate whether the resume's emphasis matches the job's priorities
5. Recommend which experiences should be expanded or condensed based on relevance
6. Identify any industry-specific terms from the job description that should be incorporated`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in ATS (Applicant Tracking System) analysis with deep knowledge of how modern ATS systems parse, rank, and filter resumes. Your expertise includes understanding keyword optimization, formatting best practices, industry standards, and how to maximize a resume\'s visibility and ranking in automated screening processes. Provide detailed, actionable feedback focused on practical improvements.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nResume:\n${resumeText}${jobDescription ? `\n\nJob Description:\n${jobDescription}` : ''}`
          }
        ],
        functions: [
          {
            name: "provide_ats_analysis",
            description: "Provide analysis of resume's ATS compatibility",
            parameters: {
              type: "object",
              properties: {
                score: {
                  type: "integer",
                  description: "ATS compatibility score from 0-100"
                },
                feedback: {
                  type: "string",
                  description: "Detailed feedback on the resume's ATS compatibility"
                },
                keyword_matches: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Keywords from the job description found in the resume"
                },
                missing_keywords: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Important keywords from the job description missing in the resume"
                },
                formatting_issues: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Any formatting issues that might affect ATS scanning"
                },
                improvement_suggestions: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  description: "Specific, actionable suggestions for improving ATS compatibility"
                },
                detailed_assessment: {
                  type: "object",
                  description: "REQUIRED: Detailed breakdown of assessment categories with specific feedback for ALL categories",
                  properties: {
                    hard_skills_score: {
                      type: "integer",
                      description: "Score for hard/technical skills match (0-40)"
                    },
                    hard_skills_feedback: {
                      type: "string",
                      description: "REQUIRED: Specific feedback about hard skills alignment"
                    },
                    hard_skills_tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "REQUIRED: 2-3 improvement tips for hard skills"
                    },
                    job_title_score: {
                      type: "integer", 
                      description: "Score for job title alignment (0-15)"
                    },
                    job_title_feedback: {
                      type: "string",
                      description: "REQUIRED: Specific feedback about job title alignment"
                    },
                    job_title_tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "REQUIRED: 2-3 improvement tips for job title alignment"
                    },
                    soft_skills_score: {
                      type: "integer",
                      description: "Score for soft skills presence (0-15)"
                    },
                    soft_skills_feedback: {
                      type: "string",
                      description: "REQUIRED: Specific feedback about soft skills"
                    },
                    soft_skills_tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "REQUIRED: 2-3 improvement tips for soft skills"
                    },
                    achievements_score: {
                      type: "integer",
                      description: "Score for quantified achievements (0-10)"
                    },
                    achievements_feedback: {
                      type: "string",
                      description: "REQUIRED: Specific feedback about quantified achievements"
                    },
                    achievements_tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "REQUIRED: 2-3 improvement tips for achievements"
                    },
                    education_score: {
                      type: "integer",
                      description: "Score for education and certifications (0-10)"
                    },
                    education_feedback: {
                      type: "string",
                      description: "REQUIRED: Specific feedback about education and certifications"
                    },
                    education_tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "REQUIRED: 2-3 improvement tips for education section"
                    },
                    formatting_score: {
                      type: "integer",
                      description: "Score for ATS-friendly formatting (0-5)"
                    },
                    formatting_feedback: {
                      type: "string",
                      description: "REQUIRED: Specific feedback about formatting"
                    },
                    formatting_tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "REQUIRED: 2-3 improvement tips for formatting"
                    },
                    relevance_score: {
                      type: "integer",
                      description: "Score for overall relevance (0-5)"
                    },
                    relevance_feedback: {
                      type: "string",
                      description: "REQUIRED: Specific feedback about overall relevance"
                    },
                    relevance_tips: {
                      type: "array",
                      items: { type: "string" },
                      description: "REQUIRED: 2-3 improvement tips for overall relevance"
                    }
                  },
                  required: [
                    "hard_skills_score", "hard_skills_feedback", "hard_skills_tips",
                    "job_title_score", "job_title_feedback", "job_title_tips", 
                    "soft_skills_score", "soft_skills_feedback", "soft_skills_tips",
                    "achievements_score", "achievements_feedback", "achievements_tips",
                    "education_score", "education_feedback", "education_tips",
                    "formatting_score", "formatting_feedback", "formatting_tips",
                    "relevance_score", "relevance_feedback", "relevance_tips"
                  ]
                },
                keyword_match_percentage: {
                  type: "integer",
                  description: "Percentage of important keywords matched (0-100)"
                }
              },
              required: ["score", "feedback"]
            }
          }
        ],
        function_call: {
          name: "provide_ats_analysis"
        }
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message?.function_call) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    const functionArgs = JSON.parse(data.choices[0].message.function_call.arguments);
    let score = functionArgs.score;
    const feedback = functionArgs.feedback;
    const keywordMatches = functionArgs.keyword_matches || [];
    const missingKeywords = functionArgs.missing_keywords || [];
    const formattingIssues = functionArgs.formatting_issues || [];
    const improvementSuggestions = functionArgs.improvement_suggestions || [];
    const detailedAssessment = functionArgs.detailed_assessment || {};
    const keywordMatchPercentage = functionArgs.keyword_match_percentage || Math.min(100, keywordMatches.length * 10);

    // Legitimate template benefits: ATS-optimized templates provide genuine formatting advantages
    // But scores should reflect actual content quality, not artificial inflation
    if (isATSOptimizedTemplate) {
      console.log(`Analysis performed with ATS-optimized template: ${templateId}`);
      // Template formatting benefits are already accounted for in the AI prompt
      // No artificial score manipulation needed
    }

    return new Response(
      JSON.stringify({
        score,
        feedback,
        keyword_matches: keywordMatches,
        missing_keywords: missingKeywords,
        formatting_issues: formattingIssues,
        improvement_suggestions: improvementSuggestions,
        detailed_assessment: detailedAssessment,
        keyword_match_percentage: keywordMatchPercentage,
        content_hash: contentHash,
        analyzed_at: new Date().toISOString(),
        from_cache: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ats-analysis function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to convert resume content to text representation
function convertResumeToText(resumeContent: any): string {
  const sections: string[] = [];
  
  // Contact Info
  if (resumeContent.contactInfo) {
    const contactInfo = resumeContent.contactInfo;
    sections.push("CONTACT INFORMATION:");
    sections.push(`Name: ${contactInfo.name || ''}`);
    sections.push(`Email: ${contactInfo.email || ''}`);
    if (contactInfo.phone) sections.push(`Phone: ${contactInfo.phone}`);
    if (contactInfo.location) sections.push(`Location: ${contactInfo.location}`);
    if (contactInfo.linkedin) sections.push(`LinkedIn: ${contactInfo.linkedin}`);
    if (contactInfo.website) sections.push(`Website: ${contactInfo.website}`);
    if (contactInfo.github) sections.push(`GitHub: ${contactInfo.github}`);
  }
  
  // Summary
  if (resumeContent.summary) {
    sections.push("\nSUMMARY:");
    sections.push(resumeContent.summary);
  }
  
  // Experience
  if (resumeContent.experience && resumeContent.experience.length > 0) {
    sections.push("\nEXPERIENCE:");
    resumeContent.experience.forEach((exp: any, index: number) => {
      sections.push(`${index + 1}. ${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
      if (exp.location) sections.push(`   Location: ${exp.location}`);
      if (exp.description) sections.push(`   ${exp.description}`);
      
      if (exp.achievements && exp.achievements.length > 0) {
        sections.push("   Achievements:");
        exp.achievements.forEach((achievement: string, i: number) => {
          if (achievement.trim()) sections.push(`   - ${achievement}`);
        });
      }
    });
  }
  
  // Education
  if (resumeContent.education && resumeContent.education.length > 0) {
    sections.push("\nEDUCATION:");
    resumeContent.education.forEach((edu: any, index: number) => {
      sections.push(`${index + 1}. ${edu.degree}${edu.field ? ` in ${edu.field}` : ''} from ${edu.institution} (${edu.startDate} - ${edu.endDate || 'Present'})`);
      if (edu.location) sections.push(`   Location: ${edu.location}`);
    });
  }
  
  // Skills
  if (resumeContent.skills && resumeContent.skills.length > 0) {
    sections.push("\nSKILLS:");
    sections.push(resumeContent.skills.filter((s: string) => s.trim()).join(", "));
  }
  
  // Certifications
  if (resumeContent.certifications && resumeContent.certifications.length > 0) {
    sections.push("\nCERTIFICATIONS:");
    resumeContent.certifications.forEach((cert: any, index: number) => {
      sections.push(`${index + 1}. ${cert.name}${cert.issuer ? ` from ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`);
    });
  }
  
  // Projects
  if (resumeContent.projects && resumeContent.projects.length > 0) {
    sections.push("\nPROJECTS:");
    resumeContent.projects.forEach((project: any, index: number) => {
      sections.push(`${index + 1}. ${project.name}`);
      if (project.description) sections.push(`   ${project.description}`);
      if (project.technologies && project.technologies.length > 0) {
        sections.push(`   Technologies: ${project.technologies.join(", ")}`);
      }
    });
  }
  
  return sections.join("\n");
}
