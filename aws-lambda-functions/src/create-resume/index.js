const { createClient } = require('@supabase/supabase-js');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

/**
 * AWS Lambda function to create resume records
 * Maintains identical API contract with the original Supabase Edge Function
 */
exports.handler = async (event) => {
  console.log('Create Resume Lambda invoked');

  try {
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ message: 'CORS preflight successful' })
      };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    // Parse request body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { title, content, originalText, jobDescription, selectedTemplate, atsScore } = body;

    // Validate required fields
    if (!title || !content) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields: title and content are required' })
      };
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract JWT token from Authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        // Verify the token and get user data
        const { data: userData, error: authError } = await supabase.auth.getUser(token);
        
        if (!authError && userData?.user) {
          userId = userData.user.id;
          console.log('Authenticated user:', userId);
        } else {
          console.log('Token verification failed:', authError?.message || 'No user data');
        }
      } catch (authError) {
        console.error('Error verifying token:', authError);
      }
    } else {
      console.log('No authorization header found');
    }

    // If user is authenticated, create a permanent resume
    if (userId) {
      console.log('Creating permanent resume for user:', userId);
      
      const { data: resume, error } = await supabase
        .from('user_resumes')
        .insert({
          user_id: userId,
          title: title,
          content: content,
          job_description: jobDescription || null,
          original_text: originalText || null,
          template_id: selectedTemplate || 'standard',
          status: 'draft',
          ats_score: atsScore || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating permanent resume:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: error.message || 'Failed to create resume' })
        };
      }

      console.log('Permanent resume created successfully:', resume.id);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(resume)
      };
    } 
    // For anonymous users, create a temporary resume
    else {
      console.log('Creating temporary resume for anonymous user');
      
      // Generate a temporary ID
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store in temporary storage (expires in 24 hours)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('temp_resumes')
        .insert({
          id: tempId,
          title: title,
          content: content,
          original_text: originalText || null,
          job_description: jobDescription || null,
          ats_score: atsScore || null,
          expires_at: expiresAt
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating temporary resume:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: error.message || 'Failed to create temporary resume' })
        };
      }
      
      console.log('Temporary resume created successfully:', tempId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ id: tempId, temporary: true })
      };
    }

  } catch (error) {
    console.error('Unexpected error in create-resume function:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error'
      })
    };
  }
}; 