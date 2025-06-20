import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

// Add type declaration for Vimeo and the global video playing state
declare global {
  interface Window {
    Vimeo?: {
      Player: any;
    };
    videoIsPlaying?: boolean;
  }
}

const Hero = () => {
  const navigate = useNavigate();
  const [videoState, setVideoState] = useState({
    isPlaying: false,
    isBuffering: false,
    hasEnded: false
  });
  const playerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Function to check if the device is mobile
  const isMobileDevice = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth <= 768) // Additional check for small screens
    );
  };

  // Function to initialize Vimeo player with API
  useEffect(() => {
    // Load Vimeo API script
    const loadVimeoAPI = () => {
      if (!window.Vimeo) {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.onload = initializePlayer;
        document.body.appendChild(script);
      } else {
        initializePlayer();
      }
    };

    // Initialize Vimeo player
    const initializePlayer = () => {
      if (window.Vimeo && iframeRef.current) {
        playerRef.current = new window.Vimeo.Player(iframeRef.current);
        
        // Set up event listeners
        playerRef.current.on('play', () => {
          setVideoState(prev => ({ ...prev, isPlaying: true, hasEnded: false }));
          window.videoIsPlaying = true;
        });
        
        playerRef.current.on('pause', () => {
          setVideoState(prev => ({ ...prev, isPlaying: false }));
          window.videoIsPlaying = false;
        });
        
        playerRef.current.on('ended', () => {
          setVideoState(prev => ({ ...prev, isPlaying: false, hasEnded: true }));
          window.videoIsPlaying = false;
        });
        
        playerRef.current.on('bufferstart', () => {
          setVideoState(prev => ({ ...prev, isBuffering: true }));
        });
        
        playerRef.current.on('bufferend', () => {
          setVideoState(prev => ({ ...prev, isBuffering: false }));
        });
      }
    };

    loadVimeoAPI();
    
    return () => {
      // Clean up player
      if (playerRef.current) {
        playerRef.current.off('play');
        playerRef.current.off('pause');
        playerRef.current.off('ended');
        playerRef.current.off('bufferstart');
        playerRef.current.off('bufferend');
      }
    };
  }, []);

  // Function to handle play button click
  const handlePlayClick = () => {
    if (playerRef.current) {
      if (videoState.hasEnded) {
        // If video has ended, restart from beginning
        playerRef.current.setCurrentTime(0).then(() => {
          playerRef.current.play();
        });
      } else {
        // Normal play without going fullscreen
        playerRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    } else {
      // Fallback for when Vimeo API isn't loaded - update iframe src
      const iframe = iframeRef.current;
      if (iframe) {
        // Add autoplay parameter without fullscreen
        if (!iframe.src.includes('autoplay=1')) {
          iframe.src = iframe.src.replace('autopause=0', 'autopause=0&autoplay=1');
        }
      }
    }
  };

  // Function to handle View Demo button click
  const handleViewDemo = () => {
    // Scroll to the video container
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      
      // Short delay to ensure scroll completes before playing
      setTimeout(() => {
        handlePlayClick();
      }, 800);
    }
  };

  // Add a special class to isolate the video container from SplashCursor effects
  useEffect(() => {
    // Initially set the global flag to false
    window.videoIsPlaying = false;
    
    if (videoContainerRef.current) {
      // Add a class to ensure this element is on top of SplashCursor
      videoContainerRef.current.classList.add('video-container-isolated');
    }

    // Add style element programmatically to avoid JSX style issues
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .video-container-isolated {
        position: relative;
        z-index: 100 !important; /* Higher than SplashCursor's z-index of 50 */
        pointer-events: auto !important;
        isolation: isolate;
        transform: translateZ(0); /* Force hardware acceleration */
      }
      
      .video-container-isolated iframe {
        z-index: 101 !important;
        position: relative;
        transform: translateZ(0); /* Force hardware acceleration */
        will-change: transform; /* Hint for browser optimization */
      }
      
      /* Create a blocker div that will prevent splash cursor effects under the video */
      .splash-cursor-blocker {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        pointer-events: none;
        z-index: 49; /* Just below the splash cursor */
      }
    `;
    document.head.appendChild(styleElement);

    // Clean up style on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <section className="relative pb-16 md:pb-24 overflow-hidden" 
      style={{ 
        backgroundColor: "#fffafa", 
        position: "relative", 
        zIndex: 1
      }}
    >
      {/* Very subtle pink border at the bottom to differentiate from the section below */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-pink-100/40"></div>
      
      {/* Simple solid background - removed all gradient effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden" style={{ backgroundColor: "#fffafa" }}></div>

      <div className="container px-4 md:px-6 pt-8 md:pt-12">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <div className="animate-fade-in space-y-4 max-w-4xl mt-4 md:mt-6">
            <div className="inline-block mb-4 px-4 py-1.5 bg-gradient-to-r from-indigo-100 to-pink-100 text-indigo-800 dark:text-indigo-200 dark:from-indigo-900/40 dark:to-pink-900/40 rounded-full text-sm font-medium animate-slide-in-down shadow-sm">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Interview Practice
              </span>
            </div>
            <h1 className="font-bold leading-tight tracking-tighter max-w-full">
              <span className="block text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-0 mx-auto text-center">Nail Your Next Interview</span>
              <span className="animated-gradient-text text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 text-3xl sm:text-4xl md:text-5xl lg:text-6xl mx-auto text-center block pb-1 sm:pb-2 md:pb-3 leading-normal md:leading-relaxed">With AI Driven Practice</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 animate-slide-in-up opacity-0 text-center" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
              Transform your interview skills with our AI avatar that simulate real interviews, 
              provide personalized feedback, and help you land your dream job.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-up opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full px-8 py-6 text-base shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all border-0"
              onClick={() => navigate('/auth')}
            >
              Try Free Interview
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="rounded-full px-8 py-6 text-base border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700 shadow-sm hover:shadow-md transition-all"
              onClick={() => navigate('/contest')}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Win $100
            </Button>
          </div>

          <div 
            ref={videoContainerRef}
            className="w-full max-w-5xl mt-12 relative animate-slide-in-up opacity-0" 
            style={{ 
              animationDelay: "600ms", 
              animationFillMode: "forwards",
              isolation: "isolate", // CSS isolation to create a stacking context
              position: "relative", 
              zIndex: 100 // Much higher than SplashCursor
            }}
          >
            {/* Add a blocker div to create a "safe zone" for the video */}
            <div className="splash-cursor-blocker"></div>
            
            <div 
              className="aspect-video relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-indigo-200/50 dark:ring-indigo-900/50 transition-all hover:shadow-indigo-500/20 hover:ring-indigo-300/50 dark:hover:ring-indigo-700/50"
              onClick={!videoState.isPlaying ? handlePlayClick : undefined}
            >
              {/* Vimeo Video Embed - With hidden controls - add extra layer to isolate */}
              <div className="absolute inset-0 bg-black" style={{ zIndex: 101 }}></div>
              <div style={{ padding: '56.25% 0 0 0', position: 'relative', zIndex: 102 }}>
                <iframe 
                  ref={iframeRef}
                  src="https://player.vimeo.com/video/1076638040?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&sidedock=0&controls=0&dnt=1&muted=0&pip=0&rel=0&loop=0" 
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    transform: 'translateZ(0)', // Force hardware acceleration
                    willChange: 'transform' // Hint for browser optimization
                  }} 
                  frameBorder="0" 
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                  title="MockInterview4u | Master Your Interviews with AI-Driven Practice"
                  loading="eager"
                ></iframe>
              </div>
              
              {/* Custom play button overlay that appears when not playing or when video has ended */}
              {(!videoState.isPlaying || videoState.hasEnded) && (
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer" 
                  onClick={handlePlayClick}
                  style={{ zIndex: 103 }}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition-all duration-300 transform translate-x-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-8 md:h-8 text-white">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
