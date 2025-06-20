import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const CreativeTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#6366f1' 
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
      entry: '0.7rem',
      item: '0.3rem'
    },
    normal: {
      section: '1.5rem',
      entry: '1rem',
      item: '0.5rem'
    },
    spacious: {
      section: '2rem',
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
      fontFamily: '"Poppins", "Helvetica Neue", sans-serif',
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: '1.5',
      color: '#374151',
      height: '100%',
      display: 'grid',
      gridTemplateRows: 'auto 1fr',
      backgroundColor: '#ffffff'
    },
    header: {
      backgroundColor: accentColor,
      color: '#ffffff',
      padding: '2rem',
      textAlign: 'center' as const,
      position: 'relative' as const
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    title: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      marginBottom: '0.5rem',
      opacity: 0.9
    },
    contactRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      marginTop: '0.5rem',
      flexWrap: 'wrap' as const
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: fontSizeMap[fontSize].small,
      gap: '0.5rem'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '2rem',
      padding: '2rem',
      height: '100%'
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacingMap[spacing].section
    },
    rightColumn: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacingMap[spacing].section
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '1rem',
      position: 'relative' as const,
      paddingBottom: '0.5rem',
      borderBottom: `2px solid ${accentColor}`
    },
    skillsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    skillItem: {
      fontSize: fontSizeMap[fontSize].normal,
      color: '#374151'
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
      position: 'relative' as const,
      paddingLeft: '1.5rem',
      borderLeft: `2px solid ${accentColor}40`
    },
    jobTitle: {
      fontWeight: 'bold',
      marginBottom: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    timelineDot: {
      width: '0.75rem',
      height: '0.75rem',
      backgroundColor: accentColor,
      borderRadius: '50%',
      position: 'absolute' as const,
      left: '-0.375rem',
      top: '0.375rem'
    },
    company: {
      color: accentColor,
      fontWeight: 'normal',
    },
    dateLocation: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#6B7280',
      marginBottom: '0.5rem',
      flexWrap: 'wrap' as const
    },
    description: {
      marginBottom: '0.5rem'
    },
    bulletList: {
      listStyleType: 'disc',
      paddingLeft: '1rem',
      marginTop: '0.5rem'
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry,
      position: 'relative' as const,
      paddingLeft: '1.5rem',
      borderLeft: `2px solid ${accentColor}40`
    },
    degree: {
      fontWeight: 'bold',
      marginBottom: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    institution: {
      color: accentColor
    },
    summary: {
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem'
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry,
      padding: '1rem',
      borderRadius: '0.5rem'
    },
    projectName: {
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: accentColor
    },
    technologies: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.25rem',
      marginTop: '0.5rem'
    },
    technologyTag: {
      fontSize: fontSizeMap[fontSize].small,
      padding: '0.1rem 0.5rem',
      borderRadius: '0.25rem',
      color: accentColor,
    },
    certificationEntry: {
      marginBottom: spacingMap[spacing].item,
      padding: '0.5rem 0'
    },
    certName: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#6B7280'
    }
  };

  // Helper functions to render different sections
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.name}>{content.contactInfo.name}</div>
      {content.experience && content.experience.length > 0 && (
        <div style={styles.title}>{content.experience[0].position}</div>
      )}
      <div style={styles.contactRow}>
        {content.contactInfo.email && (
          <div style={styles.contactItem}>
            {content.contactInfo.email}
          </div>
        )}
        {content.contactInfo.phone && (
          <div style={styles.contactItem}>
            {content.contactInfo.phone}
          </div>
        )}
        {content.contactInfo.location && (
          <div style={styles.contactItem}>
            {content.contactInfo.location}
          </div>
        )}
      </div>
    </div>
  );

  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Summary</div>
        <div style={styles.summary}>{content.summary}</div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Work Experience</div>
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.experienceEntry}>
            <div style={styles.timelineDot}></div>
            <div style={styles.jobTitle}>
              {exp.position} <span style={styles.company}>@ {exp.company}</span>
            </div>
            <div style={styles.dateLocation}>
              <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
              {exp.location && <div>{exp.location}</div>}
            </div>
            {exp.description && <div style={styles.description}>{exp.description}</div>}
            {exp.achievements && exp.achievements.length > 0 && (
              <ul style={styles.bulletList}>
                {exp.achievements.map((achievement, i) => (
                  achievement.trim() && (
                    <li key={i} style={styles.bulletItem}>{achievement}</li>
                  )
                ))}
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
            <div style={styles.timelineDot}></div>
            <div style={styles.degree}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </div>
            <div style={styles.institution}>{edu.institution}</div>
            <div style={styles.dateLocation}>
              <div>{edu.startDate} - {edu.endDate || 'Present'}</div>
              {edu.location && <div>{edu.location}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Skills</div>
        <div style={styles.skillsList}>
          {content.skills.map((skill, index) => (
            skill.trim() && (
              <div key={index} style={styles.skillItem}>
                {skill}
              </div>
            )
          ))}
        </div>
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
            <div style={styles.certDetails}>
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
            <div style={styles.description}>{project.description}</div>
            {project.technologies && project.technologies.length > 0 && (
              <div style={styles.technologies}>
                {project.technologies.map((tech, i) => (
                  <div key={i} style={styles.technologyTag}>{tech}</div>
                ))}
              </div>
            )}
            {project.achievements && project.achievements.length > 0 && (
              <ul style={styles.bulletList}>
                {project.achievements.map((achievement, i) => (
                  achievement.trim() && (
                    <li key={i} style={styles.bulletItem}>{achievement}</li>
                  )
                ))}
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
          <div key={i} style={styles.experienceEntry}>
            <div style={styles.timelineDot}></div>
            {item.title && (
              <div style={styles.jobTitle}>{item.title}</div>
            )}
            {item.subtitle && (
              <div style={styles.institution}>{item.subtitle}</div>
            )}
            {item.date && (
              <div style={styles.dateLocation}>
                <div>{item.date}</div>
              </div>
            )}
            {item.description && (
              <div style={styles.description}>{item.description}</div>
            )}
            {item.bullets && item.bullets.length > 0 && (
              <ul style={styles.bulletList}>
                {item.bullets.map((bullet, j) => (
                  bullet.trim() && (
                    <li key={j} style={styles.bulletItem}>{bullet}</li>
                  )
                ))}
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

  // Separate sections for left and right columns
  // Left column gets skills, certifications, and education
  // Right column gets everything else except contactInfo
  const leftColumnSections = sectionOrder.filter(s => 
    s === 'skills' || s === 'certifications' || s === 'education'
  );
  
  const rightColumnSections = sectionOrder.filter(s => 
    s !== 'contactInfo' && s !== 'skills' && s !== 'certifications' && s !== 'education'
  );

  return (
    <div style={styles.container}>
      {/* Header with basic contact info */}
      {renderHeader()}
      
      {/* Main content area with two columns */}
      <div style={styles.mainContent}>
        {/* Left column - Skills, Certifications, Education */}
        <div style={styles.leftColumn}>
          {leftColumnSections.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSectionById(sectionId)}
            </React.Fragment>
          ))}
          
          {/* Add social links at the bottom of left column if available */}
          {(content.contactInfo.linkedin || content.contactInfo.github || content.contactInfo.website) && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Connect</div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {content.contactInfo.linkedin && (
                  <div>{content.contactInfo.linkedin}</div>
                )}
                {content.contactInfo.github && (
                  <div>{content.contactInfo.github}</div>
                )}
                {content.contactInfo.website && (
                  <div>{content.contactInfo.website}</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Summary, Experience, Projects */}
        <div style={styles.rightColumn}>
          {rightColumnSections.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSectionById(sectionId)}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreativeTemplate;
