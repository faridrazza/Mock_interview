import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as mammoth from "https://esm.sh/mammoth@1.6.0";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@1.0.4";

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
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request based on content type
    const contentType = req.headers.get('content-type') || '';
    let resumeText = '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file');
      
      // Try to get job description from the form data
      const jobDescriptionField = formData.get('jobDescription');
      let jobDescriptionText = '';
      if (jobDescriptionField && typeof jobDescriptionField === 'string') {
        jobDescriptionText = jobDescriptionField;
      }
      
      if (!file || !(file instanceof File)) {
        return new Response(
          JSON.stringify({ error: 'No resume file provided' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const fileName = file.name.toLowerCase();
      
      // Extract text from the uploaded file based on its type
      if (fileName.endsWith('.pdf')) {
        // Handle PDF using unpdf for better complex layout extraction
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfData = new Uint8Array(arrayBuffer);
          
          // Use unpdf to extract text from the PDF
          const pdf = await getDocumentProxy(pdfData);
          const result = await extractText(pdf, { mergePages: true });
          resumeText = result.text;
          
          if (!resumeText || resumeText.trim() === '') {
            return new Response(
              JSON.stringify({ error: 'Could not extract text from PDF. Try uploading a DOCX file instead.' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError);
          return new Response(
            JSON.stringify({ error: 'Failed to parse PDF file. Please try uploading a DOCX file or paste your resume text directly.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        // Handle DOCX
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          resumeText = result.value;
          
          if (!resumeText || resumeText.trim() === '') {
            return new Response(
              JSON.stringify({ error: 'Could not extract text from the Word document' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (docError) {
          console.error('DOCX parsing error:', docError);
          return new Response(
            JSON.stringify({ error: 'Failed to parse Word document. Please ensure the file is not corrupted.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Unsupported file format. Please upload a PDF or DOCX file.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Handle direct text input
      try {
        const { resumeText: text } = await req.json();
        
        if (!text) {
          return new Response(
            JSON.stringify({ error: 'Missing resume text content' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        resumeText = text;
      } catch (jsonError) {
        console.error('JSON parsing error in request:', jsonError);
        return new Response(
          JSON.stringify({ error: 'Invalid JSON in request body' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Log the length of the extracted text for debugging
    console.log(`Extracted resume text length: ${resumeText.length} characters`);

    // Use OpenAI to extract structured data from the resume text
    try {
      // Check if job description is provided in the request
      let jobDescriptionText = '';
      try {
        const requestBody = await req.json();
        if (requestBody && requestBody.jobDescription) {
          jobDescriptionText = requestBody.jobDescription;
        }
      } catch (e) {
        // If parsing fails, assume no job description was provided
        console.log('No job description provided in request or not JSON format');
      }

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
              content: 'You are an expert at parsing and optimizing resume content into structured data. Extract the information from the provided resume text and organize it into sections. Focus on making the content ATS-friendly by using relevant keywords and standard formatting.'
            },
            {
              role: 'user',
              content: `Parse the following resume text into structured JSON format with the following sections: contactInfo (name, email, phone, location, linkedin, website, github), summary, experience (array of {company, position, startDate, endDate, location, description, achievements}), education (array of {institution, degree, field, startDate, endDate, location, gpa}), skills (array of strings), certifications (array of {name, issuer, date}), and projects (array of {name, description, startDate, endDate, technologies}).${jobDescriptionText ? '\n\nOptimize the content to match this job description:\n' + jobDescriptionText : ''}\n\nResume text:\n${resumeText}`
            }
          ],
          functions: [
            {
              name: "parse_resume",
              description: "Parse resume text into structured JSON",
              parameters: {
                type: "object",
                properties: {
                  contactInfo: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string" },
                      phone: { type: "string" },
                      location: { type: "string" },
                      linkedin: { type: "string" },
                      website: { type: "string" },
                      github: { type: "string" }
                    },
                    required: ["name", "email"]
                  },
                  summary: { type: "string" },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        company: { type: "string" },
                        position: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        location: { type: "string" },
                        description: { type: "string" },
                        achievements: {
                          type: "array",
                          items: { type: "string" }
                        }
                      },
                      required: ["company", "position", "startDate", "description"]
                    }
                  },
                  education: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        institution: { type: "string" },
                        degree: { type: "string" },
                        field: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        location: { type: "string" },
                        gpa: { type: "string" }
                      },
                      required: ["institution", "degree", "startDate"]
                    }
                  },
                  skills: {
                    type: "array",
                    items: { type: "string" }
                  },
                  certifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        issuer: { type: "string" },
                        date: { type: "string" }
                      },
                      required: ["name"]
                    }
                  },
                  projects: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        startDate: { type: "string" },
                        endDate: { type: "string" },
                        technologies: {
                          type: "array",
                          items: { type: "string" }
                        }
                      },
                      required: ["name", "description"]
                    }
                  }
                },
                required: ["contactInfo", "experience", "education", "skills"]
              }
            }
          ],
          function_call: {
            name: "parse_resume"
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message?.function_call) {
        throw new Error('Invalid response from OpenAI API');
      }
      
      // Get the arguments string from the function call
      const argumentsString = data.choices[0].message.function_call.arguments;
      console.log("Raw OpenAI arguments:", argumentsString);
      
      // Parse the JSON response with error handling
      let parsedResume;
      try {
        // Try regular parsing first
        parsedResume = JSON.parse(argumentsString);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        
        // Try to fix common JSON issues
        const fixedString = argumentsString
          .replace(/:\s*-(?!\d)/g, ': "_')  // Replace lone minus signs after colons
          .replace(/,\s*-(?!\d)/g, ', "_')  // Replace lone minus signs after commas
          .replace(/^\s*-(?!\d)/g, '"_')    // Replace lone minus signs at start
          .replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2') // Fix escape sequences
          .replace(/([^\\])\\\\n([^\\])/g, '$1\\n$2')  // Fix double escaped newlines
          .replace(/([^\\])\\\\t([^\\])/g, '$1\\t$2')  // Fix double escaped tabs
          .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
          .replace(/,\s*\]/g, ']') // Remove trailing commas in arrays
          .replace(/([^"])(\w+):/g, '$1"$2":') // Ensure property names are quoted
          .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes
        
        try {
          parsedResume = JSON.parse(fixedString);
        } catch (finalError) {
          console.error('Failed to parse fixed JSON:', finalError);
          throw new Error('Failed to process resume data. The AI returned an invalid response format.');
        }
      }

      return new Response(
        JSON.stringify({ 
          parsedResume,
          originalText: resumeText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openaiError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in parse-resume function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unknown error occurred',
        details: 'If uploading a PDF, try a different format like DOCX, or ensure your resume does not contain special formatting.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
