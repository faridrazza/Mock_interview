import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const MinimalTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#333' 
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
      section: '0.75rem',
      entry: '0.5rem',
      item: '0.25rem'
    },
    normal: {
      section: '1rem',
      entry: '0.7rem',
      item: '0.4rem'
    },
    spacious: {
      section: '1.25rem',
      entry: '0.9rem',
      item: '0.6rem'
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
  
  // Determine which sections go into left and right columns
  const leftColumnSections: ResumeSection[] = [];
  const rightColumnSections: ResumeSection[] = [];
  
  sectionOrder.forEach((section, index) => {
    // We'll put experience and projects in the left column,
    // and everything else in the right column
    if (section === 'experience' || section === 'projects') {
      leftColumnSections.push(section);
    } else if (section !== 'contactInfo') { // Contact info is always in the header
      rightColumnSections.push(section);
    }
  });

  const styles = {
    container: {
      fontFamily: '"Times New Roman", Times, serif',
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: '1.3',
      color: '#333',
      padding: '0.5rem'
    },
    header: {
      marginBottom: '1rem',
      borderBottom: '0 none'
    },
    headerTop: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start',
      marginBottom: '0.3rem'
    },
    headerName: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      textTransform: 'capitalize' as const,
      marginBottom: '0.1rem',
      color: accentColor
    },
    contactInfo: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.75rem',
      fontSize: fontSizeMap[fontSize].small,
      color: '#555',
      marginTop: '0.2rem',
      fontStyle: 'normal'
    },
    mainContent: {
      display: 'flex',
      gap: '1.5rem'
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      marginBottom: '0.5rem',
      letterSpacing: '0.05em',
      borderBottom: `1px solid ${accentColor}`,
      color: accentColor
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    leftColumn: {
      width: '65%'
    },
    rightColumn: {
      width: '35%'
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    companyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '0.1rem'
    },
    companyName: {
      fontWeight: 'bold',
    },
    roleHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '0.1rem',
      fontStyle: 'italic'
    },
    dates: {
      textAlign: 'right' as const,
      marginLeft: 'auto',
      fontSize: fontSizeMap[fontSize].small
    },
    location: {
      textAlign: 'right' as const,
      fontSize: fontSizeMap[fontSize].small
    },
    bulletList: {
      margin: '0.4rem 0 0 0',
      paddingLeft: '1rem'
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item,
      paddingLeft: '0.2rem',
      position: 'relative' as const,
      lineHeight: '1.15'
    },
    education: {
      marginBottom: '0.7rem'
    },
    educationInstitution: {
      fontWeight: 'bold'
    },
    educationDegree: {
      fontStyle: 'italic'
    },
    rightSectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      marginBottom: '0.5rem',
      letterSpacing: '0.05em',
      borderBottom: `1px solid ${accentColor}`,
      color: accentColor
    },
    skillsList: {
      listStyle: 'disc',
      paddingLeft: '1rem',
      marginBottom: '0.5rem'
    },
    skillItem: {
      marginBottom: '0.2rem',
      paddingLeft: '0.2rem'
    },
    certItem: {
      marginBottom: '0.3rem'
    },
    certName: {
      fontWeight: 'bold'
    },
    certDate: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#666'
    }
  };

  // Helper functions to render different sections
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.headerTop}>
        <div style={styles.headerName}>{content.contactInfo.name}</div>
      </div>
      <div style={styles.contactInfo}>
        {content.contactInfo.email && (
          <span>{content.contactInfo.email}</span>
        )}
        {content.contactInfo.phone && (
          <span>| {content.contactInfo.phone}</span>
        )}
        {content.contactInfo.location && (
          <span>| {content.contactInfo.location}</span>
        )}
      </div>
    </div>
  );

  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Experience</div>
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.experienceEntry}>
            <div style={styles.companyHeader}>
              <span style={styles.companyName}>{exp.company}</span>
              <span style={styles.dates}>{exp.startDate} – {exp.endDate || 'Present'}</span>
            </div>
            <div style={styles.roleHeader}>
              <span>{exp.position}</span>
              {exp.location && <span style={styles.location}>{exp.location}</span>}
            </div>
            
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

  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Projects</div>
        {content.projects.map((project, index) => (
          <div key={index} style={styles.experienceEntry}>
            <div style={styles.companyHeader}>
              <span style={styles.companyName}>{project.name}</span>
              {(project.startDate || project.endDate) && (
                <span style={styles.dates}>
                  {project.startDate || ''}{project.startDate && project.endDate && ' – '}{project.endDate || ''}
                </span>
              )}
            </div>
            {project.technologies && project.technologies.length > 0 && (
              <div style={{...styles.roleHeader, fontStyle: 'normal'}}>
                {project.technologies.join(' | ')}
              </div>
            )}
            {project.description && (
              <div style={{margin: '0.2rem 0'}}>{project.description}</div>
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

  const renderEducation = () => {
    if (!content.education || content.education.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.rightSectionTitle}>Education</div>
        {content.education.map((edu, index) => (
          <div key={index} style={styles.education}>
            <div style={styles.educationInstitution}>{edu.institution}</div>
            <div style={styles.educationDegree}>
              {edu.degree}{edu.field ? ', ' + edu.field : ''}
            </div>
            <div style={styles.dates}>
              {edu.startDate} – {edu.endDate || 'Present'}
            </div>
            {edu.location && (
              <div style={styles.location}>{edu.location}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.rightSectionTitle}>Skills</div>
        <div>
          <div style={{marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 'bold', marginBottom: '0.2rem'}}>Technical Skills</div>
            <ul style={styles.skillsList}>
              {content.skills.filter(s => 
                s.toLowerCase().includes('python') || 
                s.toLowerCase().includes('java') ||
                s.toLowerCase().includes('javascript') ||
                s.toLowerCase().includes('sql') ||
                s.toLowerCase().includes('c#') ||
                s.toLowerCase().includes('c++')
              ).map((skill, index) => (
                skill.trim() && (
                  <li key={index} style={styles.skillItem}>{skill}</li>
                )
              ))}
            </ul>
          </div>

          <div style={{marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 'bold', marginBottom: '0.2rem'}}>Tools & Platforms</div>
            <ul style={styles.skillsList}>
              {content.skills.filter(s => 
                s.toLowerCase().includes('git') || 
                s.toLowerCase().includes('aws') ||
                s.toLowerCase().includes('azure') ||
                s.toLowerCase().includes('docker') ||
                s.toLowerCase().includes('kubernetes') ||
                s.toLowerCase().includes('tableau')
              ).map((skill, index) => (
                skill.trim() && (
                  <li key={index} style={styles.skillItem}>{skill}</li>
                )
              ))}
            </ul>
          </div>

          <div>
            <div style={{fontWeight: 'bold', marginBottom: '0.2rem'}}>Other</div>
            <ul style={styles.skillsList}>
              {content.skills.filter(s => 
                !s.toLowerCase().includes('python') && 
                !s.toLowerCase().includes('java') &&
                !s.toLowerCase().includes('javascript') &&
                !s.toLowerCase().includes('sql') &&
                !s.toLowerCase().includes('c#') &&
                !s.toLowerCase().includes('c++') &&
                !s.toLowerCase().includes('git') && 
                !s.toLowerCase().includes('aws') &&
                !s.toLowerCase().includes('azure') &&
                !s.toLowerCase().includes('docker') &&
                !s.toLowerCase().includes('kubernetes') &&
                !s.toLowerCase().includes('tableau')
              ).map((skill, index) => (
                skill.trim() && (
                  <li key={index} style={styles.skillItem}>{skill}</li>
                )
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!content.certifications || content.certifications.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.rightSectionTitle}>Certifications</div>
        {content.certifications.map((cert, index) => (
          <div key={index} style={styles.certItem}>
            <div style={styles.certName}>{cert.name}</div>
            {cert.issuer && <div>{cert.issuer}</div>}
            {cert.date && <div style={styles.certDate}>{cert.date}</div>}
          </div>
        ))}
      </div>
    );
  };

  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.rightSectionTitle}>Professional Summary</div>
        <div>{content.summary}</div>
      </div>
    );
  };

  const renderCustomSections = () => {
    if (!content.customSections || content.customSections.length === 0) return null;
    
    return content.customSections.map((section, index) => (
      <div key={index} style={styles.section}>
        <div style={styles.rightSectionTitle}>{section.title}</div>
        {section.items.map((item, i) => (
          <div key={i} style={styles.certItem}>
            {item.title && <div style={styles.certName}>{item.title}</div>}
            {item.subtitle && <div>{item.subtitle}</div>}
            {item.date && <div style={styles.certDate}>{item.date}</div>}
            {item.description && <div style={{marginTop: '0.2rem'}}>{item.description}</div>}
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
      case 'experience':
        return renderExperience();
      case 'projects':
        return renderProjects();
      case 'education':
        return renderEducation();
      case 'skills':
        return renderSkills();
      case 'certifications':
        return renderCertifications();
      case 'summary':
        return renderSummary();
      case 'customSections':
        return renderCustomSections();
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      {renderHeader()}

      {/* Main content with two-column layout */}
      <div style={styles.mainContent}>
        {/* Left Column - primarily Experience and Projects */}
        <div style={styles.leftColumn}>
          {leftColumnSections.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSectionById(sectionId)}
            </React.Fragment>
          ))}
        </div>

        {/* Right Column - Education, Skills, etc. */}
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

export default MinimalTemplate;
