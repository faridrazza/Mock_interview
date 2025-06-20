import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const ModernPhotoTemplate: React.FC<ResumeTemplateProps> = ({ 
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
      maxWidth: '100%'
    },
    header: {
      marginBottom: '1.5rem',
      borderBottom: `2px solid ${accentColor}`,
      paddingBottom: '1rem'
    },
    headerInfo: {
      width: '100%'
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '0.5rem'
    },
    title: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      color: '#64748b',
      marginBottom: '0.75rem'
    },
    contactRow: {
      display: 'flex' as const,
      flexWrap: 'wrap' as const,
      gap: '1.25rem',
      marginTop: '0.5rem',
      fontSize: fontSizeMap[fontSize].small
    },
    contactItem: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      color: '#64748b',
      gap: '0.25rem'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem'
    },
    leftColumn: {},
    rightColumn: {},
    section: {
      marginBottom: spacingMap[spacing].section
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '0.75rem',
      paddingBottom: '0.25rem',
      borderBottom: `1px solid ${accentColor}`
    },
    sectionContent: {
      marginTop: '0.75rem'
    },
    summaryText: {
      lineHeight: '1.5'
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    jobTitle: {
      fontWeight: 'bold'
    },
    company: {
      fontStyle: 'italic'
    },
    dateLocation: {
      display: 'flex' as const,
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      marginBottom: '0.5rem',
      marginTop: '0.25rem'
    },
    bulletList: {
      listStyleType: 'disc',
      paddingLeft: '1rem',
      marginTop: '0.5rem'
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item
    },
    skillCategories: {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      gap: '0.75rem'
    },
    skillCategory: {
      marginBottom: '0.5rem'
    },
    skillCategoryTitle: {
      fontWeight: 'bold',
      fontSize: fontSizeMap[fontSize].small,
      marginBottom: '0.25rem'
    },
    skillList: {
      display: 'flex' as const,
      flexWrap: 'wrap' as const,
      gap: '0.25rem'
    },
    skillItem: {
      backgroundColor: '#f1f5f9',
      padding: '0.1rem 0.4rem',
      borderRadius: '2px',
      fontSize: fontSizeMap[fontSize].small,
      color: '#475569'
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    degree: {
      fontWeight: 'bold'
    },
    institution: {
      fontStyle: 'italic'
    },
    certificationEntry: {
      marginBottom: '0.4rem'
    },
    certName: {
      fontWeight: 'bold'
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b'
    },
    languageList: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem'
    },
    languageEntry: {
      display: 'flex',
      flexDirection: 'column' as const,
      fontSize: fontSizeMap[fontSize].small
    },
    languageName: {
      fontWeight: 'bold'
    },
    progressBar: {
      width: '100%',
      height: '4px',
      backgroundColor: '#e2e8f0',
      borderRadius: '2px',
      marginTop: '0.15rem'
    },
    progressFill: {
      height: '100%',
      backgroundColor: accentColor,
      borderRadius: '2px'
    }
  };

  // Render summary section
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Summary</div>
        <div style={styles.summaryText}>{content.summary}</div>
      </div>
    );
  };

  // Render experience section
  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Experience</div>
        <div style={styles.sectionContent}>
          {content.experience.map((exp, index) => (
            <div key={index} style={styles.experienceEntry}>
              <div>
                <span style={styles.jobTitle}>{exp.position}</span>
                {exp.company && (
                  <span> at <span style={styles.company}>{exp.company}</span></span>
                )}
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
      </div>
    );
  };

  // Render education section
  const renderEducation = () => {
    if (!content.education || content.education.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Education</div>
        <div style={styles.sectionContent}>
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
              {edu.gpa && (
                <div style={{ fontSize: fontSizeMap[fontSize].small }}>
                  GPA: {edu.gpa}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render skills section with categories
  // In this template, we group skills in categories
  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // For sake of example, let's manually group skills into categories
    // In a real implementation, you'd probably have skills already categorized in the data model
    const skills = content.skills;
    const technicalSkills = skills.filter(s => 
      s.toLowerCase().includes('java') || 
      s.toLowerCase().includes('python') || 
      s.toLowerCase().includes('react') ||
      s.toLowerCase().includes('node') ||
      s.toLowerCase().includes('cloud') ||
      s.toLowerCase().includes('sql')
    );
    
    const softSkills = skills.filter(s => 
      s.toLowerCase().includes('leadership') || 
      s.toLowerCase().includes('communication') || 
      s.toLowerCase().includes('team') ||
      s.toLowerCase().includes('problem') ||
      s.toLowerCase().includes('management')
    );
    
    const otherSkills = skills.filter(s => 
      !technicalSkills.includes(s) && !softSkills.includes(s)
    );
    
    const categories = [
      { title: 'Technical Skills', skills: technicalSkills },
      { title: 'Soft Skills', skills: softSkills },
      { title: 'Other Skills', skills: otherSkills }
    ].filter(category => category.skills.length > 0);
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Skills</div>
        <div style={styles.skillCategories}>
          {categories.map((category, i) => (
            <div key={i} style={styles.skillCategory}>
              {categories.length > 1 && (
                <div style={styles.skillCategoryTitle}>{category.title}</div>
              )}
              <div style={styles.skillList}>
                {category.skills.map((skill, j) => (
                  skill.trim() && (
                    <div key={j} style={styles.skillItem}>{skill}</div>
                  )
                ))}
              </div>
            </div>
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
        <div style={styles.sectionTitle}>Certifications</div>
        <div style={styles.sectionContent}>
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
      </div>
    );
  };

  // Render custom sections - we'll use this for languages
  // This is a bit of a hack - in a real implementation, you'd have a dedicated section for languages
  const renderLanguages = () => {
    // Try to find a custom section that might be for languages
    const languageSection = content.customSections?.find(
      section => section.title.toLowerCase().includes('language')
    );
    
    if (languageSection && languageSection.items.length > 0) {
      return (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Languages</div>
          <div style={styles.languageList}>
            {languageSection.items.map((item, i) => {
              // Try to parse a proficiency level from the description
              let proficiency = 0.8; // Default to 80%
              if (item.description) {
                const lowerDesc = item.description.toLowerCase();
                if (lowerDesc.includes('native') || lowerDesc.includes('fluent')) {
                  proficiency = 1;
                } else if (lowerDesc.includes('advanced')) {
                  proficiency = 0.85;
                } else if (lowerDesc.includes('intermediate')) {
                  proficiency = 0.6;
                } else if (lowerDesc.includes('basic') || lowerDesc.includes('beginner')) {
                  proficiency = 0.3;
                }
              }
              
              return (
                <div key={i} style={styles.languageEntry}>
                  <div style={styles.languageName}>{item.title}</div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${proficiency * 100}%`
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Render projects section
  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Projects</div>
        <div style={styles.sectionContent}>
          {content.projects.map((project, index) => (
            <div key={index} style={styles.experienceEntry}>
              <div style={styles.jobTitle}>{project.name}</div>
              {(project.startDate || project.endDate) && (
                <div style={{ ...styles.dateLocation, justifyContent: 'flex-start' }}>
                  {project.startDate && project.startDate}
                  {project.startDate && project.endDate && ' - '}
                  {project.endDate && project.endDate}
                </div>
              )}
              {project.description && <div>{project.description}</div>}
              {project.technologies && project.technologies.length > 0 && (
                <div style={styles.skillList}>
                  {project.technologies.map((tech, i) => (
                    <div key={i} style={styles.skillItem}>{tech}</div>
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
      </div>
    );
  };

  // Render other custom sections
  const renderCustomSections = () => {
    if (!content.customSections || content.customSections.length === 0) return null;
    
    // Filter out language section if we have one
    const languageTitle = content.customSections.find(
      section => section.title.toLowerCase().includes('language')
    )?.title;
    
    const otherSections = content.customSections.filter(
      section => section.title !== languageTitle
    );
    
    if (otherSections.length === 0) return null;
    
    return otherSections.map((section, index) => (
      <div key={index} style={styles.section}>
        <div style={styles.sectionTitle}>{section.title}</div>
        <div style={styles.sectionContent}>
          {section.items.map((item, i) => (
            <div key={i} style={styles.experienceEntry}>
              {item.title && (
                <div style={styles.jobTitle}>{item.title}</div>
              )}
              {item.subtitle && (
                <div style={styles.company}>{item.subtitle}</div>
              )}
              {item.date && (
                <div style={{ ...styles.dateLocation, justifyContent: 'flex-start' }}>
                  {item.date}
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
      </div>
    ));
  };

  // Organize sections into left and right columns
  const leftColumnSections: ResumeSection[] = ['summary', 'experience', 'education'];
  const rightColumnSections: ResumeSection[] = ['skills', 'projects', 'certifications', 'customSections'];

  // Helper to render a section by ID in the left column
  const renderLeftSectionById = (sectionId: ResumeSection) => {
    switch(sectionId) {
      case 'summary':
        return renderSummary();
      case 'experience':
        return renderExperience();
      case 'education':
        return renderEducation();
      default:
        return null;
    }
  };

  // Helper to render a section by ID in the right column
  const renderRightSectionById = (sectionId: ResumeSection) => {
    switch(sectionId) {
      case 'skills':
        return renderSkills();
      case 'projects':
        return renderProjects();
      case 'certifications':
        return renderCertifications();
      case 'customSections':
        // We handle custom sections specially to split languages
        return (
          <>
            {renderLanguages()}
            {renderCustomSections()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with contact info (removed photo) */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
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
          </div>
        </div>
      </div>
      
      {/* Main two-column layout */}
      <div style={styles.mainContent}>
        {/* Left column with main sections */}
        <div style={styles.leftColumn}>
          {sectionOrder
            .filter(section => leftColumnSections.includes(section))
            .map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderLeftSectionById(sectionId)}
              </React.Fragment>
            ))}
        </div>
        
        {/* Right column with side sections */}
        <div style={styles.rightColumn}>
          {sectionOrder
            .filter(section => rightColumnSections.includes(section))
            .map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderRightSectionById(sectionId)}
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ModernPhotoTemplate; 