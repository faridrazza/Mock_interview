import React from 'react';
import { Sparkles, Trophy, Instagram, Info, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Custom X icon component (formerly Twitter)
const XIcon = ({ className, size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M4 4l11.5 11.5" />
    <path d="M20 4L4 20" />
    <path d="M20 4L8.5 15.5" />
    <path d="M20 4l-4.5 4.5" />
  </svg>
);

const Contest = () => {
  // Function to share on X (Twitter)
  const shareOnX = () => {
    const text = "Join MockInterview4U's Practice Mock Interview Contest and win $100! 🏆 #MockInterview #InterviewPrep";
    const url = window.location.href;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  // Function to share on Instagram
  const shareOnInstagram = () => {
    // Instagram doesn't have a direct sharing API like X does
    // We'll open Instagram and provide instructions to share
    alert("Instagram doesn't support direct sharing. Copy the link and share it on your Instagram story or post!");
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        window.open('https://www.instagram.com/', '_blank');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  return (
    <main className="flex-grow py-16 md:py-24 overflow-hidden">
      {/* Background design elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        {/* Contest header section */}
        <div className="text-center space-y-4 mb-12 relative">
          <div className="mb-3 inline-flex items-center justify-center px-4 py-1.5 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            <span className="relative px-2">Special Contest</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tighter mb-4">
            <span className="block mb-2">Practice Mock Interview or</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
            Build Resume and Win $100
            </span>
          </h1>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-8">
            Show us how MockInterview4U helps you prepare for your dream job and win a cash prize!
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* How to participate section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">How to Participate</h2>
                  </div>
                  
                  <Separator className="bg-purple-100 dark:bg-purple-900/30" />
                  
                  <ol className="space-y-4 pl-0 list-none">
                    <li className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">Subscribe to Any Paid Plan on MockInterview4U.com.</p>
                      </div>
                    </li>
                    
                    <li className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">Use the platform to take a selfie or record a short video while using your favorite feature.</p>
                      </div>
                    </li>
                    
                    <li className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">Post it on either Instagram or X (formerly Twitter) from your personal account.</p>
                      </div>
                    </li>
                    
                    <li className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">4</span>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">Tag us in the post:</p>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full">
                            <Instagram className="h-4 w-4" />
                            <span className="text-sm font-medium">@mockinterview4u</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-3 py-1.5 rounded-full">
                            <XIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">@mockinterview4u</span>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    <li className="flex gap-3 items-start">
                      <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="font-semibold text-purple-700 dark:text-purple-300 text-sm">5</span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-200">Make sure your account/post is public so we can view and judge your entry.</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Rules & Eligibility */}
            <Card className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Rules & Eligibility</h2>
                  </div>
                  
                  <Separator className="bg-purple-100 dark:bg-purple-900/30" />
                  
                  <ul className="space-y-3 pl-0 list-none">
                    {[
                      "You must be a paid subscriber of MockInterview4U during the contest round.",
                      "Entries must include you visibly using the platform (either in selfie or video format).",
                      "Tagging our official handle is mandatory for a valid submission.",
                      "One entry per user per round.",
                      "Winners will be announced on our official social media channels every 10 days.",
                      "By entering, you agree to allow MockInterview4U to repost or share your content for promotional purposes (with credit given to you, of course!)."
                    ].map((rule, index) => (
                      <li key={index} className="flex gap-2.5 items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-neutral-600 dark:text-neutral-400">{rule}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Tips to Win */}
            <Card className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-purple-100 dark:border-purple-900/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Tips to Win</h2>
                  </div>
                  
                  <Separator className="bg-purple-100 dark:bg-purple-900/30" />
                  
                  <ul className="space-y-3 pl-0 list-none">
                    {[
                      "Be creative! Show off how MockInterview4U helps you.",
                      "Keep it short, fun, and authentic.",
                      "Use captions or voiceovers to make your post engaging."
                    ].map((tip, index) => (
                      <li key={index} className="flex gap-2.5 items-start">
                        <div className="h-5 w-5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-yellow-700 dark:text-yellow-400 text-xs font-bold">✓</span>
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contest Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 border border-indigo-100 dark:border-indigo-800/20 shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-10 -translate-y-10">
                  <div className="w-full h-full bg-pink-400/20 dark:bg-pink-700/20 rounded-full blur-2xl"></div>
                </div>
                
                <CardContent className="p-6 md:p-8 relative">
                  <h3 className="text-xl font-bold mb-4 text-indigo-900 dark:text-indigo-100">Contest Details</h3>
                  
                  <Separator className="bg-indigo-200/50 dark:bg-indigo-700/30 my-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Duration</h4>
                      <p className="text-indigo-700 dark:text-indigo-300">New round every 10 days</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Activation Requirement</h4>
                      <p className="text-indigo-700 dark:text-indigo-300">Minimum of 20 paid subscribers required per round. If the contest doesn't start for any reason, simply email us at company@mockinterview.com to request a full refund.</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Selection Criteria</h4>
                      <p className="text-indigo-700 dark:text-indigo-300">Most creative, authentic, and engaging post</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1">Prize</h4>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0 px-2.5 py-1">
                          <span className="font-bold">$100</span>
                        </Badge>
                        <span className="text-indigo-700 dark:text-indigo-300 text-sm">via online payment</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="bg-indigo-200/50 dark:bg-indigo-700/30 my-6" />
                  
                  <div className="space-y-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md"
                      onClick={() => window.location.href = '/auth?tab=signup'}
                    >
                      Subscribe Now to Participate
                    </Button>
                    
                    <p className="text-xs text-center text-indigo-700/70 dark:text-indigo-300/70">
                      Already a subscriber? Start creating your contest entry today!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Social sharing CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Share this contest with your friends:
          </p>
          <div className="flex justify-center gap-3 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full hover:bg-black hover:text-white transition-colors" 
              onClick={shareOnX}
            >
              <XIcon className="h-4 w-4 mr-2" />
              X
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white transition-colors" 
              onClick={shareOnInstagram}
            >
              <Instagram className="h-4 w-4 mr-2" />
              Instagram
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contest; 