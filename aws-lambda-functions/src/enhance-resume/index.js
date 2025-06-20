const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Define types to match client-side types
function validateExperienceEntries(experiences) {
  if (!Array.isArray(experiences)) {
    console.error("Experience data is not an array:", experiences);
    return [];
  }

  return experiences.map(exp => ({
    company: exp.company || '',
    position: exp.position || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    location: exp.location || '',
    description: exp.description || '',
    achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
    ...(exp.current !== undefined ? { current: !!exp.current } : {})
  }));
}

function validateProjectEntries(projects) {
  if (!Array.isArray(projects)) {
    console.error("Project data is not an array:", projects);
    return [];
  }

  return projects.map(project => ({
    name: project.name || '',
    description: project.description || '',
    startDate: project.startDate || '',
    endDate: project.endDate || '',
    url: project.url || '',
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    achievements: Array.isArray(project.achievements) ? project.achievements : []
  }));
}

exports.handler = async (event) => {
  console.log('Enhance Resume Lambda triggered:', event.httpMethod);
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    console.log("Enhance resume function called");
    
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'OpenAI API key is not configured' })
      };
    }

    const requestBody = JSON.parse(event.body);
    console.log("Request body received:", {
      sectionType: requestBody.sectionType,
      resumeContentType: requestBody.resumeContent ? (Array.isArray(requestBody.resumeContent) ? "Array" : typeof requestBody.resumeContent) : "undefined",
      resumeContentLength: requestBody.resumeContent && Array.isArray(requestBody.resumeContent) ? requestBody.resumeContent.length : "N/A",
      hasJobDescription: !!requestBody.jobDescription,
      hasTargetRole: !!requestBody.targetRole
    });

    const { resumeContent, sectionType, jobDescription, targetRole } = requestBody;

    if (!resumeContent || !sectionType) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Define the prompt based on section type
    let prompt = '';
    let content = '';
    
    // Include target role context if available
    const roleContext = targetRole ? ` for a ${targetRole} position` : '';
    
    // Validate and format input content
    switch (sectionType) {
      case 'summary':
        prompt = `Create a compelling professional summary that follows these specific guidelines:

WRITING STYLE:
- Write in first person (no "I" needed) with confident, active voice
- Use specific, concrete language rather than generic buzzwords
- Keep sentences concise but impactful (2-4 sentences total)
- Sound professional yet conversational, like a skilled professional describing themselves

CONTENT REQUIREMENTS:
- Start with your current role or expertise area
- Highlight 2-3 specific, quantifiable achievements or skills
- Include relevant keywords naturally (no keyword stuffing)
- End with your career goal or value proposition

AVOID:
- Generic phrases like "results-driven," "team player," "go-getter"
- Overly complex jargon or buzzwords
- Vague statements without specifics
- Passive voice or weak language

${jobDescription ? `JOB-SPECIFIC FOCUS: Tailor the summary to highlight experiences and skills that directly match this job description: ${jobDescription}` : ''}

Current summary to enhance: "${content}"`;
        content = typeof resumeContent === 'string' ? resumeContent : '';
        break;
      case 'all':
        // Special mode to enhance entire resume based on ATS suggestions
        console.log("Processing all sections based on ATS suggestions");
        
        const improvement_suggestions = requestBody.improvement_suggestions || [];
        const missing_keywords = requestBody.missing_keywords || [];
        
        console.log("Suggestions and keywords data:", { 
          improvement_suggestions_count: improvement_suggestions.length,
          missing_keywords_count: missing_keywords.length,
          first_suggestion: improvement_suggestions[0] || 'none',
          first_keyword: missing_keywords[0] || 'none'
        });
        
        if (improvement_suggestions.length === 0 && missing_keywords.length === 0) {
          console.error("No improvement suggestions or missing keywords provided");
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'No improvement suggestions or missing keywords provided' })
          };
        }
        
        // Create a comprehensive prompt that includes all ATS suggestions
        prompt = `Enhance this entire resume to improve its ATS compatibility${roleContext}. Follow these specific guidelines:

ENHANCEMENT STRATEGY:
- Integrate improvements naturally throughout the resume
- Add missing keywords only where they fit organically
- Maintain the authentic voice and personal achievements
- Preserve all factual information and dates
- Keep the same overall structure and format

SPECIFIC IMPROVEMENTS TO IMPLEMENT:\n`;
        
        if (improvement_suggestions.length > 0) {
          prompt += "PRIORITY CHANGES:\n";
          improvement_suggestions.forEach((suggestion, index) => {
            prompt += `${index + 1}. ${suggestion}\n`;
          });
          prompt += "\n";
        }
        
        if (missing_keywords.length > 0) {
          prompt += "KEYWORDS TO INTEGRATE NATURALLY:\n";
          missing_keywords.forEach((keyword, index) => {
            prompt += `${index + 1}. ${keyword}\n`;
          });
          prompt += "\n";
        }
        
        if (jobDescription) {
          prompt += `TARGET JOB CONTEXT: ${jobDescription}\n\n`;
        }
        
        prompt += `CRITICAL REQUIREMENTS:
- Return the EXACT same JSON structure as provided
- Keep all existing sections and fields intact
- Make changes subtle and natural, not obvious
- Maintain professional, human-sounding language
- Do not add skills or experiences that weren't there originally
- Focus on rewording and restructuring existing content`;
        
        // Convert the entire resume content to JSON string
        content = JSON.stringify(resumeContent);
        break;
      case 'experience':
        prompt = `Enhance these work experience entries following these specific guidelines:

WRITING APPROACH:
- Use strong action verbs to start each bullet point
- Focus on achievements and outcomes, not just responsibilities
- Include specific metrics, percentages, or numbers when possible
- Write in past tense for completed roles, present tense for current role
- Each bullet should tell a mini-story of impact

CONTENT STRUCTURE:
- Company and position titles remain unchanged
- Improve job descriptions to be more compelling and specific
- Transform achievements into quantified results
- Use industry-relevant terminology naturally
- Remove generic, overused phrases

ACHIEVEMENT FORMULA:
- Action verb + specific task + measurable result
- Example: "Implemented automated testing framework, reducing bug reports by 40%"
- Example: "Led cross-functional team of 8 to deliver product launch 2 weeks ahead of schedule"

AVOID:
- Generic responsibilities like "responsible for," "worked on," "helped with"
- Overused action words like "managed," "handled," "coordinated" (unless specific)
- Bullet points without clear outcomes or impact
- Technical jargon that doesn't add value

${jobDescription ? `JOB-SPECIFIC FOCUS: Highlight experiences and skills that directly align with this target role: ${jobDescription}` : ''}

Experience entries to enhance:`;
        
        // Validate that resumeContent is an array before processing
        if (!Array.isArray(resumeContent)) {
          console.error("Invalid experience format:", resumeContent);
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Experience data must be an array' })
          };
        }
        
        const validatedExperience = validateExperienceEntries(resumeContent);
        content = JSON.stringify(validatedExperience);
        break;
      case 'projects':
        prompt = `Enhance these project descriptions following these specific guidelines:

PROJECT DESCRIPTION STRATEGY:
- Start with the project's purpose and your role
- Highlight technical challenges solved and methods used
- Quantify the impact or results whenever possible
- Show collaboration and leadership aspects
- Connect to relevant business or user outcomes

TECHNICAL DETAILS:
- Mention specific technologies, frameworks, and tools used
- Describe architecture decisions or methodologies applied
- Include scale indicators (users, data volume, performance metrics)
- Highlight any innovative or advanced techniques employed

IMPACT METRICS:
- User engagement improvements (% increases, user counts)
- Performance enhancements (speed improvements, efficiency gains)
- Business impact (cost savings, revenue generation, time saved)
- Technical achievements (code quality, scalability, maintainability)

STRUCTURE EACH PROJECT:
1. Brief, compelling description of what you built and why
2. Key technologies and methodologies used
3. Specific challenges overcome and solutions implemented
4. Measurable outcomes and impact

AVOID:
- Generic statements like "built a web application"
- Lists of technologies without context
- Descriptions without outcomes or learnings
- Overly technical jargon without business context

${jobDescription ? `TARGET ROLE ALIGNMENT: Emphasize projects and technologies that align with this job description: ${jobDescription}` : ''}

Projects to enhance:`;
        
        console.log("Processing projects section");
        
        // Validate that resumeContent is an array before processing
        if (!Array.isArray(resumeContent)) {
          console.error("Invalid projects format:", resumeContent);
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Projects data must be an array' })
          };
        }
        
        console.log("Raw projects data:", resumeContent);
        const validatedProjects = validateProjectEntries(resumeContent);
        console.log("Validated projects data:", validatedProjects);
        content = JSON.stringify(validatedProjects);
        break;
      case 'skills':
        prompt = `Enhance and organize this skills list following these guidelines:

ORGANIZATION STRATEGY:
- Group similar skills together logically
- Prioritize the most relevant and in-demand skills first
- Use current, industry-standard terminology
- Include both technical and soft skills where appropriate
- Remove outdated or less relevant skills

SKILL PRESENTATION:
- Use specific technology names and versions when relevant
- Include proficiency levels only if they add value
- Focus on skills that differentiate you in the market
- Ensure skills match your experience level realistically

PRIORITIZATION:
1. Core technical skills most relevant to your target role
2. Supporting technologies and frameworks
3. Methodology and process skills
4. Soft skills that complement technical abilities

${jobDescription ? `JOB-SPECIFIC FOCUS: Prioritize skills that directly match this job description: ${jobDescription}` : ''}

Current skills to enhance:`;
        
        if (!Array.isArray(resumeContent)) {
          console.error("Invalid skills format:", resumeContent);
          return {
            statusCode: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Skills data must be an array' })
          };
        }
        
        content = resumeContent.join(', ');
        break;
      default:
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid section type' })
        };
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: sectionType === 'all' 
            ? `You are an expert resume writer specializing in ATS optimization. Your task is to enhance an entire resume to improve its ATS compatibility by implementing specific suggestions and incorporating missing keywords. When returning the enhanced resume, ALWAYS maintain the exact same JSON structure as the original, with all the same fields and object structure. Return ONLY the complete JSON object with all sections of the resume enhanced according to the provided suggestions.`
            : `You are an expert resume writer with 10+ years of experience helping professionals land their dream jobs. Your expertise includes:

WRITING PHILOSOPHY:
- Create content that passes ATS systems while remaining genuinely human and engaging
- Avoid corporate buzzwords and generic language that makes resumes sound robotic
- Focus on specific, measurable achievements that tell a compelling professional story
- Use natural, confident language that reflects how skilled professionals actually communicate

OUTPUT REQUIREMENTS:
- Return content in the exact format requested (JSON structure for arrays, plain text for summaries)
- Ensure all technical details and factual information remain accurate
- Write in a style that sounds authentic and professional, not artificially generated
- Balance ATS optimization with genuine human appeal

Your goal is to make the resume content more compelling and effective while maintaining its authenticity and professional credibility.`
        },
        {
          role: 'user',
          content: `${prompt}\n\nCurrent content to enhance:\n${content}\n\nIMPORTANT: Your response should sound like it was written by the actual professional, not by AI. Avoid phrases that sound artificial or overly promotional. Focus on concrete, specific details that demonstrate real expertise and impact.`
        }
      ],
    });
    
    if (!response.choices || !response.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    const enhancedContent = response.choices[0].message.content;
    
    // Process the enhanced content based on section type
    let processedContent;
    
    switch (sectionType) {
      case 'summary':
        processedContent = enhancedContent.trim();
        break;
      case 'all':
        // Process full resume enhancement
        try {
          console.log("Processing full resume enhancement response");
          
          // Check if the response contains a valid JSON object/array
          const jsonMatches = enhancedContent.match(/\{[\s\S]*\}/);
          if (jsonMatches && jsonMatches[0]) {
            console.log("Found JSON object in response");
            try {
              // Parse the JSON and validate it has the expected structure
              const enhancedResume = JSON.parse(jsonMatches[0]);
              console.log("Successfully parsed enhanced resume");
              
              // Ensure the enhanced resume has all the required sections
              if (!enhancedResume.contactInfo || !enhancedResume.summary) {
                console.error("Enhanced resume is missing required sections");
                throw new Error("Enhanced resume missing required sections");
              }
              
              // Process each section to ensure valid structure
              const processedResume = {
                contactInfo: enhancedResume.contactInfo || resumeContent.contactInfo,
                summary: enhancedResume.summary || resumeContent.summary || '',
                experience: enhancedResume.experience ? validateExperienceEntries(enhancedResume.experience) : resumeContent.experience || [],
                education: enhancedResume.education || resumeContent.education || [],
                skills: enhancedResume.skills || resumeContent.skills || [],
                certifications: enhancedResume.certifications || resumeContent.certifications || [],
                projects: enhancedResume.projects ? validateProjectEntries(enhancedResume.projects) : resumeContent.projects || [],
                ats_analysis: resumeContent.ats_analysis // Preserve existing ATS analysis
              };
              
              processedContent = processedResume;
              console.log("Successfully processed enhanced resume");
            } catch (jsonError) {
              console.error('Error parsing enhanced resume:', jsonError);
              
              // If parsing fails, return the original content
              processedContent = resumeContent;
            }
          } else {
            console.log("No JSON object found in response, returning original content");
            processedContent = resumeContent;
          }
        } catch (e) {
          console.error('Error processing enhanced resume:', e);
          // Ensure we return valid content even if processing fails
          processedContent = resumeContent;
        }
        break;
      case 'experience':
        try {
          // First try to detect JSON in the response
          const jsonMatches = enhancedContent.match(/\[[\s\S]*\]/);
          if (jsonMatches && jsonMatches[0]) {
            // Found JSON array
            try {
              const parsedExperience = JSON.parse(jsonMatches[0]);
              // Validate the structure of experience entries
              processedContent = validateExperienceEntries(parsedExperience);
            } catch (jsonError) {
              console.error('Error parsing JSON experience array:', jsonError);
              // Fallback: try to parse individual experience objects
              const experienceMatches = enhancedContent.match(/\{[\s\S]*?\}/g);
              if (experienceMatches) {
                const parsedEntries = [];
                for (const match of experienceMatches) {
                  try {
                    parsedEntries.push(JSON.parse(match));
                  } catch (err) {
                    console.error('Error parsing experience entry:', err);
                  }
                }
                processedContent = validateExperienceEntries(parsedEntries);
              } else {
                // If all parsing fails, return the original content
                processedContent = validateExperienceEntries(Array.isArray(resumeContent) ? resumeContent : []);
              }
            }
          } else {
            // No JSON array found, try to parse individual experience objects
            const experienceMatches = enhancedContent.match(/\{[\s\S]*?\}/g);
            if (experienceMatches) {
              const parsedEntries = [];
              for (const match of experienceMatches) {
                try {
                  parsedEntries.push(JSON.parse(match));
                } catch (err) {
                  console.error('Error parsing experience entry:', err);
                }
              }
              processedContent = validateExperienceEntries(parsedEntries);
            } else {
              // If all parsing fails, return the original content
              processedContent = validateExperienceEntries(Array.isArray(resumeContent) ? resumeContent : []);
            }
          }
        } catch (e) {
          console.error('Error processing experience content:', e);
          // Ensure we always return a valid array
          processedContent = validateExperienceEntries(Array.isArray(resumeContent) ? resumeContent : []);
        }
        break;
      case 'projects':
        try {
          console.log("Processing projects response from OpenAI");
          console.log("Raw enhanced content:", enhancedContent);
          
          // First try to detect JSON in the response
          const jsonMatches = enhancedContent.match(/\[[\s\S]*\]/);
          if (jsonMatches && jsonMatches[0]) {
            console.log("Found JSON array pattern in response");
            // Found JSON array
            try {
              const parsedProjects = JSON.parse(jsonMatches[0]);
              console.log("Successfully parsed JSON array:", parsedProjects);
              // Validate the structure of project entries
              processedContent = validateProjectEntries(parsedProjects);
              console.log("Validated projects after parsing:", processedContent);
            } catch (jsonError) {
              console.error('Error parsing JSON projects array:', jsonError);
              // Fallback: try to parse individual project objects
              const projectMatches = enhancedContent.match(/\{[\s\S]*?\}/g);
              if (projectMatches) {
                console.log("Found individual JSON objects:", projectMatches.length);
                const parsedEntries = [];
                for (const match of projectMatches) {
                  try {
                    parsedEntries.push(JSON.parse(match));
                  } catch (err) {
                    console.error('Error parsing project entry:', err);
                  }
                }
                processedContent = validateProjectEntries(parsedEntries);
                console.log("Validated projects from individual objects:", processedContent);
              } else {
                console.log("No JSON objects found, returning original content");
                // If all parsing fails, return the original content
                processedContent = validateProjectEntries(Array.isArray(resumeContent) ? resumeContent : []);
              }
            }
          } else {
            console.log("No JSON array pattern found, looking for individual objects");
            // No JSON array found, try to parse individual project objects
            const projectMatches = enhancedContent.match(/\{[\s\S]*?\}/g);
            if (projectMatches) {
              console.log("Found individual JSON objects:", projectMatches.length);
              const parsedEntries = [];
              for (const match of projectMatches) {
                try {
                  parsedEntries.push(JSON.parse(match));
                } catch (err) {
                  console.error('Error parsing project entry:', err);
                }
              }
              processedContent = validateProjectEntries(parsedEntries);
              console.log("Validated projects from individual objects:", processedContent);
            } else {
              console.log("No JSON objects found, returning original content");
              // If all parsing fails, return the original content
              processedContent = validateProjectEntries(Array.isArray(resumeContent) ? resumeContent : []);
            }
          }
        } catch (e) {
          console.error('Error processing projects content:', e);
          // Ensure we always return a valid array
          processedContent = validateProjectEntries(Array.isArray(resumeContent) ? resumeContent : []);
        }
        break;
      case 'skills':
        processedContent = enhancedContent.split(',').map(skill => skill.trim());
        break;
      default:
        processedContent = enhancedContent.trim();
    }

    // Final logging before returning response
    console.log(`Returning enhanced ${sectionType} content, type: ${typeof processedContent}, isArray: ${Array.isArray(processedContent)}, length: ${Array.isArray(processedContent) ? processedContent.length : 'N/A'}`);
    
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enhanced: processedContent })
    };

  } catch (error) {
    console.error('Error in enhance-resume function:', error);
    
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Unknown error occurred' })
    };
  }
}; 