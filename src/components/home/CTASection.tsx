import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "#f2f6ff" }}>
      {/* Enhanced Background gradient with more vibrant colors */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 dark:from-indigo-950/30 dark:via-neutral-900 dark:to-purple-950/30"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }}></div>
        
        {/* Subtle dot pattern overlay matching SolutionsSection */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#4f46e5 1px,transparent 1px)] [background-size:20px_20px]"></div>
        
        {/* Light borders at top and bottom matching SolutionsSection */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent"></div>
      </div>
      
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white/90 dark:bg-neutral-800/90 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl border border-indigo-100/80 dark:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-300/30 dark:hover:shadow-indigo-700/20 transition-all duration-500">
          <div className="p-8 md:p-12">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full text-indigo-800 dark:text-indigo-200 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-sm font-medium">Ace Your Interview</span>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Ready to ace your next interview?</h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-8 max-w-2xl mx-auto">
                Start practicing today with our AI interview simulator and receive personalized feedback to improve your chances of landing your dream job.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-8 py-6 text-base shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all w-full sm:w-auto border-0" 
                  onClick={() => navigate('/auth')}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-base border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 w-full sm:w-auto"
                  onClick={() => {
                    const heroSection = document.querySelector('section');
                    if (heroSection) {
                      heroSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Learn More
                </Button>
              </div>
              
              <Separator className="my-8 bg-gradient-to-r from-transparent via-indigo-200 dark:via-indigo-700/30 to-transparent max-w-xs mx-auto" />
              
              <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                No credit card required. Try it out for free!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
