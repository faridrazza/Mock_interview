import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import InterviewConfig from '@/pages/InterviewConfig';
import InterviewSession from '@/pages/InterviewSession';
import AdvancedInterviewConfig from '@/pages/AdvancedInterviewConfig';
import AdvancedInterviewQuestions from '@/pages/AdvancedInterviewQuestions';
import AdvancedInterviewSession from '@/pages/AdvancedInterviewSession';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsAndConditions from '@/pages/TermsAndConditions';
import ThankYou from '@/pages/ThankYou';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contest from '@/pages/Contest';
import ModernResumeEditor from '@/pages/ModernResumeEditor';
import ResumePreview from '@/pages/ResumePreview';
import PublicResumePage from '@/pages/PublicResumePage';
import ResumeAILanding from '@/pages/ResumeAI';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PayPalProvider from '@/components/payment/PayPalProvider';
import { HelmetProvider } from 'react-helmet-async';
import AnnouncementBanner from '@/components/layout/AnnouncementBanner';
import { SuppressFragmentWarnings, suppressFragmentWarnings } from '@/utils/WarningSuppress';

// Apply warning suppression before React renders
suppressFragmentWarnings();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PayPalProvider>
          <HelmetProvider>
            <SuppressFragmentWarnings>
              <Toaster />
              <SonnerToaster />
              <BrowserRouter>
                <AnnouncementBanner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/interview/config" element={<InterviewConfig />} />
                  <Route path="/interview/session" element={<InterviewSession />} />
                  <Route path="/advanced-interview/config" element={<AdvancedInterviewConfig />} />
                  <Route path="/advanced-interview/questions" element={<AdvancedInterviewQuestions />} />
                  <Route path="/advanced-interview/session" element={<AdvancedInterviewSession />} />
                  <Route path="/dashboard/resume/:id" element={<ModernResumeEditor />} />
                  <Route path="/dashboard/resume-preview/:id" element={<ResumePreview />} />
                  <Route path="/resume" element={<PublicResumePage />} />
                  <Route path="/resume-ai" element={<ResumeAILanding />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/thank-you" element={<ThankYou />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contest" element={<Contest />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SuppressFragmentWarnings>
          </HelmetProvider>
        </PayPalProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
