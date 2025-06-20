const AWS = require('aws-sdk');

/**
 * AWS Lambda function for text-to-speech conversion using Amazon Polly
 * Professional AWS-native solution for the interview platform
 * 
 * This function provides:
 * - High-quality speech synthesis with Amazon Polly
 * - Advanced lip-sync generation for 3D avatars
 * - Multiple voice options and languages
 * - Robust error handling and logging
 * - Cost-effective AWS-native solution
 */

// Initialize Amazon Polly client
const polly = new AWS.Polly({
  region: process.env.AWS_REGION || 'us-east-1'
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Voice mapping for compatibility with frontend voice selection
 * Maps common voice identifiers to Amazon Polly voice IDs
 */
const VOICE_MAPPING = {
  'en-US-Neural2-F': 'Joanna',        // Female US English
  'en-US-Neural2-M': 'Matthew',       // Male US English
  'en-GB-Neural2-F': 'Emma',          // Female British English
  'en-GB-Neural2-M': 'Brian',         // Male British English
  'en-AU-Neural2-F': 'Nicole',        // Female Australian English
  'en-AU-Neural2-M': 'Russell',       // Male Australian English
  '3eIAPRQVsX0VrSFmqoTf': 'Joanna',   // Fallback mapping for legacy voice ID
  'default': 'Joanna'
};

/**
 * Generate phonetic-based lip-sync data (Rhubarb-compatible format)
 * Enhanced version with better phonetic analysis and timing
 * @param {string} text - The text to generate lip-sync for
 * @param {number} audioByteLength - Length of audio data in bytes
 * @returns {Object} - Lip-sync data with mouth cues
 */
function generatePhoneticLipSync(text, audioByteLength) {
  // Estimate audio duration based on audio data size
  // For MP3, typical compression ratio gives us a reasonable estimate
  const estimatedDurationSec = audioByteLength / 16000; // Approximate for Polly's standard output
  
  // Rhubarb mouth shapes for 3D avatar animation:
  // A: Open mouth (vowels like "a" in "father")
  // B: Closed mouth (consonants like "b", "m", "p")  
  // C: Wide mouth (vowels like "i" in "bite")
  // D: Round mouth (vowels like "o" in "go")
  // E: Small mouth (vowels like "e" in "bed")
  // F: Bottom lip touching upper teeth (consonants like "f", "v")
  // G: Teeth touching (consonants like "t", "d", "s", "z")
  // H: Tongue visible (consonants like "th", "l")
  // X: Neutral mouth position (silence, pauses)
  
  // Enhanced phoneme mapping for more accurate lip-sync
  const phonemeMap = {
    // Vowels
    'a': 'A', 'ah': 'A', 'aa': 'A', 'ar': 'A',
    'e': 'E', 'eh': 'E', 'er': 'E',
    'i': 'C', 'ee': 'C', 'ih': 'C', 'y': 'C',
    'o': 'D', 'oh': 'D', 'oo': 'D', 'ow': 'D',
    'u': 'F', 'uh': 'F', 'uw': 'F',
    
    // Consonants
    'p': 'B', 'b': 'B', 'm': 'B',
    't': 'G', 'd': 'G', 'n': 'G', 'k': 'G', 'g': 'G', 'ng': 'G',
    'f': 'F', 'v': 'F',
    's': 'G', 'z': 'G', 'sh': 'G', 'zh': 'G',
    'ch': 'G', 'j': 'G',
    'th': 'H', 'dh': 'H',
    'l': 'H', 'r': 'H',
    'w': 'D', 'wh': 'D', 'y': 'C',
    'h': 'X',
    
    // Punctuation and pauses
    ' ': 'X', ',': 'X', '.': 'X', '?': 'X', '!': 'X', 
    ';': 'X', ':': 'X', '-': 'X', '"': 'X', "'": 'X'
  };
  
  // Clean and prepare text for analysis
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s.,!?;:'""-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into words for processing
  const words = cleanText.split(' ');
  
  // Calculate timing based on natural speech patterns
  const avgWordsPerMinute = 160; // Slightly faster for interview context
  const wordsPerSecond = avgWordsPerMinute / 60;
  const baseTimePerWord = 1 / wordsPerSecond;
  
  const mouthCues = [];
  let currentTime = 0;
  
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    if (!word) continue;
    
    // Dynamic word duration based on length and complexity
    const wordLength = word.length;
    const complexityFactor = wordLength > 6 ? 1.2 : wordLength < 3 ? 0.8 : 1.0;
    const wordDuration = baseTimePerWord * complexityFactor;
    
    // Process each character as a phoneme
    let charIndex = 0;
    while (charIndex < word.length) {
      let phoneme = 'X';
      let charsToSkip = 1;
      
      // Check for common digraphs and trigraphs
      if (charIndex < word.length - 2) {
        const trigraph = word.substring(charIndex, charIndex + 3);
        if (phonemeMap[trigraph]) {
          phoneme = phonemeMap[trigraph];
          charsToSkip = 3;
        }
      }
      
      if (phoneme === 'X' && charIndex < word.length - 1) {
        const digraph = word.substring(charIndex, charIndex + 2);
        if (phonemeMap[digraph]) {
          phoneme = phonemeMap[digraph];
          charsToSkip = 2;
        }
      }
      
      if (phoneme === 'X') {
        const char = word[charIndex];
        phoneme = phonemeMap[char] || 'X';
      }
      
      // Calculate phoneme duration
      const phonemeDuration = (wordDuration / word.length) * charsToSkip;
      
      // Add mouth cue
      mouthCues.push({
        start: currentTime,
        end: currentTime + phonemeDuration,
        value: phoneme
      });
      
      currentTime += phonemeDuration;
      charIndex += charsToSkip;
    }
    
    // Add inter-word pause (smaller for natural flow)
    const pauseDuration = wordIndex < words.length - 1 ? 0.08 : 0.15;
    mouthCues.push({
      start: currentTime,
      end: currentTime + pauseDuration,
      value: 'X'
    });
    
    currentTime += pauseDuration;
  }
  
  // Scale timing to match actual audio duration
  if (mouthCues.length > 0 && currentTime > 0 && estimatedDurationSec > 0) {
    const scaleFactor = estimatedDurationSec / currentTime;
    
    for (const cue of mouthCues) {
      cue.start *= scaleFactor;
      cue.end *= scaleFactor;
    }
    
    // Ensure proper ending
    const lastCue = mouthCues[mouthCues.length - 1];
    if (lastCue && lastCue.end < estimatedDurationSec) {
      mouthCues.push({
        start: lastCue.end,
        end: estimatedDurationSec,
        value: 'X'
      });
    }
  }
  
  return { mouthCues };
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Amazon Polly TTS request received:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: 'ok'
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { text, voice = "en-US-Neural2-F" } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error("Valid text parameter is required");
    }

    // Validate text length (Polly has limits)
    if (text.length > 3000) {
      throw new Error("Text is too long. Maximum 3000 characters allowed.");
    }

    console.log(`Generating speech for text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    console.log(`Requested voice: ${voice}`);
    
    // Map voice to Polly voice ID
    const pollyVoice = VOICE_MAPPING[voice] || VOICE_MAPPING['default'];
    console.log(`Using Polly voice: ${pollyVoice}`);
    
    // Prepare Polly parameters
    const pollyParams = {
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: pollyVoice,
      SampleRate: '22050',
      TextType: 'text', // Use 'ssml' if you want to support SSML in the future
      Engine: 'neural' // Use neural engine for better quality
    };
    
    console.log('Calling Amazon Polly...');
    
    // Call Amazon Polly
    const pollyResponse = await polly.synthesizeSpeech(pollyParams).promise();
    
    if (!pollyResponse.AudioStream) {
      throw new Error('No audio stream returned from Polly');
    }
    
    console.log('Successfully received audio from Polly');
    
    // Convert audio stream to base64
    const audioBuffer = Buffer.from(pollyResponse.AudioStream);
    const base64Audio = audioBuffer.toString('base64');
    
    console.log(`Audio buffer size: ${audioBuffer.length} bytes`);
    
    // Generate lip-sync data
    console.log('Generating lip-sync data...');
    const lipSyncData = generatePhoneticLipSync(text, audioBuffer.length);
    console.log(`Generated ${lipSyncData.mouthCues.length} lip-sync cues`);
    
    // Return response in the same format as the original function
    const response = {
      audioContent: base64Audio,
      lipSync: lipSyncData,
      metadata: {
        voice: pollyVoice,
        engine: 'neural',
        sampleRate: '22050',
        format: 'mp3',
        provider: 'aws-polly'
      }
    };
    
    console.log('Successfully generated speech with Amazon Polly');
    
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Error in Amazon Polly TTS:', error);
    
    // Provide detailed error information for debugging
    const errorResponse = {
      error: error.message || 'Unknown error occurred',
      provider: 'aws-polly',
      timestamp: new Date().toISOString()
    };
    
    // Add AWS-specific error details if available
    if (error.code) {
      errorResponse.awsErrorCode = error.code;
    }
    if (error.statusCode) {
      errorResponse.awsStatusCode = error.statusCode;
    }
    
    return {
      statusCode: error.statusCode || 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(errorResponse)
    };
  }
}; 