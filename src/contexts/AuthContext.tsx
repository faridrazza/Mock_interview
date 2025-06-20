import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // Use the centralized client
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionStatus, SubscriptionTier } from '@/types/subscription';

interface Profile {
  id: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  resume_subscription_tier?: SubscriptionTier; // Added for resume subscriptions
  resume_subscription_status?: SubscriptionStatus; // Added for resume subscriptions
  referral_code: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncSubscriptions: () => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>; // New method for Google sign-in
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Use a ref to track if a refresh is in progress
  const isRefreshingRef = useRef(false);
  // Use a ref to track last refresh time to prevent too frequent calls
  const lastRefreshTimeRef = useRef(0);

  // Function to fetch profile data - memoized with useCallback
  const refreshProfile = useCallback(async () => {
    try {
      // If no user, nothing to refresh
      if (!user) return;
      
      // Check if a refresh is already in progress to prevent duplicate calls
      if (isRefreshingRef.current) return;
      
      // Implement a simple debounce - only refresh if it's been at least 1000ms since last refresh
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < 1000) {
        return;
      }
      
      // Set the refreshing flag
      isRefreshingRef.current = true;
      lastRefreshTimeRef.current = now;
      
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile data retrieved:', data);
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    } finally {
      // Clear the refreshing flag when done
      isRefreshingRef.current = false;
    }
  }, [user]); // Only depend on user, not on other state variables

  // Function to sync subscriptions with PayPal
  const syncSubscriptions = useCallback(async () => {
    try {
      if (!user) {
        console.log('Cannot sync subscriptions: No user logged in');
        return;
      }
      
      setIsLoading(true);
      console.log('Syncing subscriptions with PayPal for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('paypal-webhook', {
        body: {
          action: 'sync_subscriptions',
          user_id: user.id
        }
      });
      
      if (error) {
        console.error('Error syncing subscriptions:', error);
        toast({
          title: "Sync failed",
          description: "Failed to sync subscriptions with PayPal",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Subscription sync result:', data);
      
      if (data.success) {
        // Refresh profile to get updated subscription status
        await refreshProfile();
        
        toast({
          title: "Subscriptions synced",
          description: data.message || "Your subscription status has been updated",
        });
      } else {
        toast({
          title: "Sync issue",
          description: data.error || "There was an issue syncing your subscriptions",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error in syncSubscriptions:', error);
      toast({
        title: "Sync failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, refreshProfile, toast]);

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing auth...');
        
        // Set up auth state listener FIRST to avoid missing auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event, currentSession?.user?.id);
            
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              // Use setTimeout to prevent deadlocks with Supabase auth
              // But don't call refreshProfile immediately - let the effect handle it
              // This prevents duplicate calls
              if (event !== 'INITIAL_SESSION') {
                setTimeout(() => {
                  refreshProfile();
                }, 100); // Small delay to prevent race conditions
              }
            } else {
              setProfile(null);
            }
            
            setIsLoading(false);
          }
        );
        
        // THEN check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await refreshProfile();
        }
        
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error during auth initialization:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array, but refreshProfile is stable now due to useCallback

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Removing toast notification on successful sign-up
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Signing in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful, user:', data.user?.id);
      
      // Removing toast notification on successful sign-in
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // New method for Google sign-in
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('Signing in with Google');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`, // Redirect back to auth page after Google auth
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }

      console.log('Google sign in initiated:', data);
      
      // No toast here since the page will redirect to Google
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false); // Reset loading state in case of error
    }
    // Note: No finally block with setIsLoading(false) because we're redirecting away
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Check if there's a session before attempting to sign out
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log('No active session found, clearing local state only');
        // Even if no session exists, we should still clear the local state
        setSession(null);
        setUser(null);
        setProfile(null);
        
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
        return;
      }
      
      // If we have a session, attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset password - fixed return type to match interface
  const resetPassword = async (password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      console.log('Password reset successful');
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred while resetting your password.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    syncSubscriptions,
    resetPassword,
    signInWithGoogle, // Add the new method to the context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
