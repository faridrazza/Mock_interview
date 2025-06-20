import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, Facebook, Instagram, Linkedin } from 'lucide-react';

// Custom X (formerly Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToSection = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50/30 to-indigo-100/40 dark:from-neutral-950 dark:via-indigo-950/20 dark:to-indigo-900/10 border-t border-indigo-100 dark:border-indigo-950/50">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl dark:bg-indigo-900/20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl dark:bg-purple-900/20"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
      </div>

      <div className="container px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          {/* Company info */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-bold text-2xl mb-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Mockinterview4u
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 text-sm leading-relaxed">
            AI-powered interview preparation platform that helps you practice and improve your interview skills
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-white p-2.5 rounded-full text-indigo-500 hover:text-white hover:bg-indigo-500 shadow-sm border border-indigo-100 hover:border-indigo-500 transition-all duration-300 hover:scale-110 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-indigo-500"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://x.com/mockinterview4u" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2.5 rounded-full text-indigo-500 hover:text-white hover:bg-indigo-500 shadow-sm border border-indigo-100 hover:border-indigo-500 transition-all duration-300 hover:scale-110 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-indigo-500"
                aria-label="X (formerly Twitter)"
              >
                <XIcon className="h-4 w-4" />
              </a>
              <a 
                href="https://www.instagram.com/mockinterview4u_?igsh=bWprNzJja2U0YnVl" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2.5 rounded-full text-indigo-500 hover:text-white hover:bg-indigo-500 shadow-sm border border-indigo-100 hover:border-indigo-500 transition-all duration-300 hover:scale-110 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-indigo-500"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://www.linkedin.com/company/mockinterview4u/" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-2.5 rounded-full text-indigo-500 hover:text-white hover:bg-indigo-500 shadow-sm border border-indigo-100 hover:border-indigo-500 transition-all duration-300 hover:scale-110 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-indigo-500"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-5 text-base relative inline-block">
              Pages
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors text-left flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors text-left flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  How It Works
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors text-left flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Pricing
                </button>
              </li>
              <li>
                <Link 
                  to="/blog"
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/resume"
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  ATS Score
                </Link>
              </li>
              <li>
                <Link 
                  to="/resume-ai"
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  ATS Resume Builder
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-5 text-base relative inline-block">
              Links
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-and-conditions" 
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Report a Problem
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-5 text-base relative inline-block">
              Support
              <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></span>
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <a 
                  href="mailto:company@mockinterview4u.com" 
                  className="text-neutral-600 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 transition-colors flex items-center group"
                >
                  <span className="w-0 h-px bg-indigo-500 mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  company@mockinterview4u.com
                </a>
                <div className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Need help? Our support team is just an email away.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-200 to-transparent dark:via-indigo-800/50 my-10"></div>
        
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            © {new Date().getFullYear()} Mockinterview4u. All rights reserved.
          </p>
          <button 
            onClick={scrollToTop}
            className="mt-6 md:mt-0 flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-700 rounded-full transition-all duration-300 group"
          >
            Back to top
            <ArrowUp className="h-4 w-4 group-hover:transform group-hover:-translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
