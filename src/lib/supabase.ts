
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lfpmxqcqygujcftysbtu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmcG14cWNxeWd1amNmdHlzYnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMzI2MDksImV4cCI6MjA1NjYwODYwOX0.mtrnDIMa7yjyxPaGGJaSIJlm4gY1ur1o-dVMmR5yzfU';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // This is critical for reset password flow
    storage: localStorage
  }
});

// Function to get auth user
export const getUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return data?.user || null;
};

// Function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
  return true;
};

// Function to send password reset email
export const sendPasswordResetEmail = async (email: string) => {
  // Use the current origin as the redirect URL
  const redirectTo = `${window.location.origin}/reset-password`;
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  
  if (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
  
  return data;
};

// Function to update password after reset
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
  
  return data;
};

export default supabase;
