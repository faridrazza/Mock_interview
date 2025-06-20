import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, FileUp, Trash2, ExternalLink, Loader2, MoreHorizontal, Pencil, Eye, Clock, Lock, Crown, TrendingUp, CheckCircle, ArrowRight, AlertTriangle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Resume } from '@/types/resume';
import { getUserResumes, createResume, createBlankResume, deleteResume } from '@/lib/resume';
import { useAuth } from '@/contexts/AuthContext';
import ResumeUploader from './ResumeUploader';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { getScoreColorClass } from '@/utils/resume';
import { canCreateResume, getSubscriptionUsage, invalidateUsageCache } from '@/utils/subscriptionUtils';

const ResumesTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingResume, setCreatingResume] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'upload'>('create');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [resumeUsage, setResumeUsage] = useState<{used: number, remaining: number} | null>(null);
  
  useEffect(() => {
    if (user) {
      // When the component mounts or user/profile changes, invalidate cache first
      if (profile) {
        invalidateUsageCache(user.id);
      }
      fetchResumes();
      fetchResumeUsage();
    } else {
      setLoading(false);
      setError('Please sign in to create and manage resumes');
    }
  }, [user, profile]);
  
  const fetchResumeUsage = async () => {
    if (!user || !profile) return;
    
    try {
      // First check for a dedicated resume subscription
      const tierToUse = profile.resume_subscription_tier && 
                       profile.resume_subscription_status === 'active' 
                       ? profile.resume_subscription_tier 
                       : profile.subscription_tier || 'free';
      
      console.log('Using tier for resume limits:', tierToUse);
                       
      // Force a refresh to ensure we're getting the latest data
      const usage = await getSubscriptionUsage(user.id, tierToUse, true);
      if (usage && usage.resumesUsed !== undefined && usage.resumesRemaining !== undefined) {
        setResumeUsage({
          used: usage.resumesUsed,
          remaining: usage.resumesRemaining
        });
      }
    } catch (error) {
      console.error('Error fetching resume usage:', error);
    }
  };
  
  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserResumes();
      setResumes(data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load resumes. Please ensure you are signed in and try again.');
      toast({
        title: 'Error loading resumes',
        description: 'There was an error loading your resumes. Please ensure you are signed in and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenCreateDialog = async () => {
    if (!user || !profile) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a resume',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Determine which tier to use for checking resume limits
      const tierToUse = profile.resume_subscription_tier && 
                       profile.resume_subscription_status === 'active' 
                       ? profile.resume_subscription_tier 
                       : profile.subscription_tier || 'free';
      
      // Check if user can create more resumes
      const canCreate = await canCreateResume(user.id, tierToUse);
      
      if (!canCreate) {
        setShowSubscriptionDialog(true);
        return;
      }
      
      // User can create more resumes, open the dialog
      setIsCreateDialogOpen(true);
    } catch (error) {
      console.error('Error checking resume creation limits:', error);
      toast({
        title: 'Error',
        description: 'There was an error checking your subscription. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleNavigateToPlans = () => {
    setShowSubscriptionDialog(false);
    navigate('/dashboard?tab=subscription', {
      state: { showResumePlans: true }
    });
  };
  
  const handleCreateResume = async () => {
    if (!user || !profile) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a resume',
        variant: 'destructive',
      });
      return;
    }
    
    if (!newResumeTitle.trim()) {
      toast({
        title: 'Resume title required',
        description: 'Please provide a title for your resume.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Determine which tier to use for checking resume limits
      const tierToUse = profile.resume_subscription_tier && 
                       profile.resume_subscription_status === 'active' 
                       ? profile.resume_subscription_tier 
                       : profile.subscription_tier || 'free';
      
      // Check again if user can create more resumes
      const canCreate = await canCreateResume(user.id, tierToUse);
      
      if (!canCreate) {
        setIsCreateDialogOpen(false);
        setShowSubscriptionDialog(true);
        return;
      }
      
      setCreatingResume(true);
      setError(null);
      const blankContent = createBlankResume();
      const resume = await createResume(newResumeTitle, blankContent, jobDescription.trim() || undefined);
      
      toast({
        title: 'Resume created',
        description: 'Your resume has been created successfully.',
      });
      
      setNewResumeTitle('');
      setJobDescription('');
      setIsCreateDialogOpen(false);
      
      // Add the new resume to the list or refresh the list
      setResumes(prev => [resume, ...prev]);
      
      // Refresh usage
      fetchResumeUsage();
      
      // Navigate to the resume editor
      navigate(`/dashboard/resume/${resume.id}`);
    } catch (error: any) {
      console.error('Error creating resume:', error);
      
      if (error.message && error.message.includes('reached your resume creation limit')) {
        setIsCreateDialogOpen(false);
        setShowSubscriptionDialog(true);
      } else {
        setError('Failed to create resume. Please ensure you are signed in and try again.');
        toast({
          title: 'Error creating resume',
          description: 'There was an error creating your resume. Please ensure you are signed in and try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setCreatingResume(false);
    }
  };
  
  const handleDeleteResume = async (id: string) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to delete a resume',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setDeletingId(id);
      setError(null);
      await deleteResume(id);
      setResumes(resumes.filter(resume => resume.id !== id));
      
      toast({
        title: 'Resume deleted',
        description: 'Your resume has been deleted successfully.',
      });
      
      // Refresh usage after deletion
      fetchResumeUsage();
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: 'Error deleting resume',
        description: 'There was an error deleting your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };
  
  // Handle when a resume is successfully uploaded and created
  const handleUploadComplete = (resume: Resume) => {
    setIsCreateDialogOpen(false);
    setResumes(prev => [resume, ...prev]);
    
    // Refresh usage after upload
    fetchResumeUsage();
    
    navigate(`/dashboard/resume/${resume.id}`);
  };
  
  // Check if user should see subscription motivation
  const shouldShowSubscriptionMotivation = () => {
    if (!profile) return false;
    
    // Show if user is on free plan
    const isFreeTier = profile.subscription_tier === 'free' || !profile.subscription_tier;
    
    // Show if user has limited resume access
    const hasLimitedResumes = resumeUsage && resumeUsage.remaining !== -1 && resumeUsage.remaining < 5;
    
    // Show if user has no resume subscription but has interview subscription
    const hasInterviewButNoResume = profile.subscription_tier && 
                                  !['gold', 'diamond', 'megastar'].includes(profile.subscription_tier) &&
                                  !profile.resume_subscription_tier;
    
    // Don't show for unlimited users
    const isUnlimitedUser = profile.subscription_tier === 'diamond' || 
                           profile.subscription_tier === 'megastar' ||
                           profile.resume_subscription_tier === 'resume_premium';
    
    return (isFreeTier || hasLimitedResumes || hasInterviewButNoResume) && !isUnlimitedUser;
  };

  // Handle subscription navigation
  const handleSubscriptionNavigation = () => {
    navigate('/dashboard?tab=subscription', {
      state: { showResumePlans: true }
    });
  };
  
  // Display authentication error if user is not signed in
  if (!user && !loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-1">ATS Resume Builder</h2>
          <p className="text-sm text-muted-foreground">Create and manage your ATS-optimized resumes</p>
        </div>
        
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Please sign in to create and manage your ATS-optimized resumes.
            </p>
            <Button onClick={() => navigate('/auth')} className="gap-2">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">ATS Resume Builder</h2>
          <p className="text-sm text-muted-foreground">Create and manage your ATS-optimized resumes</p>
          
          {resumeUsage && (
            <div className="text-xs text-muted-foreground mt-2">
              <span className="font-medium">
                {resumeUsage.remaining > 0 
                  ? `${resumeUsage.remaining} resumes remaining` 
                  : resumeUsage.remaining === -1 
                    ? "Unlimited resumes available" 
                    : "Resume limit reached"}
              </span>
              {resumeUsage.remaining !== -1 && (
                <span> ({resumeUsage.used} used)</span>
              )}
            </div>
          )}
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button className="gap-2" onClick={handleOpenCreateDialog}>
            <Plus size={16} />
            Create New Resume
          </Button>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Resume</DialogTitle>
              <DialogDescription>
                Start building your ATS-optimized resume. You can create a new resume or upload an existing one.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="create" value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'upload')}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="create" className="gap-2">
                  <Plus size={14} />
                  Create from Scratch
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <FileUp size={14} />
                  Upload Resume
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="create" className="mt-0">
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Resume Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Software Engineer Resume"
                      value={newResumeTitle}
                      onChange={(e) => setNewResumeTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">
                      Job Description (Optional)
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here to optimize your resume for this specific position..."
                      className="h-32"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Adding a job description helps our AI tailor your resume for better ATS compatibility.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateResume} disabled={creatingResume}>
                    {creatingResume ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Resume'
                    )}
                  </Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="upload" className="mt-0">
                <ResumeUploader 
                  onUploadComplete={handleUploadComplete}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        {/* Subscription Required Dialog */}
        <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resume Limit Reached</DialogTitle>
              <DialogDescription>
                You've reached the maximum number of resumes for your current plan.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                <Lock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Upgrade to create more resumes</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Our Resume Basic plan ($2/month) allows creating up to 15 resumes, while Resume Premium ($6/month) allows up to 50 resumes.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleNavigateToPlans}>
                View Resume Plans
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Resume-Focused Subscription Motivation Section */}
      {shouldShowSubscriptionMotivation() && (
        <Card className="border-2 border-dashed border-orange-300 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 overflow-hidden relative">
          {/* Urgency Banner */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-600 to-red-600 text-white py-2 px-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold">🚨 RESUME ALERT: Your resume might be getting filtered out!</span>
              <span className="hidden sm:inline text-xs"> Want to Beat the ATS?</span>
            </div>
          </div>
          
          <CardHeader className="pb-4 pt-16">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-orange-800 dark:text-orange-200">
                    Stop Your Resume From Being Ignored
                  </CardTitle>
                  <CardDescription className="text-orange-600 dark:text-orange-300 font-semibold">
                    {/* Breaking through ATS filters and landing interviews starts here */}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Target className="h-8 w-8 text-red-500" />
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1">ATS READY</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Psychological Message focused on Resume Pain Points */}
            <div className="bg-gradient-to-r from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="font-semibold text-red-700 dark:text-red-300">Here's the brutal truth:</span> Almost every major company relies on Applicant Tracking Systems (ATS) to streamline hiring — in fact, 97% of Fortune 500 companies use ATS to manage resumes. Your perfect experience, your achievements, your potential — all filtered out before anyone knows you exist.
                </p>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Maybe you've sent hundreds of applications into the void. Maybe you've watched less qualified candidates get interviews while yours disappear into digital black holes. <span className="font-semibold text-orange-700 dark:text-orange-300">The system isn't broken — you just don't know how to play the game.</span>
                </p>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  But what if I told you the difference between getting ignored and getting interviews isn't your qualifications? <span className="font-semibold text-green-700 dark:text-green-300">It's knowing exactly how ATS systems think, what keywords they scan for, and how to structure your resume to score in the top 10%.</span>
                </p>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Imagine uploading your resume and watching it consistently land in the "interview" pile instead of the trash. Picture getting called back within days instead of weeks of silence. <span className="font-semibold text-green-700 dark:text-green-300">That's not luck — that's strategy. And strategy can be learned.</span>
                </p>
                
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-red-400">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    <span className="text-red-600 dark:text-red-400">Your first opponent isn't other candidates.</span> It's the ATS algorithm.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Grid - Resume + Interview Combined */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resume Mastery
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium">ATS-Optimized Templates</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium">ATS Resume Builder</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium">ATS Score Analysis</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Interview Success
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium">Unlimited Mock Interviews</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium">Real Company Questions</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium">AI Performance Analysis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-bold text-green-700 dark:text-green-300">Complete Career Transformation Package</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Don't just fix your resume. Master the entire job search process — from ATS-beating resumes to confidence-building interview practice. One platform, complete success.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-3">
            <p className="text-sm font-bold text-red-700 dark:text-red-300 text-center">
              Stop Sending Resumes Into the Void – Get the Complete System at 70% Off!
            </p>
            <Button 
              className="w-full max-w-md bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600 text-white font-bold h-14 sm:h-14 text-sm sm:text-base shadow-lg transform hover:scale-[1.02] transition-all duration-200 px-3 sm:px-6"
              onClick={handleSubscriptionNavigation}
            >
              <span className="text-center">
                <span className="hidden sm:inline">TRANSFORM YOUR JOB SEARCH - 70% OFF NOW!</span>
                <span className="sm:hidden">🎯 GET COMPLETE SYSTEM! 70% OFF NOW!</span>
              </span>
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-800 dark:text-red-300 p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : resumes.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Resumes Yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Create your first ATS-optimized resume to get started. Our AI will help you craft a resume that stands out to both humans and applicant tracking systems.
            </p>
            <Button onClick={handleOpenCreateDialog} className="gap-2">
              <Plus size={16} />
              Create Your First Resume
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {resumes.map(resume => (
            <Card key={resume.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl">
              <CardContent className="p-0">
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">{resume.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Updated {formatDistanceToNow(new Date(resume.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/resume/${resume.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteResume(resume.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Resume preview indicator */}
                  <div className="flex items-center justify-center py-8">
                    <div className="w-16 h-20 bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 rounded-lg shadow-sm flex items-center justify-center border border-blue-200 dark:border-blue-700">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm h-9 flex-1 hover:bg-white dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
                    onClick={() => navigate(`/dashboard/resume-preview/${resume.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  
                  <Button
                    size="sm"
                    className="text-sm h-9 flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    onClick={() => navigate(`/dashboard/resume/${resume.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumesTab;
