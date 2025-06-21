import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define a comprehensive type for all plan properties
type PlanType = {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
  className: string;
  btnVariant: "outline" | "default";
  savingsTag?: string;
  period?: string;
  id: string;
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const monthlyPlans: PlanType[] = [
    {
      id: "bronze",
      name: "Bronze",
      price: "Free",
      description: "Perfect for beginners starting their job search journey.",
      features: [
        "30 Standard AI Interviews Per Month",
        "30 Advanced AI Interviews Per Month", 
        "50 Resume Downloads",
        "AI-Feedback & Scoring"
      ],
      isPopular: false,
      ctaText: "Get Started Free",
      className: "border-neutral-200 dark:border-neutral-800",
      btnVariant: "outline"
    },
    {
      id: "gold",
      name: "Gold",
      price: "9.00",
      description: "Our most popular plan for serious job seekers.",
      features: [
        "✨ Interview + ATS Resume AI Builder",
        "80 Standard AI Interviews Per Month",
        "50 Advanced AI Interviews with Real Company Questions",
        "AI-Based Feedback & Scoring",
        "Create up to 100 resumes & PDF Downloads",
        "Multiple professional templates",
        "ATS-optimization",
        "Text-based AI Interviewer",
        "Voice-based AI Interviewer for a Realistic Experience",
        "Access to Role-Specific Interviews (Java, DevOps, Data Science, etc.)",
        "Performance Analysis & Improvement Tips",
        "Email Support for Queries",
        "3D AI avatar Interaction",
        "Judgment-free environment to practice interviews",
        "Prepration suggestion"
      ],
      isPopular: true,
      ctaText: "Choose Gold",
      className: "border-indigo-200 dark:border-indigo-800",
      btnVariant: "default"
    },
    {
      id: "diamond",
      name: "Diamond",
      price: "18.00",
      description: "Comprehensive coverage for professionals.",
      features: [
        "✨ Unlimited Interview + ATS Resume AI Builder",
        "Unlimited Standard AI Interviews Per Month",
        "Unlimited Advanced AI Interviews with Real Company Questions",
        "Create up to 200 resumes & PDF Downloads",
        "Multiple professional templates",
        "Advanced ATS-optimization",
        "Deatailed AI-Based Feedback & Scoring",
        "Text-based AI Interviewer",
        "Voice-based AI Interviewer for a Realistic Experience",
        "Access to Role-Specific Interviews (Java, DevOps, Data Science, etc.)",
        "Performance Analysis & Improvement Tips",
        "Email Support for Queries",
        "3D AI avatar Interaction",
        "Judgment-free environment to practice interviews",
        "Prepration suggestion"
      ],
      isPopular: false,
      ctaText: "Choose Diamond",
      className: "border-neutral-200 dark:border-neutral-800",
      btnVariant: "outline"
    }
  ];

  const yearlyPlans: PlanType[] = [
    {
      id: "diamond_yearly",
      name: "Megastar",
      price: "59.00",
      description: "Annual subscription with maximum savings.",
      savingsTag: "Save $157.00",
      features: [
        "✨ Ultimate Interview + ATS AI Resume Builder",
        "Unlimited Standard AI Interviews Per Month",
        "Unlimited Advanced AI Interviews with Real Company Questions",
        "Unlimited resume creation & PDF downloads",
        "Multiple professional templates",
        "Advanced ATS-optimization",
        "Deatailed AI-Based Feedback & Scoring",
        "Text-based AI Interviewer",
        "Voice-based AI Interviewer for a Realistic Experience",
        "Access to Role-Specific Interviews (Java, DevOps, Data Science, etc.)",
        "Performance Analysis & Improvement Tips",
        "Email Support for Queries",
        "3D AI avatar Interaction",
        "Judgment-free environment to practice interviews",
        "Prepration suggestion",
        "Annual subscription with significant savings"
      ],
      isPopular: true,
      ctaText: "Choose Megastar",
      className: "border-indigo-200 dark:border-indigo-800",
      btnVariant: "default"
    }
  ];

  const handleBillingCycleChange = (value: string) => {
    if (value === 'monthly' || value === 'yearly') {
      setBillingCycle(value);
    }
  };

  const handlePlanSelection = (plan: PlanType) => {
    // If user is not logged in, redirect to auth page
    if (!user) {
      // Store selected plan in session storage for retrieval after login
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
      navigate('/auth');
      return;
    }

            // If user is logged in, redirect to dashboard 
        navigate('/dashboard?tab=overview');
    
    // Show toast with information about selecting the plan
    toast({
      title: "Plan Selected",
      description: `You selected the ${plan.name} plan. Complete your subscription in the dashboard.`,
    });
  };

  const plansToShow = billingCycle === 'monthly' ? monthlyPlans : yearlyPlans;

  return (
    <section id="pricing" className="relative py-24 bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-neutral-950 dark:via-indigo-950/10 dark:to-neutral-950">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full text-indigo-800 dark:text-indigo-200 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">Pricing Plans</span>
          </div>
          <h2 className="mb-4">Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Pricing</span></h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-lg">
            Choose the plan that works best for your interview preparation needs. 
            Cancel anytime with no questions asked.
          </p>
          
          <div className="flex justify-center mt-6">
            <ToggleGroup 
              type="single" 
              value={billingCycle} 
              onValueChange={handleBillingCycleChange}
              className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full"
            >
              <ToggleGroupItem 
                value="monthly" 
                className="rounded-full px-5 data-[state=on]:bg-gradient-to-r data-[state=on]:from-indigo-600 data-[state=on]:to-purple-600 data-[state=on]:text-white data-[state=on]:shadow-sm"
              >
                Monthly
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="yearly" 
                className="rounded-full px-5 data-[state=on]:bg-gradient-to-r data-[state=on]:from-indigo-600 data-[state=on]:to-purple-600 data-[state=on]:text-white data-[state=on]:shadow-sm"
              >
                Yearly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <div className={`grid ${billingCycle === 'monthly' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-8 max-w-6xl mx-auto`}>
          {plansToShow.map((plan, index) => {
            const isMegastar = plan.id === 'diamond_yearly';
            
            return (
            <div 
              key={index} 
              className={`relative rounded-2xl border ${plan.className} ${isMegastar ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 border-2 border-gradient-to-r from-yellow-400 to-orange-500' : 'bg-white/90 dark:bg-neutral-800/90'} backdrop-blur-sm p-8 flex flex-col transition-all hover:-translate-y-2 hover:shadow-xl ${plan.isPopular ? 'md:scale-105 z-10 ring-1 ring-indigo-200 dark:ring-indigo-800 shadow-xl' : 'shadow-lg'} ${isMegastar ? 'shadow-2xl hover:shadow-3xl transform hover:scale-110' : ''} ${billingCycle === 'yearly' ? 'max-w-xl mx-auto' : ''} ${isMegastar ? 'overflow-hidden' : ''}`}
            >
                              {isMegastar && (
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse"></div>
                )}
                
              {plan.isPopular && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className={`${isMegastar ? 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-bounce' : 'bg-gradient-to-r from-indigo-500 to-purple-500'} text-white text-xs font-medium py-1 px-3 rounded-full shadow-md whitespace-nowrap`}>
                      {isMegastar ? '🔥 BEST DEAL' : 'Most Popular'}
                  </div>
                </div>
              )}
              
              {plan.savingsTag && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className={`${isMegastar ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-green-500 to-emerald-500'} text-white text-xs font-medium py-1 px-3 rounded-full shadow-md whitespace-nowrap`}>
                      {isMegastar ? `🌟 ${plan.savingsTag}` : plan.savingsTag}
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-3">
                  <span className={`text-4xl font-extrabold ${isMegastar ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600' : ''}`}>
                    {plan.price !== "Free" ? `$${plan.price}` : plan.price}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-1">{plan.period || (plan.price !== "Free" ? (billingCycle === 'monthly' ? "/month" : "/year") : "")}</span>
                  {isMegastar && (
                    <div className="ml-2 text-lg animate-bounce">💎</div>
                  )}
                </div>
                <p className="text-neutral-600 dark:text-neutral-400">{plan.description}</p>
              </div>
              
              <div className="mb-8 flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check 
                        className={`h-5 w-5 mr-2 shrink-0 mt-0.5 ${plan.isPopular ? 'text-indigo-500 dark:text-indigo-400' : 'text-neutral-500 dark:text-neutral-400'}`} 
                        strokeWidth={3} 
                      />
                      <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button 
                variant={plan.btnVariant} 
                className={`w-full rounded-full py-6 ${plan.isPopular ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-purple-500/30 border-0' : ''}`}
                onClick={() => handlePlanSelection(plan)}
              >
                {plan.ctaText}
              </Button>
            </div>
            );
          })}
        </div>
        
        <div className="mt-12 text-center text-neutral-600 dark:text-neutral-400">
          Need a custom plan for your organization? <a href="#" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium underline-offset-2 hover:underline">Contact us</a>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
