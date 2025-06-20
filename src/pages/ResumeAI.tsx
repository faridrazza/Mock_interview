import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle, Star, ShieldCheck, Users, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

const testimonials = [
  {
    name: 'Priya S.',
    title: 'Hired at Google',
    quote: 'The AI Resume Builder gave me a professional, ATS-optimized resume in minutes. I landed more interviews than ever before!',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    name: 'Rahul M.',
    title: 'Data Scientist',
    quote: 'I loved the instant feedback and beautiful templates. My resume finally stands out and passes every ATS scan.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Emily T.',
    title: 'Marketing Manager',
    quote: 'The builder is so easy to use and the results are stunning. I got a job offer within two weeks!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
];

const faqs = [
  {
    q: 'What is an ATS and why does it matter?',
    a: 'ATS (Applicant Tracking System) is software used by employers to filter resumes. Our builder ensures your resume is formatted to pass ATS scans and reach real recruiters.'
  },
  {
    q: 'Can I download my resume as PDF?',
    a: 'Yes! You can download unlimited PDF versions of your resume in any template.'
  },
  {
    q: 'Is the builder really free to try?',
    a: 'Absolutely. You can create, edit, and preview your resume for free. Upgrade for advanced features.'
  },
  {
    q: 'Do you offer support?',
    a: 'Yes, our team is here to help you succeed. Reach out anytime via chat or email.'
  },
];

const trustLogos = [
  '/images/trust-logo1.png',
  '/images/trust-logo2.png',
  '/images/trust-logo3.png',
  '/images/trust-logo4.png',
];

const ResumeAILanding = () => {
  const navigate = useNavigate();
  const mainImageControls = useAnimationControls();
  const isMobile = useIsMobile();

  useEffect(() => {
    const startAnimation = async () => {
      // First entrance animation
      await mainImageControls.start({ y: 0, opacity: 1, transition: { duration: 0.7, delay: 0.2 } });
      
      // Then start the continuous floating animation
      mainImageControls.start({
        y: [0, -10, 0],
        rotate: [0, -0.5, 0, 0.5, 0],
        transition: { 
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      });
    };

    startAnimation();
  }, [mainImageControls]);

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-white via-indigo-50/30 to-white dark:from-neutral-950 dark:via-indigo-950/10 dark:to-neutral-950 min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-3 pb-4 md:py-8 flex flex-col-reverse md:flex-row items-center gap-4">
          {/* Visual Preview */}
          <motion.div 
            className="w-full md:w-1/2 flex justify-center md:justify-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div 
              className="relative max-w-xs md:max-w-sm lg:max-w-md mt-4 mb-8"
              style={{ 
                perspective: "1000px"
              }}
            >
              <motion.img 
                src="/images/ai-resume-hero.png" 
                alt="AI Resume Builder Preview" 
                className="rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900 bg-white/80"
                style={{ 
                  maxWidth: "100%",
                  height: "auto"
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={mainImageControls}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              />
              {/* Floating formatting tools mockup */}
              <motion.img 
                src="/images/ai-formatting-tools.png" 
                alt="Formatting Tools" 
                className="absolute left-0 -bottom-14 w-36 sm:w-40 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 bg-white" 
                style={{zIndex:2}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  x: [-5, 5, -5],
                  y: [0, -5, 0],
                  rotateZ: [-2, 2, -2],
                  rotateX: [0, 2, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                  opacity: { duration: 0.6, delay: 0.8 },
                  scale: { duration: 0.6, delay: 0.8 },
                  rotateZ: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 } 
                }}
              />
              {/* Floating templates mockup */}
              <motion.img 
                src="/images/ai-templates-mockup.png" 
                alt="Templates & Colors" 
                className="absolute right-0 -top-14 w-36 sm:w-40 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 bg-white" 
                style={{zIndex:2}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  x: [5, -5, 5],
                  y: [0, -7, 0],
                  rotateZ: [2, -2, 2],
                  rotateY: [0, 2, 0],
                }}
                transition={{ 
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                  opacity: { duration: 0.6, delay: 1 },
                  scale: { duration: 0.6, delay: 1 },
                  rotateZ: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
                  rotateY: { duration: 6.5, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 } 
                }}
              />
            </div>
          </motion.div>
          {/* Hero Text */}
          <motion.div 
            className="w-full md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full text-indigo-800 dark:text-indigo-200 shadow-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered & ATS-Optimized</span>
            </motion.div>
            <motion.h1 
              className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">ATS Friendly Resume</span> In Minutes
            </motion.h1>
            <motion.p 
              className="text-lg text-neutral-700 dark:text-neutral-300 mb-8 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.9 }}
            >
              Create a stunning, ATS-friendly resume in minutes. Our AI analyzes your content, optimizes formatting, and helps you stand out to recruiters.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
            >
              <Button 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-full shadow-lg"
                size="lg"
                onClick={() => navigate('/auth?tab=signup')}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline"
                className="text-lg px-8 py-4 rounded-full border-2 border-indigo-400 hover:border-purple-500 text-indigo-700 dark:text-indigo-300"
                size="lg"
                onClick={() => navigate('/resume')}
              >
                Upload Your Resume
              </Button>
            </motion.div>
            <motion.div 
              className="flex gap-8 mt-8 mb-16 sm:mb-8 justify-center md:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.3 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">↑ 49%</div>
                <div className="text-sm text-neutral-500">more interviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">↑ 29%</div>
                <div className="text-sm text-neutral-500">more likely to get a job offer</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 mt-4 sm:mt-8 md:mt-12">
          <h2 className="text-4xl font-bold mb-8 text-center">
            Why Choose Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">AI Resume Builder?</span>
          </h2>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-12 text-center max-w-3xl mx-auto">
            Our AI-powered platform helps you create a standout resume with minimal effort. We've designed every feature to maximize your chances of landing that dream job.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2">
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-7 w-7 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Intelligent AI assistant to build your resume effortlessly</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-7 w-7 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Instant ATS score analysis to ensure your resume gets noticed</span>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-7 w-7 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-lg">Build from scratch or upload existing resume for auto-adaptation</span>
              </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-7 w-7 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-lg">Modern, professional templates for every industry</span>
              </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-7 w-7 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-lg">AI-powered content suggestions & keyword optimization</span>
              </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-7 w-7 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-lg">One-click PDF downloads & easy sharing</span>
              </li>
            </ul>
              <div className="mt-12 mb-16 sm:mb-8 flex justify-center md:justify-start md:pl-11">
                <Button 
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium text-lg px-10 py-3 rounded-full shadow-md flex items-center gap-2 transition-all"
                  onClick={() => navigate('/auth?tab=signup')}
                >
                  Create Your Resume Now
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end md:col-span-3 relative h-[450px] sm:h-[500px] md:h-[550px]">
              {/* Main resume example image */}
              <motion.div 
                className={`absolute z-10 ${isMobile ? 'top-0 left-0 w-[80%]' : 'top-8 left-0 sm:left-5 w-[65%] sm:w-[55%] md:w-[50%]'} shadow-xl rounded-xl overflow-hidden border-2 border-white`}
                initial={{ opacity: 0, y: 20, rotate: -1 }}
                animate={{ opacity: 1, y: 0, rotate: -1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                whileHover={{ 
                  scale: 1.03, 
                  rotate: 0,
                  transition: { duration: 0.3 } 
                }}
              >
                <img 
                  src="/images/a.png" 
                  alt="Resume Example" 
                  className="w-full h-auto bg-white" 
                />
              </motion.div>
              
              {/* Bottom resume example */}
              <motion.div 
                className={`absolute z-20 ${isMobile ? 'bottom-[25%] left-[20%] w-[80%]' : 'bottom-0 left-[20%] sm:left-[25%] w-[65%] sm:w-[55%] md:w-[50%]'} shadow-xl rounded-xl overflow-hidden border-2 border-white`}
                initial={{ opacity: 0, y: 20, rotate: 2 }}
                animate={{ opacity: 1, y: 0, rotate: 2 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
                whileHover={{ 
                  scale: 1.03, 
                  rotate: 1,
                  transition: { duration: 0.3 } 
                }}
              >
                <img 
                  src="/images/b.png" 
                  alt="Resume Example" 
                  className="w-full h-auto bg-white" 
                />
              </motion.div>
              
              {/* ATS optimization interface */}
              <motion.div 
                className={`absolute z-30 ${isMobile ? 'right-0 top-[35%] w-[60%]' : 'right-0 top-[15%] w-[50%] sm:w-[45%] md:w-[45%]'} shadow-xl rounded-xl overflow-hidden border-2 border-white`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.6 }}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.3 } 
                }}
              >
                <div className="bg-white p-2 sm:p-3 rounded-xl">
                  <div className="font-medium text-sm mb-1 text-gray-700">ATS Optimization</div>
                  
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">ATS Compatibility</span>
                      <span className="text-sm font-semibold text-yellow-600">75%</span>
                    </div>
                    
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full" style={{width: "75%"}}></div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2">Your resume needs minor improvements to maximize ATS compatibility.</p>
                    
                    <button className="mt-2 w-full py-1.5 bg-blue-600 text-white text-xs rounded flex items-center justify-center">
                      <span className="mr-1">Re-analyze ATS Compatibility</span>
                    </button>
                  </div>
                </div>
              </motion.div>
          </div>
          </div>
        </section>

        {/* ATS Resume Comparison Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-4xl font-bold mb-8 text-center">
            ATS-Friendly vs. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Non-ATS Friendly</span>
          </h2>
          
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-12 text-center max-w-3xl mx-auto">
            See why an ATS-optimized resume is crucial for your job search success. Our AI builder creates resumes that both humans and applicant tracking systems love.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* ATS-Friendly Resume */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl border border-indigo-100 dark:border-indigo-900 flex flex-col items-center">
              <div className="mb-4 text-xl font-semibold text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2" />
                ATS-Friendly Resume
              </div>
              
              <div className="relative w-full overflow-hidden rounded-xl border border-green-200 dark:border-green-900 mb-4">
                <motion.img 
                  src="/images/ai-resume-hero.png" 
                  alt="ATS-Friendly Resume Example" 
                  className="w-full h-auto"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                  Recommended
                </div>
              </div>
              
              <ul className="space-y-2 text-left w-full">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Clean, structured format that ATS can easily parse</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Industry-relevant keywords strategically placed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Professional, scannable layout for hiring managers</span>
                </li>
              </ul>
            </div>
            
            {/* Non-ATS-Friendly Resume */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl border border-indigo-100 dark:border-indigo-900 flex flex-col items-center">
              <div className="mb-4 text-xl font-semibold text-red-600 dark:text-red-400 flex items-center">
                <X className="h-6 w-6 mr-2" />
                Non-ATS-Friendly Resume
              </div>
              
              <div className="relative w-full overflow-hidden rounded-xl border border-red-200 dark:border-red-900 mb-4">
                <motion.img 
                  src="/images/nonats.png" 
                  alt="Non-ATS-Friendly Resume Example" 
                  className="w-full h-auto"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                />
              </div>
              
              <ul className="space-y-2 text-left w-full">
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span> Looks beautifull but Photo, icons, colored backgrounds can confuses ATS scanners</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Missing relevant keywords for the position</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Cluttered design that turns away hiring managers</span>
              </li>
            </ul>
            </div>
          </div>
          
          <div className="mt-8 mb-8 max-w-3xl mx-auto text-center text-neutral-700 dark:text-neutral-300 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl">
            <p className="italic">
              The right-hand resume looks beautiful—but beauty and ATS-readability often clash. For maximum job-screening success, keep it simple, plain text, standard headings, and clear keyword placement. That way both machines and hiring managers get the best view of your experience.
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium text-lg px-10 py-3 rounded-full shadow-md flex items-center gap-2 transition-all"
              onClick={() => navigate('/auth?tab=signup')}
            >
              Build Your ATS-Friendly Resume
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-b from-white to-indigo-50/30 dark:from-neutral-900 dark:to-indigo-950/20">
          <h2 className="text-4xl font-bold mb-4 text-center">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Questions</span>
          </h2>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-12 text-center max-w-3xl mx-auto">
            Everything you need to know about creating an ATS-friendly resume that gets you noticed
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                What is an ATS and why does it matter?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                ATS (Applicant Tracking System) is software used by 75% of employers to filter resumes. Our builder ensures your resume is properly formatted to pass ATS scans and reach real recruiters, increasing your chances of landing interviews.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                How does the AI Resume Builder work?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Our AI analyzes your experience, skills, and the jobs you're targeting to create an optimized resume. It identifies relevant keywords, suggests content improvements, and formats everything to be ATS-friendly while remaining appealing to hiring managers.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Can I upload my existing resume?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Yes! You can upload your existing resume, and our AI will extract all the information, reformat it according to ATS best practices, and suggest improvements to make it more effective for job applications.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Can I download my resume as PDF?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Yes! You can download unlimited PDF versions of your resume in any of our professionally designed templates.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                How accurate is the ATS score?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Our ATS scoring algorithm was developed by analyzing thousands of successful resumes and incorporates feedback from HR professionals and recruiters. It provides a highly reliable assessment of how well your resume will perform in actual ATS systems.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Is the builder really free to try?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Absolutely. You can create, edit, and preview your resume for free. You can check ATS Score and even take AI help for free. Premium features like downloads are available with our affordable subscription plans.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                How long does it take to create a resume?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Most users create a fully optimized, ATS-friendly resume in less than 15 minutes. If you upload an existing resume, the process is even faster as our AI will do most of the work for you.
              </p>
            </div>
            
            <div className="bg-white dark:bg-neutral-800/70 rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="font-semibold text-xl mb-3 text-indigo-700 dark:text-indigo-300 flex items-start gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-full">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Do you offer support?
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300">
                Yes, our team is here to help you succeed. Reach out anytime via email, and our team will assist you with any questions or challenges you encounter while creating your resume.
              </p>
            </div>
              </div>
          
          <div className="mt-12 flex justify-center">
            <Button 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium text-base px-8 py-2.5 rounded-full shadow-md flex items-center gap-2 transition-all"
              onClick={() => navigate('/auth?tab=signup')}
            >
              Create Your ATS Resume
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default ResumeAILanding;
