const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * AWS Lambda function for speech-to-text conversion using OpenAI Whisper
 * Replaced Amazon Transcribe with OpenAI Whisper for better accuracy and simplicity
 * 
 * This function provides:
 * - Real-time speech-to-text with OpenAI Whisper
 * - Direct base64 audio processing (no S3 required)
 * - Robust error handling and logging
 * - Cost-effective OpenAI Whisper solution
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Process base64 audio in chunks to prevent memory issues
 * Adapted from Supabase implementation for Node.js
 * @param {string} base64String - Base64 encoded audio data
 * @param {number} chunkSize - Size of each chunk to process
 * @returns {Buffer} - Audio buffer
 */
function processBase64Chunks(base64String, chunkSize = 32768) {
  try {
    if (!base64String || typeof base64String !== 'string') {
      throw new Error('Invalid base64 string provided');
    }
    
    // Clean the base64 string (remove data URL prefix if present)
    let cleanBase64 = base64String;
    if (base64String.includes(',')) {
      cleanBase64 = base64String.split(',')[1];
    }
    
    // Remove whitespace
    cleanBase64 = cleanBase64.replace(/\s/g, '');
    
    // Add padding if necessary
    while (cleanBase64.length % 4 !== 0) {
      cleanBase64 += '=';
    }
    
    const chunks = [];
    let position = 0;
    
    while (position < cleanBase64.length) {
      const chunk = cleanBase64.slice(position, position + chunkSize);
      const binaryChunk = Buffer.from(chunk, 'base64');
      chunks.push(binaryChunk);
      position += chunkSize;
    }
    
    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = Buffer.alloc(totalLength);
    let offset = 0;
    
    for (const chunk of chunks) {
      chunk.copy(result, offset);
      offset += chunk.length;
    }
    
    if (result.length === 0) {
      throw new Error('Processed audio data is empty');
    }
    
    return result;
  } catch (error) {
    console.error('Base64 processing error:', error);
    throw new Error(`Failed to process audio data: ${error.message}`);
  }
}

/**
 * Call OpenAI Whisper API for speech-to-text conversion
 * @param {Buffer} audioBuffer - Audio data as buffer
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeWithWhisper(audioBuffer) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Create form data for OpenAI API
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('model', 'whisper-1');
    
    console.log(`Sending ${audioBuffer.length} bytes to OpenAI Whisper API`);
    
    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      // Provide specific error messages based on status codes
      if (response.status === 400) {
        throw new Error('Audio format not supported. Please try recording again.');
      } else if (response.status === 413) {
        throw new Error('Audio file too large. Please record a shorter message.');
      } else if (response.status === 429) {
        throw new Error('Service temporarily busy. Please try again in a moment.');
      } else if (response.status === 401) {
        throw new Error('Authentication error. Please try again.');
      } else {
        throw new Error(`OpenAI API error: ${errorText}`);
      }
    }
    
    const result = await response.json();
    console.log('OpenAI Whisper transcription successful');
    
    if (!result.text || !result.text.trim()) {
      throw new Error('No speech detected in audio recording');
    }
    
    return result.text.trim();
    
  } catch (error) {
    console.error('Error in OpenAI Whisper transcription:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  console.log('OpenAI Whisper speech-to-text request received');
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: 'ok'
    };
  }

  try {
    // Validate environment variables
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Server configuration error: OpenAI API key not configured',
          provider: 'openai-whisper',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Parse request body
    let body;
    try {
      if (!event.body) {
        throw new Error('No request body provided');
      }
      
      let rawBody = event.body;
      if (event.isBase64Encoded) {
        rawBody = Buffer.from(rawBody, 'base64').toString('utf-8');
      }
      
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid JSON in request body',
          details: parseError.message,
          provider: 'openai-whisper'
        })
      };
    }
    
    const { audio } = body;
    
    if (!audio || typeof audio !== 'string') {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Audio data must be provided as a base64 string',
          provider: 'openai-whisper'
        })
      };
    }

    console.log(`Processing audio data (${audio.length} characters)`);

    // Process audio with chunked approach for better memory management
    const audioBuffer = processBase64Chunks(audio);
    console.log(`Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Validate audio size (minimum 1KB, maximum 25MB for OpenAI)
    if (audioBuffer.length < 1024) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Audio recording is too short. Please record for at least 2 seconds.',
          provider: 'openai-whisper'
        })
      };
    }
    
    if (audioBuffer.length > 25 * 1024 * 1024) { // 25MB limit for OpenAI
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Audio recording is too large. Please record a shorter message (max 25MB).',
          provider: 'openai-whisper'
        })
      };
    }
    
    // Transcribe with OpenAI Whisper
    console.log('Starting OpenAI Whisper transcription...');
    const transcribedText = await transcribeWithWhisper(audioBuffer);
    
    console.log(`Transcription completed: "${transcribedText}"`);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: transcribedText,
        provider: 'openai-whisper',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error in OpenAI Whisper speech-to-text:', error);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    let statusCode = 500;
    
    if (error.message.includes('Audio format') || 
        error.message.includes('too short') ||
        error.message.includes('No speech detected') ||
        error.message.includes('too large')) {
      statusCode = 400;
    }
    
    const errorResponse = {
      error: userMessage,
      provider: 'openai-whisper',
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(errorResponse)
    };
  }
}; 