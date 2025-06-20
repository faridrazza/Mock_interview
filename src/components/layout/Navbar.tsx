import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Add padding to body to account for fixed navbar and announcement banner
  useEffect(() => {
    // Create and append style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      body {
        padding-top: calc(var(--announcement-height, 32px) + 70px);
      }
      
      @media (min-width: 640px) {
        body {
          padding-top: calc(var(--announcement-height, 32px) + 80px);
        }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle scrolling to sections
  const scrollToSection = (elementId) => {
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    
    // Check if we're on the contact page or another non-home page
    if (location.pathname === '/contact' || (location.pathname !== '/' && location.pathname !== '/home')) {
      // Navigate to home page with hash for the section
      navigate(`/#${elementId}`);
      return;
    }
    
    // We're on the home page, scroll to the element
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header 
      className={`fixed left-0 right-0 transition-all duration-300 py-3 sm:py-4 px-4 sm:px-6 md:px-10 
      ${isScrolled 
        ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-sm border-b border-indigo-100/50 dark:border-indigo-900/20' 
        : 'bg-white/80 dark:bg-neutral-900/90 backdrop-blur-sm'}`}
      style={{ 
        top: 'var(--announcement-height, 32px)', // Use CSS variable for responsive height
        zIndex: 9998 // Just below the announcement banner
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - adjusted for better mobile display */}
        <Link to="/" className="flex items-center">
          <span className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
            Mockinterview4u
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <button 
            onClick={() => scrollToSection('features')}
            className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-normal bg-transparent border-none p-0 cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-normal bg-transparent border-none p-0 cursor-pointer"
          >
            Pricing
          </button>
          <Link 
            to="/contest"
            className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 relative"
          >
            Contest
            <Badge className="bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white border-0 py-0 h-5 flex items-center">
              <Sparkles className="h-3 w-3 mr-0.5" />
              <span className="text-[10px]">New</span>
            </Badge>
          </Link>
          <Link 
            to="/resume" 
            className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ATS Score
          </Link>
          <Link 
            to="/resume-ai" 
            className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ATS Resume Builder
          </Link>
          <Link 
            to="/contact" 
            className="text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="outline" 
            className="rounded-full px-6 border-indigo-200 hover:border-indigo-400 dark:border-indigo-800 dark:hover:border-indigo-600" 
            onClick={() => navigate('/auth')}
          >
            Log in
          </Button>
          <Button 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-6 border-0 shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30" 
            onClick={() => navigate('/auth?tab=signup')}
          >
            Sign up
          </Button>
        </div>

        {/* Mobile Menu Button - improved with better padding and size */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden flex items-center justify-center p-1.5 text-neutral-700 dark:text-neutral-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors" 
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu with enhanced styling */}
      <div 
        className={`fixed inset-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`} 
        style={{ top: '0', height: '100vh', paddingTop: '80px' }}
      >
        <button 
          onClick={toggleMenu}
          className="absolute top-4 right-6 p-3 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        
        <nav className="flex flex-col p-6 space-y-6 text-lg">
          <Link 
            to="/" 
            onClick={() => setIsMenuOpen(false)} 
            className="py-2 text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Home
          </Link>
          <button 
            onClick={() => scrollToSection('features')} 
            className="py-2 text-left text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-lg font-normal bg-transparent border-none p-0 cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('pricing')} 
            className="py-2 text-left text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-lg font-normal bg-transparent border-none p-0 cursor-pointer"
          >
            Pricing
          </button>
          <Link
            to="/contest"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
          >
            Contest
            <Badge className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white border-0 py-0 h-5 flex items-center">
              <Sparkles className="h-3 w-3 mr-0.5" />
              <span className="text-[10px]">New</span>
            </Badge>
          </Link>
          <Link 
            to="/resume"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ATS Score
          </Link>
          <Link 
            to="/resume-ai"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ATS Resume Builder
          </Link>
          <Link 
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="py-2 text-neutral-700 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Contact
          </Link>
          <div className="pt-4 space-y-4">
            <Button 
              variant="outline" 
              className="w-full rounded-full justify-center border-indigo-200 hover:border-indigo-400 dark:border-indigo-800 dark:hover:border-indigo-600" 
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/auth');
              }}
            >
              Log in
            </Button>
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full justify-center border-0 shadow-md" 
              onClick={() => {
                setIsMenuOpen(false);
                navigate('/auth?tab=signup');
              }}
            >
              Sign up
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
