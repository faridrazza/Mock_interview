import React, { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AnnouncementBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  // Define pages where banner should be shown or hidden
  const shouldShowBanner = (
    // Pages where banner SHOULD appear
    pathname === '/' || 
    pathname.includes('/dashboard/resume/') ||
    pathname.includes('/dashboard/resume-preview/') ||
    pathname === '/resume' ||
    pathname === '/contest' ||
    pathname === '/contact' ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard?') ||
    
    // Exclude specific pages where banner should NOT appear
    !(pathname.includes('/interview') || 
      pathname === '/auth' ||
      pathname.includes('/advanced-interview'))
  );

  // Set CSS variable for banner height on mount and window resize
  useEffect(() => {
    // Only run the effect if banner should be shown
    if (!shouldShowBanner) return;
    
    const updateBannerHeight = () => {
      const banner = document.querySelector('.announcement-banner');
      if (banner) {
        const height = banner.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--announcement-height', `${height}px`);
      }
    };

    // Initial setup
    updateBannerHeight();

    // Update on resize
    window.addEventListener('resize', updateBannerHeight);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', updateBannerHeight);
    };
  }, [shouldShowBanner]);

  // If we shouldn't show the banner, return null
  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div 
      className="announcement-banner fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-2 px-4 text-center"
      style={{ 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        zIndex: 9999,
      }}
    >
      <div 
        className="container mx-auto flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => navigate('/contest')}
      >
        {/* Mobile version - single line with trophy emoji and no button */}
        <p className="text-sm sm:hidden">
          🏆 Win $100: Join our Practice Mock Interview Contest!
        </p>
        
        {/* Desktop version - with separate elements and button */}
        <div className="hidden sm:flex flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-300" />
            <span className="font-medium">Win $100:</span>
          </div>
          <p className="text-sm">Join Our MockResume Contest!</p>
          <button 
            className="text-xs px-3 py-1 rounded-full bg-white text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/contest');
            }}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner; 