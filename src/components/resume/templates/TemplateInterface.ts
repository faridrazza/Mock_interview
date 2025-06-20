import { ResumeContent } from '@/types/resume';

export interface ResumeTemplateProps {
  content: ResumeContent;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
  accentColor?: string;
}

export interface TemplateStyles {
  container: React.CSSProperties;
  header: React.CSSProperties;
  section: React.CSSProperties;
  sectionTitle: React.CSSProperties;
  entry: React.CSSProperties;
  details: React.CSSProperties;
  skills: React.CSSProperties;
  [key: string]: React.CSSProperties;
} 