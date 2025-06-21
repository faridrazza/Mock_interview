import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import { invalidateUsageCache } from '@/utils/subscriptionUtils';

const Dashboard = () => {
  const { user, isLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  // Use a ref to track if the initial profile refresh has been done
  const initialRefreshDoneRef = useRef(false);
  // Add a ref to track changes from subscription management
  const subscriptionChangedRef = useRef(false);
  // Track previous tab for detecting tab changes
  const prevTabRef = useRef<string | null>(null);
  // Track if resume plans should be shown
  const [showResumePlans, setShowResumePlans] = useState(false);

  // Extract tab from URL query params if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    // Check for showResumePlans in the location state
    if (location.state && 'showResumePlans' in location.state) {
      setShowResumePlans(!!location.state.showResumePlans);
      // Clear the state to prevent it from persisting across navigation
      window.history.replaceState({}, document.title);
    }

    if (tabParam && ['overview', 'interviews', 'resumes'].includes(tabParam)) {
      // If switching to resumes tab, invalidate usage cache
      if (tabParam === 'resumes' && prevTabRef.current !== 'resumes' && user) {
        console.log('Switching to resumes tab, invalidating usage cache');
        invalidateUsageCache(user.id);
      }
      
      setActiveTab(tabParam);
      prevTabRef.current = tabParam;
    } else if (!tabParam) {
      // If no tab param is present, default to overview
      setActiveTab('overview');
    }
  }, [location.search, location.state, user, location.key]);

  // Refresh user profile data when dashboard loads to get latest subscription info
  // But only do it once when the component mounts or user changes
  useEffect(() => {
    if (user && !initialRefreshDoneRef.current) {
      refreshProfile();
      initialRefreshDoneRef.current = true;
    }
  }, [user]); // Remove refreshProfile from dependencies to prevent loop

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        console.log('No user found, redirecting to auth page');
        navigate('/auth');
      } else {
        setInitialLoadComplete(true);
      }
    }
  }, [user, isLoading, navigate]);

  // Check for selected plan in session storage
  useEffect(() => {
    if (user && initialLoadComplete) {
      const selectedPlanJson = sessionStorage.getItem('selectedPlan');
      const confirmedSubscriptionId = sessionStorage.getItem('confirmedSubscriptionId');
      
      // Only process the selected plan if we have a confirmed subscription ID
      if (selectedPlanJson && confirmedSubscriptionId) {
        try {
          // Parse the selected plan
          const selectedPlan = JSON.parse(selectedPlanJson);
          console.log("Found selected plan in session storage:", selectedPlan);
          
          // Clear from session storage
          sessionStorage.removeItem('selectedPlan');
          sessionStorage.removeItem('confirmedSubscriptionId');
          
          // Mark subscription as changed to trigger a refresh
          subscriptionChangedRef.current = true;
          
          // Verify the subscription is actually active before setting the active tab
          refreshProfile().then(() => {
            // Set active tab to overview since subscription tab is removed
            setActiveTab('overview');
            
            // Update URL without reloading the page
            navigate('/dashboard?tab=overview', { replace: true });
          });
        } catch (err) {
          console.error("Error parsing selected plan from session storage:", err);
          sessionStorage.removeItem('selectedPlan');
          sessionStorage.removeItem('confirmedSubscriptionId');
        }
      }
    }
  }, [user, initialLoadComplete, navigate, refreshProfile]);

  // Reset the initial refresh flag when user changes
  useEffect(() => {
    initialRefreshDoneRef.current = false;
    subscriptionChangedRef.current = false;
  }, [user?.id]);

  if (isLoading || !initialLoadComplete) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout>
      <DashboardTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        showResumePlans={showResumePlans}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
