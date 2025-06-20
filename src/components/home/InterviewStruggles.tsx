import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Frown, AlertTriangle, HelpCircle, BrainCircuit, Target, Blocks } from 'lucide-react';
const InterviewStruggles = () => {
  return <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 relative">
          <div className="mb-3 inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
            <span className="relative px-2">Interview Challenges</span>
          </div>
          <h2 className="mb-4 text-4xl md:text-5xl font-bold">
            Struggling with Interviews? <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">You're Not Alone.</span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto text-center py-[20px]">That moment when your mind goes blank during a crucial question. The frustration of missing opportunities you know you deserve. The uncertainty of walking away never knowing how close you came to landing your dream role. These aren't just challenges—they're career roadblocks that our platform is designed to eliminate.</p>
          <div className="mt-3 text-base font-medium text-indigo-600 dark:text-indigo-400">
            You're not alone—thousands of job seekers face these same challenges every day:
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
            <CardContent className="p-6 flex flex-col items-start">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">Unexpected Questions</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Ever been caught off guard and struggled to respond to questions you didn't prepare for?
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
            <CardContent className="p-6 flex flex-col items-start">
              <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Frown className="h-6 w-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">Nervousness & Anxiety</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Feeling pressured and losing confidence in the moment when it matters most?
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
            <CardContent className="p-6 flex flex-col items-start">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <HelpCircle className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">Lack of Feedback</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Unsure what went wrong and how to improve after unsuccessful interviews?
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
            <CardContent className="p-6 flex flex-col items-start">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BrainCircuit className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">Technical Question Stumbles</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Freezing when asked to demonstrate practical skills during technical interviews?
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
            <CardContent className="p-6 flex flex-col items-start">
              <div className="h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">No Realistic Practice</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Preparing in a way that doesn't match real interview experiences leads to unexpected challenges?
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden">
            <CardContent className="p-6 flex flex-col items-start">
              <div className="h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Blocks className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-800 dark:text-neutral-200">Expression Blocks</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Unable to articulate answers clearly despite knowing the material, leading to frustration and missed opportunities?
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
export default InterviewStruggles;