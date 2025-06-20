import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, BarChart2, RefreshCw, AlertCircle, Trophy, Target, Zap, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionUsage } from '@/utils/subscriptionUtils';
import { SubscriptionUsage } from '@/types/subscription';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/lib/utils';

const InterviewsTab = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<SubscriptionUsage | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchUsageData = useCallback(async () => {
    if (!user || !profile) return;
    
    try {
      setIsLoading(true);
      const usage = await getSubscriptionUsage(user.id, profile.subscription_tier);
      setUsageData(usage);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (!hasLoaded && user && profile) {
      fetchUsageData();
    }
  }, [user, profile, hasLoaded, fetchUsageData]);

  const renderUsageCard = (title: string, used: number, total: number | string, remaining: number | string, unlimited: boolean, type: 'standard' | 'advanced') => {
    const percentage = unlimited ? 100 : typeof total === 'number' ? Math.min(100, (used / total) * 100) : 0;
    const isStandard = type === 'standard';
    
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative">
        {/* Decorative gradient overlay */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isStandard 
            ? 'from-blue-500 via-purple-500 to-indigo-600' 
            : 'from-pink-500 via-purple-500 to-indigo-600'
        }`} />
        
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                isStandard 
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-br from-pink-500 to-indigo-600'
              }`}>
                {isStandard ? (
                  <Target className="h-6 w-6 text-white" />
                ) : (
                  <Trophy className="h-6 w-6 text-white" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{title}</CardTitle>
          {unlimited ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <CardDescription className="text-yellow-600 dark:text-yellow-400 font-semibold">
                      Unlimited with your plan
                    </CardDescription>
                  </div>
          ) : (
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Used {used} of {total}{remaining !== 0 ? `, ${remaining} remaining` : ''}
            </CardDescription>
          )}
              </div>
            </div>
            
            {/* Usage indicator */}
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                unlimited ? 'text-yellow-500' : 
                percentage > 80 ? 'text-red-500' :
                percentage > 60 ? 'text-orange-500' : 'text-green-500'
              }`}>
                {unlimited ? '∞' : remaining}
              </div>
              <div className="text-xs text-gray-500">
                {unlimited ? 'Unlimited' : 'Left'}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <Progress 
              value={percentage} 
              className={`h-3 ${
                isStandard ? '[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-600' :
                '[&>div]:bg-gradient-to-r [&>div]:from-pink-500 [&>div]:to-indigo-600'
              }`}
            />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">0</span>
              <span className="text-gray-500">{unlimited ? '∞' : total}</span>
          </div>
          {usageData && usageData.nextReset && !unlimited && (
              <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-blue-700 dark:text-blue-300">
              Resets on: {formatDate(usageData.nextReset)}
                </span>
            </div>
          )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleRefreshUsage = () => {
    if (!user || !profile) return;
    
    setIsLoading(true);
    getSubscriptionUsage(user.id, profile.subscription_tier, true)
      .then(usage => {
        setUsageData(usage);
      })
      .catch(error => {
        console.error('Error refreshing usage data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-8">
      {/* Payment failed warning */}
      {profile && profile.subscription_status === 'payment_failed' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 shadow-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300">Subscription Payment Failed</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                <p className="mb-3">Your latest subscription payment has failed. Your interview limits may be affected if the issue is not resolved. Please update your payment method in PayPal.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-50 hover:border-yellow-400 font-semibold"
                  onClick={() => window.open('https://www.paypal.com/myaccount/billing/subscriptions', '_blank')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Interview Options */}
      <div className="space-y-6">
        
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          {/* Standard Interview Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20 overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-7 w-7 text-white" />
        </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Standard Interview
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 font-medium">
              Practice with our AI-powered general interview simulations
            </CardDescription>
                </div>
              </div>
          </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Features included:</span>
                </div>
                <div className="grid gap-3 pl-7">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Select from various job roles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Choose your experience level</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Get detailed feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Practice common interview questions</span>
                  </div>
                </div>
              </div>
          </CardContent>
            
            <CardFooter className="pt-0">
            <Button 
                className="w-full gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]" 
              onClick={() => navigate('/interview/config')}
              disabled={usageData && !isLoading && usageData.standardInterviewsRemaining === 0}
            >
                <Play size={18} />
              Start Standard Interview
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </div>
            </Button>
          </CardFooter>
        </Card>

          {/* Advanced Interview Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-50 via-white to-indigo-50 dark:from-pink-900/20 dark:via-gray-800 dark:to-indigo-900/20 overflow-hidden relative group hover:shadow-2xl transition-all duration-300">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-indigo-400/20 rounded-full blur-xl" />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Advanced Interview
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 font-medium">
              Company-specific interview practice with tailored questions
            </CardDescription>
                </div>
              </div>
          </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Premium features included:</span>
                </div>
                <div className="grid gap-3 pl-7">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Download questions as a PDF</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Role-targeted interview scenarios</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avannce questions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400"> AI feedback and analysis</span>
                  </div>
                </div>
              </div>
          </CardContent>
            
            <CardFooter className="pt-0">
            <Button 
                className="w-full gap-3 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-semibold h-12 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]" 
              onClick={() => navigate('/advanced-interview/config')}
              disabled={usageData && !isLoading && usageData.advancedInterviewsRemaining === 0}
            >
                <Sparkles size={18} />
              Start Advanced Interview
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </div>
            </Button>
          </CardFooter>
        </Card>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your interview data...</p>
        </div>
      )}
    </div>
  );
};

export default InterviewsTab;
