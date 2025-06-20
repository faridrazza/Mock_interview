import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import HowItWorks from '@/components/home/HowItWorks';
import InterviewStruggles from '@/components/home/InterviewStruggles';
import SolutionsSection from '@/components/home/SolutionsSection';
import Pricing from '@/components/home/Pricing';
import CTASection from '@/components/home/CTASection';
import Footer from '@/components/home/Footer';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    // Check if there's a hash in the URL
    if (location.hash) {
      // Extract the element ID from the hash
      const elementId = location.hash.substring(1);
      
      // Wait for DOM to be fully loaded
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/30 transition-colors duration-500">
      {/* Enhanced Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -right-40 w-[60%] h-[50%] bg-gradient-to-b from-indigo-200/20 via-purple-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[60%] h-[50%] bg-gradient-to-t from-pink-200/20 via-indigo-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>
      
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <InterviewStruggles />
        <SolutionsSection />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
