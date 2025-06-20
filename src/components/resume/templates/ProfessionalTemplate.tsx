import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const ProfessionalTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#14532D'
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
      section: 1,
      entry: 0.75,
      item: 0.4
    },
    normal: {
      section: 1.4,
      entry: 1,
      item: 0.5
    },
    spacious: {
      section: 1.8,
      entry: 1.3,
      item: 0.7
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
  
  sectionOrder.forEach((section) => {
    // Experience, projects, and summary go in the left column
    if (section === 'experience' || section === 'projects') {
      leftColumnSections.push(section);
    } else if (section !== 'contactInfo' && section !== 'summary') { 
      // Everything else except contact info and summary go in the right column
      rightColumnSections.push(section);
    }
  });
  
  // Add summary first if it exists in the section order
  const hasSummary = sectionOrder.includes('summary');

  const styles = {
    container: {
      fontFamily: '"Times New Roman", Baskerville, serif',
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: '1.4',
      color: '#333',
      maxWidth: '100%',
      padding: '1.5rem',
      borderTop: `5px solid ${accentColor}`
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: `${spacingMap[spacing].section * 1.5}rem`,
      borderBottom: `1px solid #E7E5E4`,
      paddingBottom: '1rem',
    },
    headerLeft: {
      flex: '2',
    },
    headerRight: {
      flex: '1',
      textAlign: 'right' as const
    },
    headerName: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      marginBottom: '0.25rem',
      color: accentColor,
      letterSpacing: '0.05em'
    },
    headerTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      color: '#57534E',
      marginBottom: '0.5rem',
      fontWeight: 'normal',
      fontStyle: 'italic'
    },
    contactInfo: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#57534E',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem'
    },
    mainContent: {
      display: 'flex',
      gap: '2rem'
    },
    leftColumn: {
      flex: '2'
    },
    rightColumn: {
      flex: '1'
    },
    section: {
      marginBottom: `${spacingMap[spacing].section * 1.2}rem`
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      marginBottom: '0.75rem',
      color: accentColor,
      letterSpacing: '0.05em',
      position: 'relative' as const,
      display: 'inline-block',
      paddingBottom: '0.25rem',
      borderBottom: `2px solid ${accentColor}`
    },
    entry: {
      marginBottom: `${spacingMap[spacing].entry * 1.5}rem`
    },
    entryHeader: {
      marginBottom: '0.5rem'
    },
    roleAndCompany: {
      fontSize: `${parseFloat(fontSizeMap[fontSize].normal) * 1.1}rem`,
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    location: {
      color: '#78716C',
      fontSize: fontSizeMap[fontSize].small,
      fontStyle: 'italic',
      display: 'inline-block',
      marginRight: '0.75rem'
    },
    date: {
      color: '#78716C',
      fontSize: fontSizeMap[fontSize].small,
      display: 'inline-block'
    },
    description: {
      margin: '0.5rem 0',
      color: '#44403C',
      lineHeight: '1.5'
    },
    bulletList: {
      margin: '0.5rem 0 0 0',
      paddingLeft: '1.25rem',
      listStyleType: 'square'
    },
    bulletItem: {
      marginBottom: `${spacingMap[spacing].item}rem`,
      paddingLeft: '0.25rem',
      lineHeight: '1.4',
      color: '#44403C'
    },
    skillsSection: {
      marginBottom: `${spacingMap[spacing].section}rem`
    },
    skillCategory: {
      marginBottom: '0.75rem'
    },
    skillCategoryTitle: {
      fontWeight: 'bold',
      fontSize: fontSizeMap[fontSize].normal,
      marginBottom: '0.5rem',
      color: '#57534E'
    },
    skillList: {
      columns: '2',
      columnGap: '1rem'
    },
    skillItem: {
      padding: '0.2rem 0',
      pageBreakInside: 'avoid' as const,
      breakInside: 'avoid' as const
    },
    educationEntry: {
      marginBottom: '0.75rem'
    },
    degree: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    institution: {
      fontStyle: 'italic',
      marginBottom: '0.25rem'
    },
    summary: {
      fontSize: `${parseFloat(fontSizeMap[fontSize].normal) * 1.05}rem`,
      color: '#44403C',
      lineHeight: '1.6',
      fontStyle: 'italic',
      padding: '0.75rem 1rem',
      borderLeft: `3px solid ${accentColor}`,
      marginBottom: `${spacingMap[spacing].section}rem`
    },
    certification: {
      marginBottom: '0.5rem'
    },
    certName: {
      fontWeight: 'bold',
      marginBottom: '0.1rem'
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#78716C'
    },
    projects: {
      marginBottom: `${spacingMap[spacing].section}rem`
    },
    projectName: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    projectTech: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#78716C',
      fontStyle: 'italic',
      marginBottom: '0.5rem'
    }
  };

  // Format name properly for professional presentation
  const formatName = (name: string) => {
    return name.toUpperCase();
  };

  // Render header section
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <div style={styles.headerName}>{formatName(content.contactInfo.name)}</div>
        {content.experience && content.experience.length > 0 && content.experience[0].position && (
          <div style={styles.headerTitle}>{content.experience[0].position}</div>
        )}
      </div>
      <div style={styles.headerRight}>
        <div style={styles.contactInfo}>
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
        </div>
      </div>
    </div>
  );

  // Render summary section
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.summary}>
        {content.summary}
      </div>
    );
  };

  // Render experience section
  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Professional Experience</div>
        
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.entry}>
            <div style={styles.entryHeader}>
              <div style={styles.roleAndCompany}>
                {exp.position} | {exp.company}
              </div>
              <div>
                {exp.location && <span style={styles.location}>{exp.location}</span>}
                <span style={styles.date}>
                  {exp.startDate} – {exp.endDate || 'Present'}
                </span>
              </div>
            </div>
            
            {exp.description && (
              <div style={styles.description}>{exp.description}</div>
            )}
            
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

  // Render projects section
  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <div style={styles.projects}>
        <div style={styles.sectionTitle}>Selected Projects</div>
        
        {content.projects.map((project, index) => (
          <div key={index} style={styles.entry}>
            <div style={styles.projectName}>{project.name}</div>
            {project.technologies && project.technologies.length > 0 && (
              <div style={styles.projectTech}>
                Technologies: {project.technologies.join(', ')}
              </div>
            )}
            
            {project.description && (
              <div style={styles.description}>{project.description}</div>
            )}
            
            {project.achievements && project.achievements.length > 0 && (
              <ul style={styles.bulletList}>
                {project.achievements.map((achievement, i) => (
                  achievement.trim() ? (
                    <li key={i} style={styles.bulletItem}>{achievement}</li>
                  ) : null
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
        <div style={styles.sectionTitle}>Education</div>
        
        {content.education.map((edu, index) => (
          <div key={index} style={styles.educationEntry}>
            <div style={styles.degree}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </div>
            <div style={styles.institution}>{edu.institution}</div>
            <div style={styles.date}>
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

  // Render skills section
  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    return (
      <div style={styles.skillsSection}>
        <div style={styles.sectionTitle}>Areas of Expertise</div>
        
        <div style={styles.skillCategory}>
          <div style={styles.skillCategoryTitle}>Technical Skills</div>
          <div style={styles.skillList}>
            {content.skills.filter(s => 
              s.toLowerCase().includes('python') || 
              s.toLowerCase().includes('java') ||
              s.toLowerCase().includes('c++') ||
              s.toLowerCase().includes('javascript') || 
              s.toLowerCase().includes('sql') ||
              s.toLowerCase().includes('react') ||
              s.toLowerCase().includes('node')
            ).map((skill, index) => (
              skill.trim() ? (
                <div key={index} style={styles.skillItem}>• {skill}</div>
              ) : null
            ))}
          </div>
        </div>
        
        <div style={styles.skillCategory}>
          <div style={styles.skillCategoryTitle}>Additional Skills</div>
          <div style={styles.skillList}>
            {content.skills.filter(s => 
              !s.toLowerCase().includes('python') && 
              !s.toLowerCase().includes('java') &&
              !s.toLowerCase().includes('c++') &&
              !s.toLowerCase().includes('javascript') &&
              !s.toLowerCase().includes('sql') &&
              !s.toLowerCase().includes('react') &&
              !s.toLowerCase().includes('node')
            ).map((skill, index) => (
              skill.trim() ? (
                <div key={index} style={styles.skillItem}>• {skill}</div>
              ) : null
            ))}
          </div>
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
        
        {content.certifications.map((cert, index) => (
          <div key={index} style={styles.certification}>
            <div style={styles.certName}>{cert.name}</div>
            <div style={styles.certDetails}>
              {cert.issuer && `${cert.issuer}`}
              {cert.issuer && cert.date && ' | '}
              {cert.date && `${cert.date}`}
            </div>
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
        <div style={styles.sectionTitle}>{section.title}</div>
        {section.items.map((item, i) => (
          <div key={i} style={styles.entry}>
            {item.title && (
              <div style={styles.certName}>{item.title}</div>
            )}
            {item.subtitle && (
              <div style={styles.institution}>{item.subtitle}</div>
            )}
            {item.date && (
              <div style={styles.date}>{item.date}</div>
            )}
            {item.description && (
              <div style={styles.description}>{item.description}</div>
            )}
            {item.bullets && item.bullets.length > 0 && (
              <ul style={styles.bulletList}>
                {item.bullets.map((bullet, j) => (
                  bullet.trim() ? (
                    <li key={j} style={styles.bulletItem}>{bullet}</li>
                  ) : null
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
      case 'customSections':
        return renderCustomSections();
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      {renderHeader()}

      {/* Summary - always displayed first if it exists in sectionOrder */}
      {hasSummary && content.summary && renderSummary()}

      <div style={styles.mainContent}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {leftColumnSections.map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSectionById(sectionId)}
            </React.Fragment>
          ))}
        </div>

        {/* Right Column */}
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

export default ProfessionalTemplate;
