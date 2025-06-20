
import { supabase } from '@/lib/supabase';
import { Resume, ResumeContent, ResumeSection } from '@/types/resume';

/**
 * Fetches all resumes for the current user
 */
export const getUserResumes = async (): Promise<Resume[]> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('user_resumes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }

  return data as Resume[];
};

/**
 * Fetches a specific resume by ID
 */
export const getResumeById = async (id: string): Promise<Resume> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('user_resumes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }

  return data as Resume;
};

/**
 * Creates a new resume
 */
export const createResume = async (
  title: string,
  content: ResumeContent,
  jobDescription?: string
): Promise<Resume> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('user_resumes')
    .insert({
      title,
      content,
      job_description: jobDescription,
      user_id: userData.user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating resume:', error);
    throw error;
  }

  return data as Resume;
};

/**
 * Updates an existing resume
 */
export const updateResume = async (
  id: string,
  updates: Partial<Resume>
): Promise<Resume> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('user_resumes')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userData.user.id) // Ensure user can only update their own resumes
    .select()
    .single();

  if (error) {
    console.error('Error updating resume:', error);
    throw error;
  }

  return data as Resume;
};

/**
 * Deletes a resume
 */
export const deleteResume = async (id: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }
  
  const { error } = await supabase
    .from('user_resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', userData.user.id); // Ensure user can only delete their own resumes

  if (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

/**
 * Creates a blank resume template with basic structure
 */
export const createBlankResume = (): ResumeContent => {
  // Default section order
  const sectionOrder: ResumeSection[] = [
    'contactInfo', 
    'summary', 
    'experience', 
    'education', 
    'skills', 
    'certifications', 
    'projects'
  ];

  // Default design settings
  const design = {
    accentColor: '#2563eb',
    fontFamily: 'Inter, sans-serif',
    fontSize: 'medium' as 'small' | 'medium' | 'large',  // Fix type by using as assertion
    spacing: 'normal' as 'compact' | 'normal' | 'spacious',  // Fix type by using as assertion
    margins: 'normal' as 'narrow' | 'normal' | 'wide'  // Fix type by using as assertion
  };

  return {
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
    },
    summary: '',
    experience: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        achievements: [''],
      },
    ],
    education: [
      {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        location: '',
      },
    ],
    skills: [],
    certifications: [],
    projects: [],
    sectionOrder,
    design
  };
};
