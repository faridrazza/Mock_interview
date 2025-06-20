import React from 'react';
import { Check, BrainCog, Infinity, Heart, UserCheck, Shield, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SolutionsSection = () => {
  const navigate = useNavigate();

  return <section className="relative py-20 overflow-hidden" style={{ backgroundColor: "#f2f6ff", position: "relative", zIndex: 1 }}>
      {/* Background gradients - ensuring they don't overlap the announcement banner */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/60 dark:from-indigo-950/30 dark:via-neutral-900 dark:to-purple-950/30"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-pink-200/20 via-indigo-200/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-indigo-200/20 via-purple-200/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Subtle dot pattern overlay */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4f46e5 1px,transparent 1px)] [background-size:20px_20px]"></div>
        
        {/* Light borders at top and bottom */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
      </div>
      
      <div className="container px-4 md:px-6">
        {/* Section Header - Updated to match How It Works style */}
        <div className="text-center mb-12 relative">
          <div className="mb-3 inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full">
            <span className="relative px-2">Our Solution</span>
          </div>
          <h2 className="mb-4 text-4xl md:text-5xl font-bold">
            Solution? <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">AI-Powered Interview Practice</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">Imagine walking into your next interview feeling confident and prepared—knowing you've already practiced with lifelike AI avatars, received feedback, and improved your skills with every session.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left column */}
          <div className="lg:w-1/2 relative">
            <div className="absolute -left-8 -top-8 w-24 h-24 bg-indigo-200/50 dark:bg-indigo-900/20 rounded-full blur-2xl animate-pulse-slow"></div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-200/50 dark:bg-purple-900/20 rounded-full blur-2xl animate-pulse-slow" style={{
            animationDelay: "1s"
          }}></div>
            
            <div className="relative z-10 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-indigo-100/50 dark:border-indigo-900/30">
              <div className="mb-6 inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full">
                <span className="relative px-2 text-left">How Do We Solve Your Interview Struggles?</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                How Do We Solve Your Interview Struggles?
              </h2>
              
              
              
              <div className="space-y-6 mb-10">
                {[{
                icon: <BrainCog className="text-indigo-500" />,
                text: "Realistic AI Interviews – Practice with AI that adapts like a real interviewer"
              }, {
                icon: <Infinity className="text-purple-500" />,
                text: "Unlimited Practice – Prepare anytime, anywhere, for any job role without scheduling or paying expensive coaches"
              }, {
                icon: <UserCheck className="text-blue-500" />,
                text: "Practice builds confidence - Our AI avatar create pressure-free environments to work through your nervousness"
              }, {
                icon: <Check className="text-green-500" />,
                text: "Feedback on exactly what to improve, without judgment"
              }, {
                icon: <Target className="text-orange-500" />,
                text: "Role-specific practice ensures you're prepared for exactly the job you want"
              }, {
                icon: <Shield className="text-pink-500" />,
                text: "AI doesn't judge. A judgment-free platform to practice Mock interviews"
              }].map((item, i) => <div key={i} className="flex gap-4 items-start">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-300">{item.text}</p>
                  </div>)}
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="lg:w-1/2">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-3xl p-8 shadow-lg border border-indigo-100/80 dark:border-indigo-800/20 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-300/20 to-purple-300/20 dark:from-pink-700/20 dark:to-purple-700/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-300/20 to-blue-300/20 dark:from-indigo-700/20 dark:to-blue-700/20 rounded-full blur-2xl"></div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 dark:from-pink-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Turn Interview Anxiety Into Confidence
              </h3>
              
              <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8">
                Don't let another opportunity slip away because of interview anxiety. Start practicing today and land your dream job with confidence.
              </p>
              
              <p className="text-neutral-700 dark:text-neutral-300 mb-10">
                Our AI interview platform was built specifically to solve these challenges. Instead of feeling unprepared 
                for your next interview, imagine having practiced dozens of realistic scenarios tailored exactly to your target role.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-8 py-6 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all w-full sm:w-auto border-0" 
                  onClick={() => navigate('/auth')}
                >
                  Start Practicing Now
                </Button>
                <Button variant="outline" className="rounded-full px-8 py-6 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 w-full sm:w-auto" onClick={() => navigate('/auth')}>
                  Create Free Account
                </Button>
              </div>
              
              <div className="mt-8 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm shadow-sm">
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" fill="currentColor" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Interview simulators. Start practicing today
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default SolutionsSection;
