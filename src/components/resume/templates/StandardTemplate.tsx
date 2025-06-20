import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeContent, ResumeSection } from '@/types/resume';

const StandardTemplate: React.FC<ResumeTemplateProps> = ({ content, fontSize = 'medium', spacing = 'normal', accentColor = '#333' }) => {
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
      item: '0.5rem'
    },
    normal: {
      section: '1.75rem',
      entry: '1rem',
      item: '0.75rem'
    },
    spacious: {
      section: '2.25rem',
      entry: '1.5rem',
      item: '1rem'
    }
  };

  const styles = {
    container: {
      fontFamily: '"Roboto", "Open Sans", sans-serif',
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: '1.5',
      color: '#333'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '0.5rem'
    },
    headerName: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      marginBottom: '0.25rem',
      color: accentColor
    },
    contactInfo: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#555'
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      borderBottom: `1px solid ${accentColor}`,
      paddingBottom: '0.25rem',
      marginBottom: '0.75rem',
      color: accentColor
    },
    entry: {
      marginBottom: spacingMap[spacing].entry
    },
    entryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.25rem'
    },
    entryTitle: {
      fontWeight: 'bold'
    },
    entrySubtitle: {
      fontStyle: 'italic',
      color: '#4B5563'
    },
    entryDate: {
      color: '#6B7280'
    },
    entryLocation: {
      color: '#6B7280'
    },
    description: {
      margin: '0.5rem 0'
    },
    bulletList: {
      marginTop: '0.5rem',
      marginLeft: '1.5rem',
      paddingLeft: '1rem',
      listStyleType: 'disc'
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem'
    },
    skillItem: {
      fontSize: fontSizeMap[fontSize].small,
      marginRight: '0.5rem'
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

  // Helper function to render a specific section by its ID
  const renderSection = (sectionId: ResumeSection) => {
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

  // Header is always rendered first
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.headerName}>{content.contactInfo.name}</div>
      <div style={styles.contactInfo}>
        {content.contactInfo.email}
        {content.contactInfo.phone && ` • ${content.contactInfo.phone}`}
        {content.contactInfo.location && ` • ${content.contactInfo.location}`}
      </div>
      {(content.contactInfo.linkedin || content.contactInfo.website || content.contactInfo.github) && (
        <div style={styles.contactInfo}>
          {content.contactInfo.linkedin && content.contactInfo.linkedin}
          {content.contactInfo.website && 
            (content.contactInfo.linkedin ? ` • ${content.contactInfo.website}` : content.contactInfo.website)}
          {content.contactInfo.github && 
            ((content.contactInfo.linkedin || content.contactInfo.website) ? 
              ` • ${content.contactInfo.github}` : content.contactInfo.github)}
        </div>
      )}
    </div>
  );

  // Individual section rendering functions
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Summary</div>
        <div style={styles.description}>{content.summary}</div>
      </div>
    );
  };

  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Experience</div>
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.entry}>
            <div style={styles.entryHeader}>
              <div style={styles.entryTitle}>{exp.position}</div>
              <div style={styles.entryDate}>
                {exp.startDate} - {exp.endDate || 'Present'}
              </div>
            </div>
            <div style={styles.entryHeader}>
              <div style={styles.entrySubtitle}>{exp.company}</div>
              {exp.location && <div style={styles.entryLocation}>{exp.location}</div>}
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
          <div key={index} style={styles.entry}>
            <div style={styles.entryHeader}>
              <div style={styles.entryTitle}>
                {edu.degree}{edu.field && `, ${edu.field}`}
              </div>
              <div style={styles.entryDate}>
                {edu.startDate} - {edu.endDate || 'Present'}
              </div>
            </div>
            <div style={styles.entryHeader}>
              <div style={styles.entrySubtitle}>{edu.institution}</div>
              {edu.location && <div style={styles.entryLocation}>{edu.location}</div>}
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
        <div>
          {content.skills.map((skill, index) => (
            <span key={index}>
              {skill}
              {index < content.skills.length - 1 && <span style={{margin: '0 0.5rem'}}>•</span>}
            </span>
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
          <div key={index} style={{...styles.entry, marginBottom: spacingMap[spacing].item}}>
            <div style={styles.entryHeader}>
              <div style={styles.entryTitle}>{cert.name}</div>
              {cert.date && <div style={styles.entryDate}>{cert.date}</div>}
            </div>
            {cert.issuer && <div style={styles.entrySubtitle}>{cert.issuer}</div>}
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
          <div key={index} style={styles.entry}>
            <div style={styles.entryHeader}>
              <div style={styles.entryTitle}>{project.name}</div>
              {(project.startDate || project.endDate) && (
                <div style={styles.entryDate}>
                  {project.startDate && project.startDate}
                  {project.endDate && project.startDate && ` - ${project.endDate}`}
                  {project.endDate && !project.startDate && project.endDate}
                </div>
              )}
            </div>
            {project.description && <div style={styles.description}>{project.description}</div>}
            {project.technologies && project.technologies.length > 0 && (
              <div style={{...styles.description, fontStyle: 'italic'}}>
                <span style={{fontWeight: 'bold'}}>Technologies: </span>
                {project.technologies.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCustomSections = () => {
    if (!content.customSections || content.customSections.length === 0) return null;
    
    return content.customSections.map((customSection, sectionIndex) => (
      <div key={sectionIndex} style={styles.section}>
        <div style={styles.sectionTitle}>{customSection.title}</div>
        {customSection.items.map((item, index) => (
          <div key={index} style={styles.entry}>
            {item.title && (
              <div style={styles.entryHeader}>
                <div style={styles.entryTitle}>{item.title}</div>
                {item.date && <div style={styles.entryDate}>{item.date}</div>}
              </div>
            )}
            {item.subtitle && <div style={styles.entrySubtitle}>{item.subtitle}</div>}
            {item.description && <div style={styles.description}>{item.description}</div>}
            {item.bullets && item.bullets.length > 0 && (
              <ul style={styles.bulletList}>
                {item.bullets.map((bullet, i) => (
                  bullet.trim() && (
                    <li key={i} style={styles.bulletItem}>{bullet}</li>
                  )
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      {/* Header is always at the top */}
      {renderHeader()}

      {/* Render sections based on the order specified in sectionOrder */}
      {sectionOrder.map(sectionId => {
        const sectionContent = renderSection(sectionId);
        // Only render if there's actual content to show
        return sectionContent ? (
          <div key={sectionId} data-section-id={sectionId}>
            {sectionContent}
          </div>
        ) : null;
      })}
    </div>
  );
};

export default StandardTemplate;
