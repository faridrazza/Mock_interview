import React from 'react';
import { 
  UserPlus, 
  FileCode, 
  UsersRound, 
  MessageSquare,
  CheckCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up and tell us about your target job roles and experience level.',
    icon: <UserPlus className="h-12 w-12 text-white" />,
    image: '/images/11.png'
  },
  {
    number: '02',
    title: 'Select an Interview Type',
    description: 'Choose from various job roles and experience levels for your practice session.',
    icon: <FileCode className="h-12 w-12 text-white" />,
    image: '/images/2.png'
  },
  {
    number: '03',
    title: 'Practice with AI Avatars',
    description: 'Engage in realistic interview scenarios with adaptive questioning.',
    icon: <UsersRound className="h-12 w-12 text-white" />,
    image: '/images/3.png'
  },
  {
    number: '04',
    title: 'Receive Detailed Feedback',
    description: 'Get personalized insights on your answers, communication style, and areas for improvement.',
    icon: <MessageSquare className="h-12 w-12 text-white" />,
    image: '/images/4.png'
  }
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden" style={{ backgroundColor: "#f8f9ff", position: "relative", zIndex: 1 }}>
      {/* Enhanced Background Elements - ensuring they don't overlap announcement banner */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/60 to-indigo-50/80 dark:from-indigo-950/30 dark:via-neutral-950 dark:to-indigo-950/30"></div>
        <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-gradient-to-b from-indigo-200/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-gradient-to-t from-purple-200/40 to-transparent rounded-full blur-3xl" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
      </div>
      
      <div className="container px-4 md:px-6 relative">
        {/* Improved "How It Works" tag at the top */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full text-indigo-800 dark:text-indigo-200 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">How It Works</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="mb-4 text-4xl md:text-5xl font-bold">
            Built For <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Interview Success</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300">
            Master your interviews with our simple, streamlined process that takes you from signup 
            to interview mastery in just a few steps
          </p>
        </div>

        {/* Steps with images instead of large numbers */}
        <div className="space-y-20 mt-24">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}>
              {/* Image instead of large step number */}
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                  <img 
                    src={step.image} 
                    alt={`Step ${index + 1}: ${step.title}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              {/* Card with step details - enhanced with light design */}
              <div className="w-full md:w-2/3 group">
                <Card className="overflow-hidden relative border border-indigo-100 dark:border-indigo-900/50 shadow-xl transition-all duration-500 bg-gradient-to-br from-white via-white to-indigo-50/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-indigo-950/40 hover:shadow-2xl hover:shadow-indigo-300/30 dark:hover:shadow-indigo-700/20 group-hover:scale-[1.02]">
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-white to-purple-400 opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
                  <div className="absolute inset-[1px] bg-gradient-to-br from-white via-white to-white/95 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 z-10 rounded-lg"></div>
                  
                  {/* Content */}
                  <div className="relative z-20 p-8 md:p-10">
                    <div className="mb-6 p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl inline-block shadow-lg group-hover:shadow-indigo-500/5 group-hover:scale-105 transition-all duration-300">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-lg">
                        {step.icon}
                      </div>
                    </div>
                    
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-300 via-indigo-200 to-purple-300 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-neutral-800 dark:text-neutral-200 font-bold text-sm">{step.number}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-neutral-800 dark:text-white">{step.title}</h3>
                    </div>
                    
                    <p className="text-neutral-600 dark:text-neutral-300 mb-6 text-lg">
                      {step.description}
                    </p>
                    
                    <div className="flex items-center text-indigo-500 dark:text-indigo-300 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors duration-300">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Quick & Easy</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA button with enhanced styling */}
        <div className="mt-20 text-center">
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-8 py-6 text-base shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all group border-0"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
