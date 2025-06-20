import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const ChronologicalTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#2563eb' 
}) => {
  const fontSizeMap = {
    small: {
      name: '1.125rem',
      sectionTitle: '0.875rem',
      normal: '0.6875rem',
      small: '0.625rem'
    },
    medium: {
      name: '1.25rem',
      sectionTitle: '1rem',
      normal: '0.75rem',
      small: '0.6875rem'
    },
    large: {
      name: '1.375rem',
      sectionTitle: '1.125rem',
      normal: '0.8125rem',
      small: '0.75rem'
    }
  };

  const spacingMap = {
    compact: {
      section: '1.2rem',
      entry: '0.75rem',
      item: '0.4rem'
    },
    normal: {
      section: '1.5rem',
      entry: '1rem',
      item: '0.5rem'
    },
    spacious: {
      section: '1.8rem',
      entry: '1.3rem',
      item: '0.7rem'
    }
  };

  // Default section order if not specified in content
  const defaultSectionOrder: ResumeSection[] = [
    'contactInfo',
    'summary',
    'experience',
    'education',
    'skills',
    'certifications',
    'projects',
    'customSections'
  ];

  // Use section order from content, or fall back to default
  const sectionOrder = content.sectionOrder || defaultSectionOrder;

  const styles = {
    container: {
      fontFamily: 'Helvetica, Arial, "Helvetica Neue", sans-serif', // Matching PDF export's Helvetica font
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: '1.4',
      color: '#333',
      padding: '1rem',
      maxWidth: '100%'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: spacingMap[spacing].section
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: accentColor
    },
    contactRow: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      fontSize: fontSizeMap[fontSize].small
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      borderBottom: `2px solid ${accentColor}`,
      paddingBottom: '0.25rem',
      marginBottom: '0.75rem',
      textTransform: 'uppercase' as const,
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    summary: {
      marginBottom: spacingMap[spacing].section
    },
    entry: {
      marginBottom: spacingMap[spacing].entry
    },
    entryHeader: {
      marginBottom: '0.25rem'
    },
    jobTitle: {
      fontWeight: 'bold',
      fontSize: `calc(${fontSizeMap[fontSize].normal} * 1.05)`,
    },
    company: {
      fontWeight: 'bold',
    },
    dateLocation: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      marginBottom: '0.5rem'
    },
    date: {
      fontStyle: 'italic'
    },
    location: {
      fontStyle: 'italic'
    },
    bulletList: {
      marginTop: '0.5rem',
      paddingLeft: '1.5rem',
      listStyleType: 'disc',
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item,
      paddingLeft: '0.25rem'
    },
    skillsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem 1.5rem',
      marginBottom: '0.5rem'
    },
    skillCategory: {
      marginBottom: '0.75rem'
    },
    skillCategoryTitle: {
      fontWeight: 'bold',
      marginBottom: '0.5rem'
    },
    skillItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    degree: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    institution: {
      marginBottom: '0.25rem'
    },
    certificationEntry: {
      marginBottom: '0.5rem'
    },
    certName: {
      fontWeight: 'bold',
      marginBottom: '0.1rem'
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    projectName: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    projectDescription: {
      marginBottom: '0.5rem'
    }
  };

  // Helper functions to render different sections
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.name}>{content.contactInfo.name}</div>
      <div style={styles.contactRow}>
        {content.contactInfo.email && (
          <div>{content.contactInfo.email}</div>
        )}
        {content.contactInfo.phone && (
          <div>{content.contactInfo.phone}</div>
        )}
        {content.contactInfo.location && (
          <div>{content.contactInfo.location}</div>
        )}
        {content.contactInfo.linkedin && (
          <div>{content.contactInfo.linkedin}</div>
        )}
        {content.contactInfo.website && (
          <div>{content.contactInfo.website}</div>
        )}
        {content.contactInfo.github && (
          <div>{content.contactInfo.github}</div>
        )}
      </div>
    </div>
  );

  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.summary}>
        <div style={styles.sectionTitle}>Professional Summary</div>
        <div>{content.summary}</div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Work Experience</div>
        
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.entry}>
            <div style={styles.entryHeader}>
              <div style={styles.jobTitle}>{exp.position}</div>
              <div style={styles.company}>{exp.company}</div>
              <div style={styles.dateLocation}>
                <div style={styles.date}>
                  {exp.startDate} - {exp.endDate || 'Present'}
                </div>
                {exp.location && <div style={styles.location}>{exp.location}</div>}
              </div>
            </div>
            
            {exp.description && (
              <div>{exp.description}</div>
            )}
            
            {exp.achievements && exp.achievements.length > 0 && (
              <ul style={styles.bulletList}>
                {exp.achievements.map((achievement, i) => 
                  achievement.trim() ? (
                    <li key={i} style={styles.bulletItem}>{achievement}</li>
                  ) : null
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    if (!content.education || content.education.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Education</div>
        
        {content.education.map((edu, index) => (
          <div key={index} style={styles.educationEntry}>
            <div style={styles.degree}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </div>
            <div style={styles.institution}>{edu.institution}</div>
            <div style={styles.dateLocation}>
              <div style={styles.date}>
                {edu.startDate} - {edu.endDate || 'Present'}
              </div>
              {edu.location && <div style={styles.location}>{edu.location}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Organize skills into categories for better ATS recognition
    // This is a simple approach - in a real app, you might want more sophisticated categorization
    const technicalSkills = content.skills.filter(s => 
      s.toLowerCase().includes('programming') || 
      s.toLowerCase().includes('software') || 
      s.toLowerCase().includes('development') ||
      s.toLowerCase().includes('database') ||
      s.toLowerCase().includes('cloud') ||
      s.toLowerCase().includes('engineering') ||
      s.toLowerCase().includes('java') ||
      s.toLowerCase().includes('python') ||
      s.toLowerCase().includes('javascript') ||
      s.toLowerCase().includes('react') ||
      s.toLowerCase().includes('node') ||
      s.toLowerCase().includes('aws') ||
      s.toLowerCase().includes('azure')
    );
    
    const softSkills = content.skills.filter(s => 
      s.toLowerCase().includes('communication') || 
      s.toLowerCase().includes('leadership') || 
      s.toLowerCase().includes('teamwork') ||
      s.toLowerCase().includes('management') ||
      s.toLowerCase().includes('collaboration')
    );
    
    const otherSkills = content.skills.filter(s => 
      !technicalSkills.includes(s) && !softSkills.includes(s)
    );
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Skills</div>
        
        {technicalSkills.length > 0 && (
          <div style={styles.skillCategory}>
            <div style={styles.skillCategoryTitle}>Technical Skills</div>
            <div style={styles.skillsContainer}>
              {technicalSkills.map((skill, index) => (
                <div key={index} style={styles.skillItem}>• {skill}</div>
              ))}
            </div>
          </div>
        )}
        
        {softSkills.length > 0 && (
          <div style={styles.skillCategory}>
            <div style={styles.skillCategoryTitle}>Professional Skills</div>
            <div style={styles.skillsContainer}>
              {softSkills.map((skill, index) => (
                <div key={index} style={styles.skillItem}>• {skill}</div>
              ))}
            </div>
          </div>
        )}
        
        {otherSkills.length > 0 && (
          <div style={styles.skillCategory}>
            <div style={styles.skillCategoryTitle}>Additional Skills</div>
            <div style={styles.skillsContainer}>
              {otherSkills.map((skill, index) => (
                <div key={index} style={styles.skillItem}>• {skill}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCertifications = () => {
    if (!content.certifications || content.certifications.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Certifications</div>
        
        {content.certifications.map((cert, index) => (
          <div key={index} style={styles.certificationEntry}>
            <div style={styles.certName}>{cert.name}</div>
            <div>
              {cert.issuer && `${cert.issuer}`}
              {cert.date && cert.issuer && ' | '}
              {cert.date && `${cert.date}`}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Projects</div>
        
        {content.projects.map((project, index) => (
          <div key={index} style={styles.projectEntry}>
            <div style={styles.projectName}>{project.name}</div>
            <div style={styles.projectDescription}>{project.description}</div>
            
            {project.technologies && project.technologies.length > 0 && (
              <div style={{marginBottom: '0.5rem'}}>
                <strong>Technologies:</strong> {project.technologies.join(', ')}
              </div>
            )}
            
            {project.achievements && project.achievements.length > 0 && (
              <ul style={styles.bulletList}>
                {project.achievements.map((achievement, i) => 
                  achievement.trim() ? (
                    <li key={i} style={styles.bulletItem}>{achievement}</li>
                  ) : null
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCustomSections = () => {
    if (!content.customSections || content.customSections.length === 0) return null;
    
    return content.customSections.map((section, index) => (
      <div key={index} style={styles.section}>
        <div style={styles.sectionTitle}>{section.title}</div>
        
        {section.items.map((item, i) => (
          <div key={i} style={styles.entry}>
            {item.title && (
              <div style={styles.jobTitle}>{item.title}</div>
            )}
            {item.subtitle && (
              <div style={styles.company}>{item.subtitle}</div>
            )}
            {item.date && (
              <div style={styles.date}>{item.date}</div>
            )}
            {item.description && (
              <div>{item.description}</div>
            )}
            
            {item.bullets && item.bullets.length > 0 && (
              <ul style={styles.bulletList}>
                {item.bullets.map((bullet, j) => 
                  bullet.trim() ? (
                    <li key={j} style={styles.bulletItem}>{bullet}</li>
                  ) : null
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    ));
  };

  // Map section IDs to their rendering functions
  const renderSectionById = (sectionId: ResumeSection) => {
    switch (sectionId) {
      case 'summary':
        return renderSummary();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'certifications':
        return renderCertifications();
      case 'projects':
        return renderProjects();
      case 'customSections':
        return renderCustomSections();
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header section with name and contact info */}
      {renderHeader()}
      
      {/* Render all other sections in the order specified */}
      {sectionOrder
        .filter(sectionId => sectionId !== 'contactInfo') // Filter out contactInfo as it's in header
        .map(sectionId => (
          <React.Fragment key={sectionId}>
            {renderSectionById(sectionId)}
          </React.Fragment>
        ))}
    </div>
  );
};

export default ChronologicalTemplate; 