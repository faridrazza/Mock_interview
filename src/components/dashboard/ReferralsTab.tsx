
import React from 'react';
import { Copy, Share2, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ReferralsTab = () => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleCopyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard."
      });
    }
  };

  const handleShareReferral = () => {
    if (profile?.referral_code) {
      const shareUrl = `${window.location.origin}/?ref=${profile.referral_code}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Join Interview Prep Pro',
          text: 'Improve your interview skills with AI-powered mock interviews!',
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Copied!",
          description: "Referral link copied to clipboard."
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle>Refer and Earn</CardTitle>
          <CardDescription>
            Share Interview Prep Pro with friends and earn 20% commission on their subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Your Referral Code</h3>
            <div className="flex items-center justify-center">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg px-6 py-3 font-mono text-lg text-brand-600 dark:text-brand-400 inline-flex items-center">
                {profile?.referral_code || 'LOADING...'}
                <button 
                  onClick={handleCopyReferralCode}
                  className="ml-3 text-neutral-500 hover:text-brand-600 dark:hover:text-brand-400"
                  aria-label="Copy referral code"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-4">
              Share this code with friends or use the buttons below
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mx-auto max-w-md">
            <Button variant="outline" onClick={handleCopyReferralCode} className="flex-1 gap-2">
              <Copy size={16} />
              Copy Referral Link
            </Button>
            <Button variant="outline" onClick={handleShareReferral} className="flex-1 gap-2">
              <Share2 size={16} />
              Share via Email
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ReferralStat label="Total Referrals" value="0" />
            <ReferralStat label="Active Subscribers" value="0" />
            <ReferralStat label="Total Earned" value="$0" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            Track your referrals and earned commissions
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Referrals Yet</h3>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            Start sharing your referral code to see your earnings here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ReferralStat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 text-center">
    <h4 className="text-sm text-neutral-500 mb-1">{label}</h4>
    <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
  </div>
);

export default ReferralsTab;
