// Add type declarations for Deno
// @ts-ignore: Deno-specific imports
import "https://deno.land/x/xhr@0.1.0/mod.ts";
// @ts-ignore: Deno-specific imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: JWT for Google authentication
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

// Define Deno namespace for TypeScript
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// Get Google Cloud credentials from environment variables
const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate Google auth token
async function getGoogleAuthToken() {
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google Cloud credentials");
  }
  
  // More robust private key handling
  let privateKey = GOOGLE_PRIVATE_KEY;
  
  // Remove any surrounding quotes
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  
  // Replace literal \n with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');
  
  // Make sure the key has proper PEM format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error("Invalid private key format - missing BEGIN marker");
  }
  
  // Extract the base64 portion of the key
  const pemContents = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  // Convert base64 to binary
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  // Import the key using the binary DER format directly
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  // FIX: Correct audience URL and scope for Google Text-to-Speech API
  const payload = {
    iss: GOOGLE_CLIENT_EMAIL,
    sub: GOOGLE_CLIENT_EMAIL,
    aud: "https://oauth2.googleapis.com/token",  // Changed from texttospeech.googleapis.com
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    scope: "https://www.googleapis.com/auth/cloud-platform"  // This scope includes all Google Cloud APIs
  };
  
  const jwt = await create({ alg: "RS256", typ: "JWT" }, payload, key);
  
  // Exchange JWT for access token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    console.error("Token response:", tokenData);
    throw new Error("Failed to get Google access token");
  }
  
  return tokenData.access_token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("Google Cloud credentials present:", !!GOOGLE_CLIENT_EMAIL && !!GOOGLE_PRIVATE_KEY);
  
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error("Missing Google Cloud credentials");
    return new Response(
      JSON.stringify({ 
        error: "Google Cloud credentials not found",
        message: "Please set the GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY environment variables in your Supabase project."
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Parse request body
    const { text, voice = "en-US-Neural2-F" } = await req.json(); // Default to female Neural2 voice

    if (!text) {
      throw new Error("Text parameter is required");
    }

    console.log("Generating speech for text:", text.substring(0, 50) + "...");
    console.log("Using voice:", voice);
    
    // Get Google auth token
    const accessToken = await getGoogleAuthToken();
    
    // Step 1: Call Google Cloud TTS API
    console.log("Calling Google Cloud TTS API...");
    
    // Map voice parameter to proper Google voice format if needed
    // This handles the case where frontend is still sending ElevenLabs voice IDs
    const googleVoice = voice === "3eIAPRQVsX0VrSFmqoTf" ? "en-US-Neural2-F" : voice;
    
    const response = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: googleVoice.split('-').slice(0, 2).join('-'), // Extract language code (e.g., "en-US")
          name: googleVoice,
          ssmlGender: googleVoice.endsWith("-F") ? "FEMALE" : "MALE"
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
          pitch: 0.0
        }
      })
    });

    console.log("Google Cloud TTS API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Cloud TTS API error:", errorText);
      throw new Error(errorText || "Failed to convert text to speech");
    }

    // Google TTS returns audio content as base64 directly
    const responseData = await response.json();
    const base64Audio = responseData.audioContent;
    
    // Calculate audio duration for lip-sync (similar to ElevenLabs implementation)
    // We estimate the duration based on the base64 data size
    const binaryLength = atob(base64Audio).length;
    
    // Step 2: Generate Rhubarb-compatible lip-sync data (keep existing method)
    console.log("Generating lip-sync data...");
    const lipSyncData = generatePhoneticLipSync(text, binaryLength);
    console.log("Generated lip-sync data with", lipSyncData.mouthCues.length, "mouth cues");
    
    console.log("Successfully generated speech with Google Cloud TTS and lip-sync data");
    
    // Return the same structure as we did with ElevenLabs for frontend compatibility
    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        lipSync: lipSyncData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to generate phonetic-based lip-sync data (Rhubarb-compatible format)
function generatePhoneticLipSync(text: string, audioByteLength: number) {
  // Estimate audio duration based on audio data size
  // MP3 bitrate is typically around 128 kbps
  const estimatedBitrate = 128 * 1024; // bits per second
  const audioDurationSec = (audioByteLength * 8 / estimatedBitrate);
  
  // Rhubarb uses these mouth shapes:
  // A: Open mouth (vowels like "a" in "father")
  // B: Closed mouth (consonants like "b", "m", "p")
  // C: Wide mouth (vowels like "i" in "bite")
  // D: Round mouth (vowels like "o" in "go")
  // E: Small mouth (vowels like "e" in "bed")
  // F: Bottom lip touching upper teeth (consonants like "f", "v")
  // G: Teeth touching (consonants like "t", "d", "s", "z")
  // H: Tongue visible (consonants like "th", "l")
  // X: Neutral mouth position (silence, pauses)
  
  // Define phoneme mapping for English text
  const phonemeMap: Record<string, string> = {
    'a': 'A', 'ah': 'A', 'aa': 'A',
    'e': 'E', 'eh': 'E',
    'i': 'C', 'ee': 'C', 'y': 'C',
    'o': 'D', 'oh': 'D', 'oo': 'D',
    'u': 'F', 'uh': 'F',
    'p': 'B', 'b': 'B', 'm': 'B',
    't': 'G', 'd': 'G', 'n': 'G',
    'k': 'G', 'g': 'G', 'ng': 'G',
    'f': 'F', 'v': 'F',
    's': 'G', 'z': 'G',
    'sh': 'G', 'ch': 'G', 'j': 'G',
    'th': 'H', 'dh': 'H',
    'l': 'H', 'r': 'H',
    'w': 'D', 'wh': 'D',
    ' ': 'X', ',': 'X', '.': 'X', '?': 'X', '!': 'X', ';': 'X', ':': 'X'
  };
  
  // Prepare text for phonetic analysis
  const cleanText = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ')     // Replace multiple spaces with a single space
    .trim();
  
  // Split text into words
  const words = cleanText.split(' ');
  
  // Estimate words per second based on average speaking rate
  const avgWordsPerMinute = 150;
  const wordsPerSecond = avgWordsPerMinute / 60;
  
  // Calculate time per word
  const timePerWord = 1 / wordsPerSecond;
  
  // Define the type for mouth cues
  type MouthCue = {
    start: number;
    end: number;
    value: string;
  };
  
  // Generate mouth cues in Rhubarb format
  const mouthCues: MouthCue[] = [];
  let currentTime = 0;
  
  for (const word of words) {
    if (!word) continue;
    
    // Estimate duration for this word (longer words take more time)
    const wordDuration = timePerWord * (word.length / 5); // Adjust for word length
    const phonemeDuration = wordDuration / word.length;
    
    // Process each character as a phoneme
    for (let i = 0; i < word.length; i++) {
      // Check for digraphs (th, sh, ch, etc.)
      let phoneme = 'X';
      if (i < word.length - 1) {
        const digraph = word.substring(i, i + 2);
        if (phonemeMap[digraph]) {
          phoneme = phonemeMap[digraph];
          i++; // Skip the next character
        } else {
          phoneme = phonemeMap[word[i]] || 'X';
        }
      } else {
        phoneme = phonemeMap[word[i]] || 'X';
      }
      
      // Add mouth cue
      mouthCues.push({
        start: currentTime,
        end: currentTime + phonemeDuration,
        value: phoneme
      });
      
      currentTime += phonemeDuration;
    }
    
    // Add a small pause between words
    mouthCues.push({
      start: currentTime,
      end: currentTime + 0.05, // 50ms pause
      value: 'X'
    });
    
    currentTime += 0.05;
  }
  
  // Adjust timing to match the estimated audio duration
  if (mouthCues.length > 0 && currentTime > 0) {
    const scaleFactor = audioDurationSec / currentTime;
    
    for (const cue of mouthCues) {
      cue.start *= scaleFactor;
      cue.end *= scaleFactor;
    }
    
    // Ensure the last cue ends at the audio duration
    if (mouthCues.length > 0) {
      const lastCue = mouthCues[mouthCues.length - 1];
      if (lastCue.end < audioDurationSec) {
        mouthCues.push({
          start: lastCue.end,
          end: audioDurationSec,
          value: 'X'
        });
      }
    }
  }
  
  return { mouthCues };
}
