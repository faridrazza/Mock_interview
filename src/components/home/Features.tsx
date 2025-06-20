import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Mic, 
  UserCircle, 
  Award,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { SplashCursor } from "@/components/ui/splash-cursor";

// The global variable declaration can remain for future use, but we'll
// no longer use it to conditionally render the SplashCursor
declare global {
  interface Window {
    videoIsPlaying?: boolean;
  }
}

const featureItems = [
  {
    icon: <UserCircle className="h-6 w-6 text-indigo-500" />,
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    title: "Lifelike AI Avatar",
    description: "Interact with realistic 3D avatar that respond naturally to your answers, creating an authentic interview experience."
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    title: "Adaptive Questioning",
    description: "Our AI adjusts questions based on your responses, just like a real interviewer would, creating a dynamic conversation."
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    title: "Detailed Feedback",
    description: "Receive scores on key areas like communication and technical skills, along with insights on strengths and areas for improvement."
  },
  {
    icon: <Clock className="h-6 w-6 text-teal-500" />,
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    title: "On-Demand Practice",
    description: "Prepare anytime, anywhere with unlimited access to interviews for different job roles and experience levels."
  },
  {
    icon: <Mic className="h-6 w-6 text-pink-500" />,
    bgColor: "bg-pink-100 dark:bg-pink-900/30",
    title: "Voice & Text Input",
    description: "Choose your preferred way to respond—speak naturally or type your answers for flexibility in how you practice."
  },
  {
    icon: <Award className="h-6 w-6 text-amber-500" />,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    title: "Judgment Free",
    description: "A judgment-free platform to practice mock interviews and build confidence in a safe environment."
  }
];

const Features = () => {
  // State to track which feature is currently being auto-hovered
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(-1);
  const [isUserHovering, setIsUserHovering] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Refs for scroll-based activation
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Set up intersection observer for mobile scroll-based activation
  useEffect(() => {
    if (!isMobile) return;
    
    // Create intersection observer
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.6, // 60% of the item visible
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Find the index of the intersecting element
          const index = featureRefs.current.findIndex(ref => ref === entry.target);
          if (index !== -1) {
            setActiveFeatureIndex(index);
          }
        }
      });
    }, options);
    
    // Observe all feature elements
    featureRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      featureRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [isMobile, featureRefs.current.length]);
  
  // Auto-cycle through features if not mobile and user is not hovering
  useEffect(() => {
    if (isUserHovering || isMobile) return;
    
    const interval = setInterval(() => {
      setActiveFeatureIndex((prevIndex) => {
        // Cycle through all features
        return (prevIndex + 1) % featureItems.length;
      });
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(interval);
  }, [isUserHovering, isMobile]);
  
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* SplashCursor component commented out 
      <SplashCursor 
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1024}
        DENSITY_DISSIPATION={4}
        VELOCITY_DISSIPATION={2.5}
        PRESSURE={0.8}
        SPLAT_RADIUS={0.25}
        CURL={30}
        SPLAT_FORCE={6000}
        COLOR_UPDATE_SPEED={5}
        BACK_COLOR={{ r: 0, g: 0, b: 0.2 }}
      />
      */}
      
      {/* Enhanced Background with more vibrant gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 dark:from-indigo-950/30 dark:via-neutral-900 dark:to-purple-950/30"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-70"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full text-indigo-800 dark:text-indigo-200 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">Key Features</span>
          </div>
          <h2 className="mb-4">Advanced Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Interview Success</span></h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-lg">
            Our platform combines cutting-edge AI and 3D technology to deliver 
            the most effective interview preparation experience possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {featureItems.map((feature, index) => (
            <div
              key={index}
              ref={el => featureRefs.current[index] = el}
              className={cn(
                "relative overflow-hidden rounded-xl p-6 border border-transparent",
                "bg-white/95 dark:bg-neutral-800/80 shadow-lg hover:shadow-xl",
                "transition-all duration-500 ease-out",
                // Apply hover effects both for auto-selected and when scrolled into view on mobile
                (activeFeatureIndex === index && (isMobile || !isUserHovering)) ? "-translate-y-2 auto-hover-active" : "",
                "group",
                "backdrop-blur-sm feature-card"
              )}
              onMouseEnter={() => !isMobile && setIsUserHovering(true)}
              onMouseLeave={() => !isMobile && setIsUserHovering(false)}
            >
              {/* Animated gradient background on hover or when active */}
              <div className={cn(
                "absolute inset-0 transition-opacity duration-500 bg-gradient-to-r from-indigo-600/95 via-purple-600/95 to-pink-600/95 dark:from-indigo-700/95 dark:via-purple-700/95 dark:to-pink-700/95",
                (activeFeatureIndex === index && (isMobile || !isUserHovering)) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></div>
              
              {/* Glowing effect at hover or when active */}
              <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur transition-all duration-500",
                (activeFeatureIndex === index && (isMobile || !isUserHovering)) ? "opacity-30" : "opacity-0 group-hover:opacity-30"
              )}></div>
              
              {/* Icon wrapper - updated to match InterviewStruggles styling */}
              <div className={`h-12 w-12 rounded-full ${feature.bgColor} flex items-center justify-center mb-4 transition-transform duration-300 ${(activeFeatureIndex === index && (isMobile || !isUserHovering)) ? "scale-110" : "group-hover:scale-110"}`}>
                {feature.icon}
              </div>
              
              {/* Content with hover effect */}
              <div className="relative">
                <h3 className={cn(
                  "text-xl font-semibold mb-2 transition-colors duration-300",
                  (activeFeatureIndex === index && (isMobile || !isUserHovering)) 
                    ? "text-white" 
                    : "text-neutral-800 dark:text-white group-hover:text-white"
                )}>{feature.title}</h3>
                <p className={cn(
                  "transition-colors duration-300",
                  (activeFeatureIndex === index && (isMobile || !isUserHovering))
                    ? "text-white/90"
                    : "text-neutral-600 dark:text-neutral-400 group-hover:text-white/90"
                )}>{feature.description}</p>
              </div>
              
              {/* Decorative elements */}
              <div className={cn(
                "absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-indigo-500/10 to-transparent rounded-tl-full transition-all duration-500",
                (activeFeatureIndex === index && (isMobile || !isUserHovering)) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></div>
              <div className={cn(
                "absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-transparent rounded-br-full transition-all duration-500",
                (activeFeatureIndex === index && (isMobile || !isUserHovering)) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
