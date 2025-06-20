
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

interface RequestBody {
  title: string;
  content: any;
  originalText?: string;
  jobDescription?: string;
  selectedTemplate?: string;
  atsScore?: number; // Add support for atsScore parameter
}

serve(async (req) => {
  try {
    // Set CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
    };

    // Handle OPTIONS request for CORS
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers });
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { title, content, originalText, jobDescription, selectedTemplate, atsScore } = body;

    // Validate required fields
    if (!title || !content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the JWT token from the request header
    const authHeader = req.headers.get("authorization");
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      
      // Verify the token
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      
      if (!authError && userData?.user) {
        userId = userData.user.id;
      }
    }

    // If user is authenticated, create a permanent resume
    if (userId) {
      // Insert the resume record for the authenticated user
      // Include the ATS score if provided
      const { data: resume, error } = await supabase
        .from("user_resumes")
        .insert({
          user_id: userId,
          title: title,
          content: content,
          job_description: jobDescription || null,
          original_text: originalText || null,
          template_id: selectedTemplate || "standard",
          status: "draft",
          ats_score: atsScore || null // Save the ATS score to the database
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify(resume),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    } 
    // For anonymous users, create a temporary resume
    else {
      // Generate a temporary ID
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store in temporary storage
      const { data, error } = await supabase
        .from("temp_resumes")
        .insert({
          id: tempId,
          title: title,
          content: content,
          original_text: originalText || null,
          job_description: jobDescription || null,
          ats_score: atsScore || null, // Save the ATS score for temporary resumes too
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return new Response(
        JSON.stringify({ id: tempId, temporary: true }),
        { status: 200, headers: { ...headers, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error creating resume:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create resume" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
        } 
      }
    );
  }
});
