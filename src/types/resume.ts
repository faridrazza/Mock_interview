export interface Resume {
  id: string;
  user_id: string;
  title: string;
  content: ResumeContent;
  original_text?: string;
  enhanced_text?: string;
  ats_score?: number;
  job_description?: string;
  target_role?: string;
  template_id?: string;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
}

export interface ResumeContent {
  contactInfo: ContactInfo;
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];
  customSections?: CustomSection[];
  ats_analysis?: ATSAnalysis;
  design?: ResumeDesign; // New design configuration
  sectionOrder?: ResumeSection[]; // For section reordering
}

export interface ResumeDesign {
  accentColor?: string;
  fontFamily?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
  margins?: 'narrow' | 'normal' | 'wide';
}

export interface ATSAnalysis {
  score: number;
  feedback: string;
  keyword_matches?: string[];
  missing_keywords?: string[];
  formatting_issues?: string[];
  improvement_suggestions?: string[];
  detailed_assessment?: {
    hard_skills_score?: number;
    hard_skills_feedback?: string;
    hard_skills_tips?: string[];
    job_title_score?: number;
    job_title_feedback?: string;
    job_title_tips?: string[];
    soft_skills_score?: number;
    soft_skills_feedback?: string;
    soft_skills_tips?: string[];
    achievements_score?: number;
    achievements_feedback?: string;
    achievements_tips?: string[];
    education_score?: number;
    education_feedback?: string;
    education_tips?: string[];
    formatting_score?: number;
    formatting_feedback?: string;
    formatting_tips?: string[];
    relevance_score?: number;
    relevance_feedback?: string;
    relevance_tips?: string[];
  };
  keyword_match_percentage?: number;
  content_hash?: string; // Hash of the content that was analyzed
  analyzed_at?: string; // ISO timestamp of when analysis was performed
  from_cache?: boolean; // Whether this result came from cache
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  description: string;
  achievements: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  gpa?: string;
  achievements?: string[];
}

export interface CertificationEntry {
  name: string;
  issuer?: string;
  date?: string;
  expiration?: string;
  id?: string;
  url?: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  technologies?: string[];
  achievements?: string[];
}

export interface CustomSection {
  title: string;
  items: CustomSectionItem[];
}

export interface CustomSectionItem {
  title?: string;
  subtitle?: string;
  date?: string;
  description?: string;
  bullets?: string[];
}

export type ResumeSection = 
  | 'contactInfo'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'projects'
  | 'customSections';

export type ResumeTemplate = 
  | 'standard'
  | 'modern'
  | 'professional'
  | 'minimal'
  | 'creative'
  | 'chronological'
  | 'executive'
  | 'technical'
  | 'datascientist'
  | 'modernphoto';
