import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const DataScientistTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#2563eb' 
}) => {
  const fontSizeMap = {
    small: {
      name: '1.125rem',
      title: '0.875rem',
      sectionTitle: '0.875rem',
      normal: '0.6875rem',
      small: '0.625rem'
    },
    medium: {
      name: '1.25rem',
      title: '1rem',
      sectionTitle: '1rem',
      normal: '0.75rem',
      small: '0.6875rem'
    },
    large: {
      name: '1.375rem',
      title: '1.125rem',
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
      fontFamily: '"Roboto", "Open Sans", sans-serif',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#334155',
      width: '100%',
      maxWidth: '8.5in',
      margin: '0 auto',
      padding: '1.5rem 2rem'
    },
    header: {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      alignItems: 'flex-start' as const,
      marginBottom: '1.5rem',
      borderBottom: '2px solid #e2e8f0',
      paddingBottom: '1rem'
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '0.25rem',
      textTransform: 'uppercase' as const
    },
    title: {
      fontSize: fontSizeMap[fontSize].title,
      color: '#64748b',
      marginBottom: '0.5rem',
      fontWeight: 'bold'
    },
    contactRow: {
      display: 'flex' as const,
      flexWrap: 'wrap' as const,
      gap: '1rem',
      marginTop: '0.5rem'
    },
    contactItem: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      color: '#64748b',
      fontSize: fontSizeMap[fontSize].small,
      gap: '0.25rem'
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      textTransform: 'uppercase' as const,
      marginBottom: '0.75rem',
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: '0.5rem'
    },
    sectionTitleLine: {
      flexGrow: 1,
      height: '2px',
      backgroundColor: '#e2e8f0'
    },
    summaryText: {
      lineHeight: '1.5'
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
      paddingBottom: spacingMap[spacing].entry,
      borderBottom: '1px solid #f1f5f9'
    },
    entryHeader: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      marginBottom: '0.5rem',
      flexWrap: 'wrap' as const
    },
    jobTitle: {
      fontWeight: 'bold',
      color: accentColor
    },
    company: {
      fontWeight: 'normal'
    },
    duration: {
      color: '#64748b',
      fontSize: fontSizeMap[fontSize].small
    },
    locationText: {
      color: '#64748b',
      fontSize: fontSizeMap[fontSize].small,
      fontStyle: 'italic'
    },
    bulletList: {
      margin: '0.5rem 0',
      paddingLeft: '1.25rem'
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item,
      position: 'relative' as const
    },
    skillsSection: {
      marginBottom: spacingMap[spacing].section
    },
    skillsTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      textTransform: 'uppercase' as const,
      marginBottom: '0.75rem'
    },
    skillsList: {
      display: 'flex' as const,
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginTop: '0.5rem'
    },
    skillPill: {
      backgroundColor: '#f1f5f9',
      borderRadius: '4px',
      padding: '0.25rem 0.5rem',
      fontSize: fontSizeMap[fontSize].small,
      fontWeight: 'bold',
      color: '#475569'
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    degreeText: {
      fontWeight: 'bold'
    },
    institutionText: {
      color: '#64748b'
    },
    certificationRow: {
      display: 'flex' as const,
      justifyContent: 'space-between' as const,
      marginBottom: '0.3rem'
    },
    certName: {
      fontWeight: 'bold'
    },
    certDetails: {
      color: '#64748b',
      fontSize: fontSizeMap[fontSize].small
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    projectTitle: {
      fontWeight: 'bold'
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem'
    },
    progressBar: {
      width: '100%',
      height: '6px',
      backgroundColor: '#e2e8f0',
      borderRadius: '3px',
      marginTop: '3px',
      position: 'relative' as const,
      overflow: 'hidden' as const
    },
    progressFill: {
      height: '100%',
      backgroundColor: accentColor,
      borderRadius: '3px'
    },
    proudSection: {
      backgroundColor: '#f8fafc',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1rem'
    },
    proudItem: {
      display: 'flex' as const,
      alignItems: 'flex-start' as const,
      marginBottom: '0.75rem',
      gap: '0.5rem'
    },
    proudIcon: {
      color: accentColor, 
      marginTop: '0.2rem'
    }
  };

  // Render contact information
  const renderContactInfo = () => (
    <div style={styles.header}>
      <div style={styles.name}>{content.contactInfo.name || 'Your Name'}</div>
      {content.experience && content.experience.length > 0 && (
        <div style={styles.title}>{content.experience[0].position || 'Your Title'}</div>
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
        {content.contactInfo.linkedin && (
          <div style={styles.contactItem}>
            {content.contactInfo.linkedin}
          </div>
        )}
        {content.contactInfo.github && (
          <div style={styles.contactItem}>
            {content.contactInfo.github}
          </div>
        )}
        {content.contactInfo.website && (
          <div style={styles.contactItem}>
            {content.contactInfo.website}
          </div>
        )}
      </div>
    </div>
  );

  // Render summary section
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Summary <div style={styles.sectionTitleLine}></div>
        </div>
        <div style={styles.summaryText}>{content.summary}</div>
      </div>
    );
  };
  
  // Render experience section
  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Experience <div style={styles.sectionTitleLine}></div>
        </div>
        {content.experience.map((exp, index) => (
          <div key={index} style={{
            ...styles.experienceEntry,
            ...(index === content.experience!.length - 1 ? { borderBottom: 'none' } : {})
          }}>
            <div style={styles.entryHeader}>
              <div style={styles.jobTitle}>
                {exp.position}
                {exp.company && (
                  <span style={styles.company}> • {exp.company}</span>
                )}
              </div>
              <div style={styles.duration}>
                {exp.startDate} - {exp.endDate || 'Present'}
              </div>
            </div>
            {exp.location && (
              <div style={styles.locationText}>{exp.location}</div>
            )}
            {exp.description && <div style={{ marginTop: '0.5rem' }}>{exp.description}</div>}
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
  
  // Render education section
  const renderEducation = () => {
    if (!content.education || content.education.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Education <div style={styles.sectionTitleLine}></div>
        </div>
        {content.education.map((edu, index) => (
          <div key={index} style={styles.educationEntry}>
            <div style={styles.entryHeader}>
              <div style={styles.degreeText}>
                {edu.degree}{edu.field ? `, ${edu.field}` : ''}
              </div>
              <div style={styles.duration}>
                {edu.startDate} - {edu.endDate || 'Present'}
              </div>
            </div>
            <div style={styles.institutionText}>{edu.institution}</div>
            {edu.location && (
              <div style={styles.locationText}>{edu.location}</div>
            )}
            {edu.gpa && (
              <div style={{ fontSize: fontSizeMap[fontSize].small, marginTop: '0.25rem' }}>
                GPA: {edu.gpa}
              </div>
            )}
            {edu.achievements && edu.achievements.length > 0 && (
              <ul style={{ ...styles.bulletList, marginTop: '0.25rem' }}>
                {edu.achievements.map((achievement, i) => (
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
  
  // Render skills section
  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // For tech skills template, we divide skills into groups
    // This is just a simple example - you might want to adjust based on actual data
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Tech Skills <div style={styles.sectionTitleLine}></div>
        </div>
        <div style={styles.skillsList}>
          {content.skills.map((skill, index) => (
            skill.trim() && (
              <div key={index} style={styles.skillPill}>{skill}</div>
            )
          ))}
        </div>
      </div>
    );
  };

  // Render certifications section
  const renderCertifications = () => {
    if (!content.certifications || content.certifications.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Certifications <div style={styles.sectionTitleLine}></div>
        </div>
        {content.certifications.map((cert, index) => (
          <div key={index} style={styles.certificationRow}>
            <div style={styles.certName}>{cert.name}</div>
            <div style={styles.certDetails}>
              {cert.issuer && cert.issuer}
              {cert.date && cert.issuer && ' • '}
              {cert.date && cert.date}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render projects section
  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Projects <div style={styles.sectionTitleLine}></div>
        </div>
        {content.projects.map((project, index) => (
          <div key={index} style={styles.projectEntry}>
            <div style={styles.entryHeader}>
              <div style={styles.projectTitle}>{project.name}</div>
              {(project.startDate || project.endDate) && (
                <div style={styles.duration}>
                  {project.startDate && project.startDate}
                  {project.startDate && project.endDate && ' - '}
                  {project.endDate && project.endDate}
                </div>
              )}
            </div>
            {project.description && <div>{project.description}</div>}
            {project.technologies && project.technologies.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: fontSizeMap[fontSize].small }}>Technologies: </span>
                <span style={{ fontSize: fontSizeMap[fontSize].small }}>
                  {project.technologies.join(', ')}
                </span>
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
  
  // Render custom sections
  const renderCustomSections = () => {
    if (!content.customSections || content.customSections.length === 0) return null;
    
    return content.customSections.map((section, index) => (
      <div key={index} style={styles.section}>
        <div style={styles.sectionTitle}>
          {section.title} <div style={styles.sectionTitleLine}></div>
        </div>
        {section.items.map((item, i) => (
          <div key={i} style={{
            ...styles.experienceEntry,
            ...(i === section.items.length - 1 ? { borderBottom: 'none' } : {})
          }}>
            {item.title && (
              <div style={styles.entryHeader}>
                <div style={styles.projectTitle}>{item.title}</div>
                {item.date && (
                  <div style={styles.duration}>{item.date}</div>
                )}
              </div>
            )}
            {item.subtitle && (
              <div style={styles.locationText}>{item.subtitle}</div>
            )}
            {item.description && <div style={{ marginTop: '0.5rem' }}>{item.description}</div>}
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

  // Render "Most Proud Of" section (a special custom section seen in the image)
  const renderProudSection = () => {
    // This is a special section based on the image
    // We'll check if there are any custom sections with this title
    const proudSection = content.customSections?.find(
      section => section.title.toLowerCase().includes('proud')
    );
    
    if (proudSection) {
      return (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            Most Proud Of <div style={styles.sectionTitleLine}></div>
          </div>
          <div style={styles.proudSection}>
            {proudSection.items.map((item, i) => (
              <div key={i} style={styles.proudItem}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                  {item.description && <div>{item.description}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Helper to render a section by ID
  const renderSectionById = (sectionId: ResumeSection) => {
    switch(sectionId) {
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
      {/* Header with contact info */}
      {renderContactInfo()}
      
      {/* Main content with all sections */}
      {sectionOrder
        .filter(section => section !== 'contactInfo')
        .map(sectionId => (
          <React.Fragment key={sectionId}>
            {renderSectionById(sectionId)}
          </React.Fragment>
        ))}
      
      {/* Special "Most Proud Of" section if it exists */}
      {renderProudSection()}
    </div>
  );
};

export default DataScientistTemplate; 