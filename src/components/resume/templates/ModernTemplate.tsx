import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const ModernTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#0ea5e9' 
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
      fontFamily: '"Roboto", "Open Sans", sans-serif',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#334155',
      padding: '1rem',
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '2rem',
      maxWidth: '100%'
    },
    leftPanel: {
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
      borderRadius: '0.5rem'
    },
    rightPanel: {
      padding: '0.5rem'
    },
    header: {
      marginBottom: spacingMap[spacing].section
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '0.5rem'
    },
    title: {
      fontSize: `${parseFloat(fontSizeMap[fontSize].sectionTitle) * 0.9}rem`,
      color: '#64748b',
      marginBottom: '1rem'
    },
    contactInfo: {
      marginBottom: '1.5rem'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      fontSize: fontSizeMap[fontSize].small
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '0.75rem',
      paddingBottom: '0.25rem',
      borderBottom: `2px solid ${accentColor}`
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    skillsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    skillItem: {
      padding: '0.25rem 0.5rem',
      backgroundColor: '#e2e8f0',
      borderRadius: '0.25rem',
      fontSize: fontSizeMap[fontSize].small
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    jobTitle: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    company: {
      fontWeight: 'normal',
      color: '#64748b'
    },
    dateLocation: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
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
      marginBottom: spacingMap[spacing].item
    },
    degree: {
      fontWeight: 'bold'
    },
    institution: {
      color: '#64748b'
    },
    certificationEntry: {
      marginBottom: '0.5rem'
    },
    certName: {
      fontWeight: 'bold',
      marginBottom: '0.1rem'
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b'
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    projectName: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    projectDescription: {
      marginBottom: '0.25rem'
    },
    technologies: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.25rem',
      marginTop: '0.25rem'
    },
    technologyTag: {
      backgroundColor: '#e2e8f0',
      fontSize: '0.7rem',
      padding: '0.1rem 0.4rem',
      borderRadius: '0.25rem',
      color: '#475569',
    }
  };

  // Helper functions to render different sections
  const renderContactInfo = () => (
    <div style={styles.leftPanel}>
      <div style={styles.header}>
        <div style={styles.name}>{content.contactInfo.name}</div>
        {content.experience && content.experience.length > 0 && (
          <div style={styles.title}>{content.experience[0].position}</div>
        )}
      </div>
      
      <div style={styles.contactInfo}>
        {content.contactInfo.email && (
          <div style={styles.contactItem}>
            Email: {content.contactInfo.email}
          </div>
        )}
        {content.contactInfo.phone && (
          <div style={styles.contactItem}>
            Phone: {content.contactInfo.phone}
          </div>
        )}
        {content.contactInfo.location && (
          <div style={styles.contactItem}>
            Location: {content.contactInfo.location}
          </div>
        )}
        {content.contactInfo.linkedin && (
          <div style={styles.contactItem}>
            LinkedIn: {content.contactInfo.linkedin}
          </div>
        )}
        {content.contactInfo.website && (
          <div style={styles.contactItem}>
            Website: {content.contactInfo.website}
          </div>
        )}
        {content.contactInfo.github && (
          <div style={styles.contactItem}>
            GitHub: {content.contactInfo.github}
          </div>
        )}
      </div>
      
      {/* Left panel sections go here */}
      {renderLeftPanelSections()}
    </div>
  );

  // Render sections that should appear in the left panel
  const renderLeftPanelSections = () => {
    // Skills and certifications typically go in left panel
    return (
      <>
        {renderSectionByIdIfInLeftPanel('skills')}
        {renderSectionByIdIfInLeftPanel('certifications')}
      </>
    );
  };

  // Helper to render a section in the left panel if it exists in content
  const renderSectionByIdIfInLeftPanel = (sectionId: ResumeSection) => {
    if (sectionId === 'skills') {
      return renderSkills();
    } else if (sectionId === 'certifications') {
      return renderCertifications();
    }
    return null;
  };

  // Sections for right panel
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Professional Summary</div>
        <div>{content.summary}</div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Experience</div>
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.experienceEntry}>
            <div style={styles.jobTitle}>
              {exp.position} <span style={styles.company}>• {exp.company}</span>
            </div>
            <div style={styles.dateLocation}>
              <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
              {exp.location && <div>{exp.location}</div>}
            </div>
            {exp.description && <div>{exp.description}</div>}
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
            <div style={styles.projectDescription}>{project.description}</div>
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
            {item.title && (
              <div style={styles.jobTitle}>{item.title}</div>
            )}
            {item.subtitle && (
              <div style={styles.company}>{item.subtitle}</div>
            )}
            {item.date && (
              <div style={styles.dateLocation}>
                <div>{item.date}</div>
              </div>
            )}
            {item.description && (
              <div>{item.description}</div>
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

  // Map section IDs to their rendering functions for right panel
  const renderSectionById = (sectionId: ResumeSection) => {
    switch (sectionId) {
      case 'summary':
        return renderSummary();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      case 'projects':
        return renderProjects();
      case 'customSections':
        return renderCustomSections();
      // Skills and certifications are in left column
      default:
        return null;
    }
  };

  // Filter out left panel sections and contact info
  const rightPanelSections = sectionOrder.filter(
    section => section !== 'contactInfo' && section !== 'skills' && section !== 'certifications'
  );

  return (
    <div style={styles.container}>
      {/* Left panel with contact info and skills */}
      {renderContactInfo()}
      
      {/* Right panel with other sections */}
      <div style={styles.rightPanel}>
        {rightPanelSections.map(sectionId => (
          <React.Fragment key={sectionId}>
            {renderSectionById(sectionId)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ModernTemplate;
