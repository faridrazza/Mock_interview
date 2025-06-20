import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Calendar, Users, Play, User as UserIcon, Mail as MailIcon, RefreshCw, Sparkles, Crown, Zap, TrendingUp, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getSubscriptionUsage, getActiveSubscription } from '@/utils/subscriptionUtils';
import { SubscriptionUsage } from '@/types/subscription';
import { formatDate } from '@/lib/utils';

const OverviewTab = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [totalInterviewCount, setTotalInterviewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usageData, setUsageData] = useState<SubscriptionUsage | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());
  const [activeSubscription, setActiveSubscription] = useState<any>(null);

  const fetchTotalInterviewCount = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Fetch standard interviews count
      const { count: standardCount, error: standardError } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (standardError) {
        console.error('Error fetching standard interview count:', standardError);
        return;
      }

      // Fetch advanced interviews count - only count COMPLETED interviews
      const { count: advancedCount, error: advancedError } = await supabase
        .from('advanced_interview_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed'); // Only count completed sessions
      
      if (advancedError) {
        console.error('Error fetching advanced interview count:', advancedError);
        return;
      }
      
      console.log('Fetched completed counts - Standard:', standardCount, 'Advanced:', advancedCount);
      
      // Combine both counts
      const totalCount = (standardCount || 0) + (advancedCount || 0);
      setTotalInterviewCount(totalCount);
    } catch (error) {
      console.error('Error in fetchTotalInterviewCount:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
    
  const fetchUsageData = useCallback(async () => {
    if (!user || !profile) return;
    
    try {
      // Fetch the active subscription to get the end date
      const subscription = await getActiveSubscription(user.id);
      setActiveSubscription(subscription);
      
      // Fetch usage data (which now includes the correct nextReset date)
      const usage = await getSubscriptionUsage(user.id, profile.subscription_tier, true);
      setUsageData(usage);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  }, [user, profile]);
    
  // Refresh data when component mounts or when dashboard is revisited
  useEffect(() => {
    fetchTotalInterviewCount();
    fetchUsageData();
    // Update the lastRefresh timestamp to force a refresh when returned to dashboard
    setLastRefresh(Date.now());
    // Only run on initial mount and when returning to the dashboard after an interview
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a manual refresh function for the user to update the data
  const handleRefresh = () => {
    setIsLoading(true);
    fetchTotalInterviewCount();
    fetchUsageData();
    setLastRefresh(Date.now());
  };

  // Format the nextReset date for display
  const getFormattedNextReset = () => {
    if (usageData?.nextReset) {
      return formatDate(usageData.nextReset);
    }
    
    if (activeSubscription?.end_date) {
      return formatDate(new Date(activeSubscription.end_date));
    }
    
    return "--";
  };

  // Check if user is on free plan or has limited interviews
  const isFreeTierUser = profile?.subscription_tier === 'free' || !profile?.subscription_tier;
  const hasLimitedInterviews = usageData && (usageData.standardInterviewsRemaining < 3 || usageData.advancedInterviewsRemaining < 3);
  const isUnlimitedUser = profile?.subscription_tier === 'diamond' || profile?.subscription_tier === 'megastar';

  // Handle subscription navigation
  const handleSubscriptionNavigation = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      // Check current location to preserve any existing parameters (important for PayPal flows)
      const currentParams = new URLSearchParams(location.search);
      const currentTab = currentParams.get('tab');
      
      if (currentTab === 'subscription') {
        // If already on subscription tab, add a timestamp to force re-render
        // but preserve any existing parameters like success or subscription_id
        currentParams.set('_t', Date.now().toString());
        navigate(`/dashboard?${currentParams.toString()}`, { replace: true });
      } else {
        // Normal navigation to subscription tab
        navigate('/dashboard?tab=subscription');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = '/dashboard?tab=subscription';
    }
  }, [navigate, location]);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Card with Gradient */}
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
            <div>
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-white">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
                  </CardTitle>
                  <CardDescription className="text-blue-100 text-base">
                    Ready to ace your next interview? Let's get started!
              </CardDescription>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Refresh
              </Button>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                  isUnlimitedUser ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black' : 'bg-white/20 text-white'
                }`}>
                  {isUnlimitedUser && <Crown className="h-4 w-4 mr-1" />}
                  {profile?.subscription_tier?.toUpperCase() || 'FREE'}
                </span>
                <p className="text-xs text-blue-100 mt-1 capitalize">{profile?.subscription_status || 'Trial'}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Interviews Completed</p>
                  <p className="text-2xl font-bold text-white">{isLoading ? "..." : totalInterviewCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Next Renewal</p>
                  <p className="text-2xl font-bold text-white">{getFormattedNextReset()}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-0 pb-6">
          <Button 
            className="flex-1 gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold h-12"
            onClick={() => navigate('/interview/config')}
          >
            <Play size={18} />
            Start New Interview
          </Button>
          <Button 
            className="flex-1 gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold h-12"
            onClick={() => navigate('/advanced-interview/config')}
          >
            <Sparkles size={18} />
            Advanced AI Interview
          </Button>
        </CardFooter>
      </Card>

      {/* Subscription Motivation Section - Only show for free/limited users */}
      {(isFreeTierUser || hasLimitedInterviews) && !isUnlimitedUser && (
        <Card className="border-2 border-dashed border-red-300 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 overflow-hidden relative">
          {/* Urgency Banner */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold">⚡ URGENT: Prices will Increase !</span>
              <span className="hidden sm:inline text-xs">Don't miss your chance to get 70% off</span>
            </div>
          </div>
          
          <CardHeader className="pb-4 pt-16">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-red-800 dark:text-red-200">
                    Stop Letting Opportunities Slip Away
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-300 font-semibold">
                    {isFreeTierUser 
                      // ? "Ready to unlock your potential?"
                      // : "Your breakthrough is waiting — don't let interviews run out"
                    }
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Crown className="h-8 w-8 text-yellow-500" />
                {/* <span className="text-xs font-bold text-red-600 dark:text-red-400 mt-1"> LEFT</span> */}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Psychological Message */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you're tired of interviews that lead nowhere, resumes that disappear into black holes, or watching opportunities slip away while you're stuck in endless cycles of rejection — <span className="font-semibold text-blue-700 dark:text-blue-300"> I know how frustrating that can be.</span>
                </p>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  But You're not alone. Maybe you freeze up during interviews, stumble over basic questions, or watch your perfectly crafted resume get filtered out by ATS systems before human eyes ever see it. Maybe you've been told you're "not quite the right fit" one too many times, and that voice in your head whispers you're not good enough.
                </p>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                But here's what I want you to remember: hoping and waiting won't land you that job. What will? <span className="font-semibold text-green-700 dark:text-green-300"> Deliberate practice and strategic preparation.</span>
                </p>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Think about that role you've been dreaming about — the one that makes your heart race when you see the posting. Picture walking into that office on your first day, knowing you earned every step that brought you there. <span className="font-semibold text-green-700 dark:text-green-300">That version of you already exists. They're just waiting for you to put in the work to meet them.</span>
                </p>
                
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-orange-400">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    <span className="text-orange-600 dark:text-orange-400">The difference between dreamers and achievers?</span> Achievers practice until success becomes inevitable.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Unlimited MockInterviews</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">AI Feedback</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">ATS Resume Builder</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-3">
            <p className="text-sm font-bold text-red-700 dark:text-red-300 text-center">
              Only for Active Job Seekers – Get Megastar at 70% Off Before It's Gone!
            </p>
            <Button 
              className="w-full max-w-md bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold h-14 sm:h-14 text-sm sm:text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 px-3 sm:px-6"
              onClick={handleSubscriptionNavigation}
            >
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="text-center">
                <span className="hidden sm:inline">CLAIM 70% OFF NOW - Before Prices Increase!</span>
                <span className="sm:hidden">🔥 CLAIM 70% OFF NOW!</span>
              </span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2 flex-shrink-0" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Usage Statistics */}
      {usageData && !isLoading && !isUnlimitedUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UsageCard 
                title="Standard Interviews"
                used={usageData.standardInterviewsUsed}
                total={usageData.standardInterviewsRemaining === -1 ? "∞" : 
                  usageData.standardInterviewsUsed + usageData.standardInterviewsRemaining}
                remaining={usageData.standardInterviewsRemaining === -1 ? "Unlimited" : 
                  String(usageData.standardInterviewsRemaining)}
                resetDate={usageData.nextReset}
            isLow={usageData.standardInterviewsRemaining < 3 && usageData.standardInterviewsRemaining !== -1}
              />
              <UsageCard 
                title="Advanced Interviews"
                used={usageData.advancedInterviewsUsed}
                total={usageData.advancedInterviewsRemaining === -1 ? "∞" : 
                  usageData.advancedInterviewsUsed + usageData.advancedInterviewsRemaining}
                remaining={usageData.advancedInterviewsRemaining === -1 ? "Unlimited" : 
                  String(usageData.advancedInterviewsRemaining)}
                resetDate={usageData.nextReset}
            isLow={usageData.advancedInterviewsRemaining < 3 && usageData.advancedInterviewsRemaining !== -1}
              />
            </div>
          )}
          
      {/* Unlimited Access Card for Premium Users */}
      {isUnlimitedUser && profile?.subscription_status === 'active' && (
        <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <CardContent className="p-6">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">Unlimited Interview Access</h3>
                  <p className="text-yellow-600 dark:text-yellow-300">Your premium plan includes unlimited interview sessions</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">∞</span>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">No limits!</p>
              </div>
            </div>
        </CardContent>
      </Card>
      )}

      {/* Enhanced Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <QuickTipsCard />
        <ProfileCard />
      </div>
    </div>
  );
};

// Enhanced Usage Card Component
const UsageCard = ({ 
  title, 
  used, 
  total, 
  remaining, 
  resetDate,
  isLow = false
}: { 
  title: string, 
  used: number, 
  total: string | number, 
  remaining: string,
  resetDate?: Date | null,
  isLow?: boolean
}) => (
  <Card className={`${isLow ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {isLow && <Zap className="h-5 w-5 text-red-500" />}
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Used: <span className="font-semibold">{used}</span></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Total: <span className="font-semibold">{total}</span></span>
    </div>
        
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
      {typeof total === 'number' && (
        <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  isLow ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}
          style={{ width: `${Math.min(100, (used / Number(total)) * 100)}%` }}
        ></div>
      )}
      {typeof total === 'string' && total === "∞" && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full w-full"></div>
      )}
    </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Remaining: <span className={`${isLow ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} font-bold`}>
                {remaining}
              </span>
            </span>
      {resetDate && (
              <span className="text-xs text-gray-500">Resets: {formatDate(resetDate)}</span>
            )}
          </div>
        </div>
        
        {isLow && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
            <p className="text-xs text-red-700 dark:text-red-300 font-medium">
              ⚠️ Running low! Consider upgrading to continue your preparation.
    </p>
  </div>
        )}
    </div>
    </CardContent>
  </Card>
);

// Enhanced Quick Tips Card
const QuickTipsCard = () => (
  <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Star className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg">Quick Tips</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-4">
        <li className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-bold">1</div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Practice daily and prepare a quiet environment.</p>
        </li>
        <li className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300 text-sm font-bold">2</div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Start with your target job role and customize the difficulty level.</p>
        </li>
        <li className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-300 text-sm font-bold">3</div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">Review your feedback after each interview to identify areas for improvement.</p>
        </li>
      </ul>
    </CardContent>
  </Card>
);

// Enhanced Profile Card
const ProfileCard = () => {
  const { user, profile } = useAuth();
  
  return (
    <Card className="border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg">Your Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <UserIcon className="h-4 w-4 text-gray-500" />
        <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{profile?.full_name || 'Not set'}</p>
            </div>
        </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <MailIcon className="h-4 w-4 text-gray-500" />
        <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{user?.email}</p>
            </div>
        </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Calendar className="h-4 w-4 text-gray-500" />
        <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewTab;
