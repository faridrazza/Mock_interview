import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const ExecutiveTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#1e293b' 
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
      section: '1.25rem',
      entry: '0.75rem',
      item: '0.4rem'
    },
    normal: {
      section: '1.6rem',
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
      fontFamily: 'Georgia, "Times New Roman", serif', // Professional serif font with reliable fallbacks
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: '1.5',
      color: '#333',
      padding: '1.5rem',
      maxWidth: '100%',
      letterSpacing: '0.01em'
    },
    header: {
      marginBottom: spacingMap[spacing].section,
      borderBottom: `2px solid ${accentColor}`,
      paddingBottom: '1rem'
    },
    nameAndTitle: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-start'
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      marginBottom: '0.25rem'
    },
    title: {
      fontSize: `calc(${fontSizeMap[fontSize].sectionTitle} * 0.9)`,
      color: '#64748b',
      fontStyle: 'italic'
    },
    contactInfo: {
      marginTop: '0.5rem',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.75rem 1.5rem',
      fontSize: fontSizeMap[fontSize].small
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      color: accentColor,
      fontWeight: 'bold',
      marginBottom: '0.75rem',
      borderBottom: `1px solid ${accentColor}`,
      paddingBottom: '0.25rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    summary: {
      marginBottom: spacingMap[spacing].section,
      fontSize: `calc(${fontSizeMap[fontSize].normal} * 1.05)`,
      fontStyle: 'italic',
      lineHeight: '1.6',
      color: '#4b5563'
    },
    twoColumnLayout: {
      display: 'grid',
      gridTemplateColumns: '7fr 3fr',
      gap: '2rem',
      alignItems: 'start'
    },
    mainColumn: {},
    sideColumn: {},
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    entryHeader: {
      marginBottom: '0.5rem'
    },
    roleAndCompany: {
      fontWeight: 'bold',
      fontSize: `calc(${fontSizeMap[fontSize].normal} * 1.1)`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      flexWrap: 'wrap' as const
    },
    companyName: {
      color: accentColor
    },
    dateLocation: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      marginBottom: '0.5rem'
    },
    date: {},
    location: {},
    description: {
      marginBottom: '0.5rem'
    },
    bulletList: {
      paddingLeft: '1.25rem',
      marginTop: '0.5rem',
      listStyleType: 'square'
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item,
      paddingLeft: '0.25rem'
    },
    educationEntry: {
      marginBottom: '0.75rem'
    },
    degree: {
      fontWeight: 'bold'
    },
    institution: {
      marginBottom: '0.25rem'
    },
    skills: {
      marginBottom: spacingMap[spacing].section
    },
    skillCategory: {
      marginBottom: '1rem'
    },
    skillCategoryTitle: {
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      fontSize: fontSizeMap[fontSize].normal,
      color: accentColor
    },
    skillGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    skillItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    certificationEntry: {
      marginBottom: '0.75rem'
    },
    certName: {
      fontWeight: 'bold',
      marginBottom: '0.1rem'
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b'
    }
  };

  // Helper functions to render different sections
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.nameAndTitle}>
        <div style={styles.name}>{content.contactInfo.name}</div>
        {content.experience && content.experience.length > 0 && content.experience[0].position && (
          <div style={styles.title}>{content.experience[0].position}</div>
        )}
      </div>
      <div style={styles.contactInfo}>
        {content.contactInfo.email && (
          <div style={styles.contactItem}>{content.contactInfo.email}</div>
        )}
        {content.contactInfo.phone && (
          <div style={styles.contactItem}>{content.contactInfo.phone}</div>
        )}
        {content.contactInfo.location && (
          <div style={styles.contactItem}>{content.contactInfo.location}</div>
        )}
        {content.contactInfo.linkedin && (
          <div style={styles.contactItem}>{content.contactInfo.linkedin}</div>
        )}
      </div>
    </div>
  );

  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.summary}>
        <div style={styles.sectionTitle}>Executive Summary</div>
        <div>{content.summary}</div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Professional Experience</div>
        
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.experienceEntry}>
            <div style={styles.entryHeader}>
              <div style={styles.roleAndCompany}>
                <span>{exp.position}</span>
                <span style={styles.companyName}>{exp.company}</span>
              </div>
              <div style={styles.dateLocation}>
                <div style={styles.date}>
                  {exp.startDate} - {exp.endDate || 'Present'}
                </div>
                {exp.location && <div style={styles.location}>{exp.location}</div>}
              </div>
            </div>
            
            {exp.description && (
              <div style={styles.description}>{exp.description}</div>
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
              {edu.location && <span>{edu.location} | </span>}
              <span>{edu.startDate} - {edu.endDate || 'Present'}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Organize skills into categories for better presentation
    // Emphasize leadership skills for executive template
    const leadershipSkills = content.skills.filter(s => 
      s.toLowerCase().includes('leadership') || 
      s.toLowerCase().includes('management') || 
      s.toLowerCase().includes('strategic') ||
      s.toLowerCase().includes('executive') ||
      s.toLowerCase().includes('vision') ||
      s.toLowerCase().includes('board') ||
      s.toLowerCase().includes('c-suite')
    );
    
    const businessSkills = content.skills.filter(s => 
      s.toLowerCase().includes('business') || 
      s.toLowerCase().includes('finance') || 
      s.toLowerCase().includes('operations') ||
      s.toLowerCase().includes('revenue') ||
      s.toLowerCase().includes('growth') ||
      s.toLowerCase().includes('profit') ||
      s.toLowerCase().includes('sales') ||
      s.toLowerCase().includes('marketing')
    );
    
    const technicalSkills = content.skills.filter(s => 
      !leadershipSkills.includes(s) && !businessSkills.includes(s)
    );
    
    return (
      <div style={styles.skills}>
        <div style={styles.sectionTitle}>Areas of Expertise</div>
        
        {leadershipSkills.length > 0 && (
          <div style={styles.skillCategory}>
            <div style={styles.skillCategoryTitle}>Leadership & Strategy</div>
            <div style={styles.skillGroup}>
              {leadershipSkills.map((skill, index) => (
                <div key={index} style={styles.skillItem}>• {skill}</div>
              ))}
            </div>
          </div>
        )}
        
        {businessSkills.length > 0 && (
          <div style={styles.skillCategory}>
            <div style={styles.skillCategoryTitle}>Business Acumen</div>
            <div style={styles.skillGroup}>
              {businessSkills.map((skill, index) => (
                <div key={index} style={styles.skillItem}>• {skill}</div>
              ))}
            </div>
          </div>
        )}
        
        {technicalSkills.length > 0 && (
          <div style={styles.skillCategory}>
            <div style={styles.skillCategoryTitle}>Technical Expertise</div>
            <div style={styles.skillGroup}>
              {technicalSkills.map((skill, index) => (
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
        <div style={styles.sectionTitle}>Key Initiatives & Projects</div>
        
        {content.projects.map((project, index) => (
          <div key={index} style={styles.experienceEntry}>
            <div style={styles.entryHeader}>
              <div style={styles.roleAndCompany}>
                <span>{project.name}</span>
              </div>
              {(project.startDate || project.endDate) && (
                <div style={styles.dateLocation}>
                  <div>
                    {project.startDate} - {project.endDate || 'Present'}
                  </div>
                </div>
              )}
            </div>
            
            <div style={styles.description}>{project.description}</div>
            
            {project.technologies && project.technologies.length > 0 && (
              <div style={{marginBottom: '0.5rem', fontStyle: 'italic'}}>
                Technologies: {project.technologies.join(', ')}
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
          <div key={i} style={styles.experienceEntry}>
            {item.title && (
              <div style={{...styles.roleAndCompany, justifyContent: 'flex-start'}}>
                {item.title}
              </div>
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

  // Determine which sections go in the main column vs side column
  const mainColumnSections: ResumeSection[] = ['summary', 'experience', 'projects', 'customSections'];
  const sideColumnSections: ResumeSection[] = ['skills', 'education', 'certifications'];

  return (
    <div style={styles.container}>
      {/* Header section with name and contact info */}
      {renderHeader()}
      
      {/* Main content in two-column layout */}
      <div style={styles.twoColumnLayout}>
        {/* Main column - Summary, Experience, Projects */}
        <div style={styles.mainColumn}>
          {sectionOrder
            .filter(sectionId => 
              sectionId !== 'contactInfo' && 
              mainColumnSections.includes(sectionId)
            )
            .map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderSectionById(sectionId)}
              </React.Fragment>
            ))}
        </div>
        
        {/* Side column - Skills, Education, Certifications */}
        <div style={styles.sideColumn}>
          {sectionOrder
            .filter(sectionId => 
              sectionId !== 'contactInfo' && 
              sideColumnSections.includes(sectionId)
            )
            .map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderSectionById(sectionId)}
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveTemplate; 