const { 
  ServicePrincipalCredentials,
  PDFServices, 
  MimeType, 
  ExtractPDFParams, 
  ExtractPDFJob,
  ExtractPDFResult,
  SDKError,
  ServiceUsageError,
  ServiceApiError 
} = require('@adobe/pdfservices-node-sdk');
const mammoth = require('mammoth');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// CORS headers for API Gateway
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async (event) => {
  console.log('Parse Resume Lambda started');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Validate environment variables
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const adobeClientId = process.env.ADOBE_CLIENT_ID;
    const adobeClientSecret = process.env.ADOBE_CLIENT_SECRET;
    
    console.log('Environment variables check:', {
      openAiApiKeyExists: !!openAiApiKey,
      adobeClientIdExists: !!adobeClientId,
      adobeClientSecretExists: !!adobeClientSecret,
      adobeClientIdLength: adobeClientId ? adobeClientId.length : 0,
      adobeClientSecretLength: adobeClientSecret ? adobeClientSecret.length : 0
    });
    
    if (!openAiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }
    
    if (!adobeClientId || !adobeClientSecret) {
      throw new Error(`Adobe PDF Services credentials are not configured. ClientId: ${!!adobeClientId}, ClientSecret: ${!!adobeClientSecret}`);
    }

    // Parse the multipart form data or JSON body
    let resumeText = '';
    let jobDescriptionText = '';
    let fileName = '';
    
    // Check if this is a multipart form data request (file upload)
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data
      const result = parseMultipartFormData(event.body, contentType);
      
      if (!result.file) {
        return createErrorResponse('No resume file provided', 400);
      }
      
      fileName = result.fileName;
      jobDescriptionText = result.jobDescription || '';
      
      // Process the file based on its type
      const fileExtension = fileName.toLowerCase().split('.').pop();
      
      if (fileExtension === 'pdf') {
        resumeText = await extractTextFromPDF(result.file, adobeClientId, adobeClientSecret);
      } else if (['docx', 'doc'].includes(fileExtension)) {
        resumeText = await extractTextFromDOCX(result.file);
      } else {
        return createErrorResponse('Unsupported file format. Please upload a PDF or DOCX file.', 400);
      }
    } else {
      // Handle direct JSON input
      try {
        const body = JSON.parse(event.body);
        resumeText = body.resumeText;
        jobDescriptionText = body.jobDescription || '';
        
        if (!resumeText) {
          return createErrorResponse('Missing resume text content', 400);
        }
      } catch (error) {
        return createErrorResponse('Invalid JSON in request body', 400);
      }
    }

    if (!resumeText || resumeText.trim() === '') {
      return createErrorResponse('Could not extract text from the uploaded file', 400);
    }

    console.log(`Extracted resume text length: ${resumeText.length} characters`);

    // Use OpenAI to extract structured data from the resume text
    const structuredResume = await extractStructuredData(resumeText, jobDescriptionText, openAiApiKey);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parsedResume: structuredResume,
        originalText: resumeText
      })
    };

  } catch (error) {
    console.error('Error in parse-resume function:', error);
    
    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific Adobe PDF Services errors
    if (error instanceof ServiceUsageError || error instanceof ServiceApiError) {
      errorMessage = 'PDF processing service error. Please try again or use a different file format.';
      statusCode = 503;
    } else if (error instanceof SDKError) {
      errorMessage = 'PDF processing failed. Please ensure your file is not corrupted.';
      statusCode = 400;
    }
    
    return createErrorResponse(errorMessage, statusCode);
  }
};

// Helper function to extract text from PDF using Adobe PDF Services API
async function extractTextFromPDF(fileBuffer, clientId, clientSecret) {
  const tempDir = `/tmp/${uuidv4()}`;
  await fs.ensureDir(tempDir);
  
  try {
    // Write the PDF buffer to a temporary file
    const inputFilePath = path.join(tempDir, 'input.pdf');
    await fs.writeFile(inputFilePath, fileBuffer);
    
    // Initialize Adobe PDF Services SDK with ServicePrincipalCredentials
    const credentials = new ServicePrincipalCredentials({
      clientId: clientId,
      clientSecret: clientSecret
    });
    
    console.log('Adobe credentials check:', {
      clientIdLength: clientId ? clientId.length : 0,
      clientSecretLength: clientSecret ? clientSecret.length : 0,
      clientIdPrefix: clientId ? clientId.substring(0, 8) + '...' : 'undefined',
      clientSecretPrefix: clientSecret ? clientSecret.substring(0, 8) + '...' : 'undefined'
    });
    
    // Create PDFServices instance
    const pdfServices = new PDFServices({ credentials });
    
    // Create parameters for the job
    const params = new ExtractPDFParams({
      elementsToExtract: ['text', 'tables'],
      elementsToExtractRenditions: ['tables'],
      getCharBounds: false,
      includeStyling: true
    });
    
    // Creates a new job instance
    const job = new ExtractPDFJob({ 
      inputAsset: await pdfServices.upload({
        readStream: fs.createReadStream(inputFilePath),
        mimeType: MimeType.PDF
      }),
      params 
    });
    
    // Submit the job and get the job result
    const pollingURL = await pdfServices.submit({ job });
    const pdfServicesResponse = await pdfServices.getJobResult({
      pollingURL,
      resultType: ExtractPDFResult
    });
    
    // Get content from the resulting asset(s)
    const resultAsset = pdfServicesResponse.result.resource;
    const streamAsset = await pdfServices.getContent({ asset: resultAsset });
    
    // Save the result to a temporary file
    const outputFilePath = path.join(tempDir, 'output.zip');
    const writeStream = fs.createWriteStream(outputFilePath);
    streamAsset.readStream.pipe(writeStream);
    
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Extract and parse the JSON from the zip file
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(outputFilePath);
    const zipEntries = zip.getEntries();
    
    let extractedText = '';
    
    // Find the JSON file in the zip
    const jsonEntry = zipEntries.find(entry => entry.entryName.endsWith('.json'));
    if (jsonEntry) {
      const jsonContent = JSON.parse(jsonEntry.getData().toString('utf8'));
      
      // Extract text from the JSON structure
      if (jsonContent.elements) {
        extractedText = extractTextFromAdobeJSON(jsonContent);
      }
    }
    
    if (!extractedText || extractedText.trim() === '') {
      throw new Error('No text could be extracted from the PDF');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('Adobe PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  } finally {
    // Clean up temporary files
    try {
      await fs.remove(tempDir);
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary files:', cleanupError);
    }
  }
}

// Helper function to extract text from Adobe JSON response
function extractTextFromAdobeJSON(jsonContent) {
  let text = '';
  
  if (jsonContent.elements) {
    // Sort elements by their bounds (top to bottom, left to right)
    const sortedElements = jsonContent.elements.sort((a, b) => {
      if (a.Bounds && b.Bounds) {
        // Sort by Y position first (top to bottom)
        if (Math.abs(a.Bounds[1] - b.Bounds[1]) > 5) {
          return a.Bounds[1] - b.Bounds[1];
        }
        // Then by X position (left to right)
        return a.Bounds[0] - b.Bounds[0];
      }
      return 0;
    });
    
    for (const element of sortedElements) {
      if (element.Text) {
        text += element.Text + ' ';
      }
      
      // Handle tables
      if (element.Table && element.Table.TBody) {
        for (const row of element.Table.TBody) {
          for (const cell of row.TD) {
            if (cell.Text) {
              text += cell.Text + ' ';
            }
          }
          text += '\n';
        }
      }
      
      // Add line breaks for different element types
      if (element.Path === 'P' || element.Path === 'H1' || element.Path === 'H2' || element.Path === 'H3') {
        text += '\n';
      }
    }
  }
  
  return text.trim();
}

// Helper function to extract text from DOCX using mammoth
async function extractTextFromDOCX(fileBuffer) {
  try {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    
    if (!result.value || result.value.trim() === '') {
      throw new Error('No text could be extracted from the Word document');
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
}

// Helper function to extract structured data using OpenAI
async function extractStructuredData(resumeText, jobDescription, openAiApiKey) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at parsing and optimizing resume content into structured data. Extract the information from the provided resume text and organize it into sections. Focus on making the content ATS-friendly by using relevant keywords and standard formatting.'
        },
        {
          role: 'user',
          content: `Parse the following resume text into structured JSON format with the following sections: contactInfo (name, email, phone, location, linkedin, website, github), summary, experience (array of {company, position, startDate, endDate, location, description, achievements}), education (array of {institution, degree, field, startDate, endDate, location, gpa}), skills (array of strings), certifications (array of {name, issuer, date}), and projects (array of {name, description, startDate, endDate, technologies}).${jobDescription ? '\n\nOptimize the content to match this job description:\n' + jobDescription : ''}\n\nResume text:\n${resumeText}`
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
    }, {
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message?.function_call) {
      throw new Error('Invalid response from OpenAI API');
    }
    
    // Get the arguments string from the function call
    const argumentsString = response.data.choices[0].message.function_call.arguments;
    console.log("Raw OpenAI arguments:", argumentsString);
    
    // Parse the JSON response with error handling
    let parsedResume;
    try {
      parsedResume = JSON.parse(argumentsString);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      
      // Try to fix common JSON issues
      const fixedString = argumentsString
        .replace(/:\s*-(?!\d)/g, ': "_"')
        .replace(/,\s*-(?!\d)/g, ', "_"')
        .replace(/^\s*-(?!\d)/g, '"_"')
        .replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1\\\\$2')
        .replace(/([^\\])\\\\n([^\\])/g, '$1\\n$2')
        .replace(/([^\\])\\\\t([^\\])/g, '$1\\t$2')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*\]/g, ']')
        .replace(/([^"])(\w+):/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ': "$1"');
      
      try {
        parsedResume = JSON.parse(fixedString);
      } catch (finalError) {
        console.error('Failed to parse fixed JSON:', finalError);
        throw new Error('Failed to process resume data. The AI returned an invalid response format.');
      }
    }
    
    return parsedResume;
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.data.error?.message || 'Unknown error'}`);
    }
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

// Helper function to parse multipart form data
function parseMultipartFormData(body, contentType) {
  console.log('Parsing multipart form data...');
  console.log('Content-Type:', contentType);
  console.log('Body type:', typeof body);
  console.log('Body length:', body ? body.length : 'null');
  
  // Extract boundary from content type
  const boundaryMatch = contentType.match(/boundary=(.+)/);
  if (!boundaryMatch) {
    throw new Error('No boundary found in multipart form data');
  }
  
  const boundary = boundaryMatch[1].replace(/['"]/g, ''); // Remove quotes if present
  console.log('Boundary:', boundary);
  
  // Handle both base64 encoded and raw binary data
  let bodyBuffer;
  if (typeof body === 'string') {
    // API Gateway sends base64 encoded data for binary content
    bodyBuffer = Buffer.from(body, 'base64');
  } else {
    bodyBuffer = Buffer.from(body);
  }
  
  console.log('Body buffer length:', bodyBuffer.length);
  
  // Convert to string for processing, but keep original buffer for file data
  const bodyString = bodyBuffer.toString('binary');
  const boundaryString = `--${boundary}`;
  
  // Split by boundary
  const parts = bodyString.split(boundaryString);
  console.log('Number of parts found:', parts.length);
  
  let file = null;
  let fileName = '';
  let jobDescription = '';
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (part.includes('Content-Disposition: form-data')) {
      console.log(`Processing part ${i}:`, part.substring(0, 200) + '...');
      
      // Split part into headers and content
      const headerEndIndex = part.indexOf('\r\n\r\n');
      if (headerEndIndex === -1) continue;
      
      const headers = part.substring(0, headerEndIndex);
      const content = part.substring(headerEndIndex + 4);
      
      // Parse Content-Disposition header
      const dispositionMatch = headers.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/);
      if (!dispositionMatch) continue;
      
      const fieldName = dispositionMatch[1];
      const fieldFileName = dispositionMatch[2];
      
      console.log('Field name:', fieldName);
      console.log('Field filename:', fieldFileName);
      
      if (fieldName === 'file' && fieldFileName) {
        fileName = fieldFileName;
        
        // Extract file content as binary buffer
        // Find the actual start and end of file content
        const contentStartIndex = bodyString.indexOf('\r\n\r\n', bodyString.indexOf(headers)) + 4;
        const nextBoundaryIndex = bodyString.indexOf(boundaryString, contentStartIndex);
        
        if (contentStartIndex !== -1 && nextBoundaryIndex !== -1) {
          // Extract the exact file bytes
          const fileStartByte = contentStartIndex;
          const fileEndByte = nextBoundaryIndex - 2; // Remove \r\n before boundary
          
          file = bodyBuffer.slice(fileStartByte, fileEndByte);
          console.log('File extracted, size:', file.length, 'bytes');
        }
      } else if (fieldName === 'jobDescription') {
        // Clean up job description content
        jobDescription = content.replace(/\r\n--.*$/, '').trim();
        console.log('Job description extracted:', jobDescription.substring(0, 100) + '...');
      }
    }
  }
  
  console.log('Parse result - fileName:', fileName, 'fileSize:', file ? file.length : 0, 'jobDescLength:', jobDescription.length);
  
  return { file, fileName, jobDescription };
}

// Helper function to create error response
function createErrorResponse(message, statusCode = 500) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      error: message,
      details: statusCode === 400 ? 'If uploading a PDF, try a different format like DOCX, or ensure your resume does not contain special formatting.' : undefined
    })
  };
} 