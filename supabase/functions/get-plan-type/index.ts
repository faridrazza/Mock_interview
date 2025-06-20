import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const body = await req.json()
    const { plan_id } = body

    if (!plan_id) {
      return new Response(
        JSON.stringify({ error: 'plan_id is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        auth: {
          autoRefreshToken: false,
          persistSession: false
        } 
      }
    )

    // Map plan ID to tier
    // The mapping is based on environment variables stored in Supabase
    let planType = null
    
    // Get the environment variables for all plan IDs
    const goldMonthlyPlanId = Deno.env.get('PAYPAL_GOLD_MONTHLY_PLAN_ID')
    const goldYearlyPlanId = Deno.env.get('PAYPAL_GOLD_YEARLY_PLAN_ID')
    const diamondMonthlyPlanId = Deno.env.get('PAYPAL_DIAMOND_MONTHLY_PLAN_ID')
    const diamondYearlyPlanId = Deno.env.get('PAYPAL_DIAMOND_YEARLY_PLAN_ID')
    const bronzeMonthlyPlanId = Deno.env.get('PAYPAL_BRONZE_MONTHLY_PLAN_ID')
    const bronzeYearlyPlanId = Deno.env.get('PAYPAL_BRONZE_YEARLY_PLAN_ID')
    // Resume plan IDs
    const resumeBasicPlanId = Deno.env.get('PAYPAL_RESUME_BASIC_PLAN_ID')
    const resumePremiumPlanId = Deno.env.get('PAYPAL_RESUME_PREMIUM_PLAN_ID')
    
    console.log(`Checking plan ID: ${plan_id}`)
    
    // Log all plan IDs for debugging
    console.log('Available plan IDs:', {
      goldMonthly: goldMonthlyPlanId,
      goldYearly: goldYearlyPlanId,
      diamondMonthly: diamondMonthlyPlanId,
      diamondYearly: diamondYearlyPlanId,
      bronzeMonthly: bronzeMonthlyPlanId,
      bronzeYearly: bronzeYearlyPlanId,
      resumeBasic: resumeBasicPlanId,
      resumePremium: resumePremiumPlanId
    })

    // Find matching plan type
    if (plan_id === goldMonthlyPlanId || plan_id === goldYearlyPlanId) {
      planType = 'gold'
    } else if (plan_id === diamondMonthlyPlanId || plan_id === diamondYearlyPlanId) {
      planType = 'diamond'
    } else if (plan_id === bronzeMonthlyPlanId || plan_id === bronzeYearlyPlanId) {
      planType = 'bronze'
    } else if (plan_id === resumeBasicPlanId) {
      planType = 'resume_basic'
    } else if (plan_id === resumePremiumPlanId) {
      planType = 'resume_premium'
    }
    
    // If no exact match, try fallback method with includes()
    if (!planType) {
      plan_id = plan_id.toUpperCase()
      if (plan_id.includes('GOLD')) {
        planType = 'gold'
      } else if (plan_id.includes('DIAMOND')) {
        planType = 'diamond'
      } else if (plan_id.includes('BRONZE')) {
        planType = 'bronze'
      } else if (plan_id.includes('RESUME_BASIC') || plan_id.includes('RESUMEBASIC')) {
        planType = 'resume_basic'
      } else if (plan_id.includes('RESUME_PREMIUM') || plan_id.includes('RESUMEPREMIUM')) {
        planType = 'resume_premium'
      }
    }
    
    console.log(`Determined plan type: ${planType}`)
    
    return new Response(
      JSON.stringify({ planType }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-plan-type function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
