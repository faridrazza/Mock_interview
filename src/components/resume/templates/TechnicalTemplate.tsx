import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import { ResumeSection } from '@/types/resume';

const TechnicalTemplate: React.FC<ResumeTemplateProps> = ({ 
  content, 
  fontSize = 'medium', 
  spacing = 'normal',
  accentColor = '#0d9488' 
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
      item: '0.3rem'
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
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'customSections'
  ];

  // Use section order from content, or fall back to default
  const sectionOrder = content.sectionOrder || defaultSectionOrder;

  const styles = {
    container: {
      fontFamily: 'Helvetica, Arial, sans-serif', // Using Helvetica as primary font for consistency with PDF export
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: '1.4',
      color: '#1f2937',
      padding: '1.5rem',
      maxWidth: '100%'
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '1rem',
      marginBottom: spacingMap[spacing].section,
      borderBottom: `2px solid ${accentColor}`,
      paddingBottom: '1rem'
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column' as const
    },
    headerRight: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '0.25rem'
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      letterSpacing: '0.01em',
      marginBottom: '0.25rem'
    },
    title: {
      fontSize: `calc(${fontSizeMap[fontSize].sectionTitle} * 0.9)`,
      color: '#4b5563'
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    layout: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '2rem',
      alignItems: 'start'
    },
    mainColumn: {},
    sideColumn: {
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      border: '1px solid #e2e8f0'
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: '0.75rem',
      paddingBottom: '0.25rem',
      borderBottom: `1px solid ${accentColor}`
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    summary: {
      marginBottom: spacingMap[spacing].section
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    entryHeader: {
      marginBottom: '0.25rem'
    },
    roleAndCompany: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      marginBottom: '0.25rem'
    },
    jobTitle: {
      fontWeight: 'bold',
      color: '#1f2937'
    },
    company: {
      fontWeight: 'bold',
      color: accentColor
    },
    dateLocation: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#6b7280',
      marginBottom: '0.5rem',
      flexWrap: 'wrap' as const
    },
    description: {
      marginBottom: '0.5rem'
    },
    bulletList: {
      margin: '0.5rem 0 0 0',
      paddingLeft: '1.25rem',
      listStyleType: 'disc'
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item,
      paddingLeft: '0.25rem'
    },
    skillsCategory: {
      marginBottom: '1rem'
    },
    skillCategoryTitle: {
      fontWeight: 'bold',
      fontSize: fontSizeMap[fontSize].normal,
      marginBottom: '0.5rem',
      color: '#4b5563'
    },
    skillBar: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    skillName: {
      width: '50%',
      paddingRight: '0.5rem'
    },
    skillLevel: {
      width: '50%',
      height: '0.5rem',
      backgroundColor: '#e2e8f0',
      borderRadius: '0.25rem',
      overflow: 'hidden',
      position: 'relative' as const
    },
    skillLevelFill: {
      height: '100%',
      backgroundColor: accentColor,
      borderRadius: '0.25rem'
    },
    educationEntry: {
      marginBottom: '0.75rem'
    },
    degree: {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    institution: {
      fontSize: fontSizeMap[fontSize].normal
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    projectHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '0.25rem'
    },
    projectName: {
      fontWeight: 'bold',
      color: accentColor
    },
    projectDescription: {
      marginBottom: '0.5rem'
    },
    technologies: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.25rem',
      marginTop: '0.5rem',
      marginBottom: '0.5rem'
    },
    technologyTag: {
      backgroundColor: `${accentColor}20`,
      color: accentColor,
      padding: '0.2rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: fontSizeMap[fontSize].small,
      fontWeight: 'bold'
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
      color: '#6b7280'
    }
  };

  // Render the header section with name, title, and contact info
  const renderHeader = () => (
    <div style={styles.header}>
      <div style={styles.headerLeft}>
        <div style={styles.name}>{content.contactInfo.name}</div>
        {content.experience && content.experience.length > 0 && content.experience[0].position && (
          <div style={styles.title}>{content.experience[0].position}</div>
        )}
      </div>
      
      <div style={styles.headerRight}>
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
        {content.contactInfo.github && (
          <div style={styles.contactItem}>{content.contactInfo.github}</div>
        )}
        {content.contactInfo.website && (
          <div style={styles.contactItem}>{content.contactInfo.website}</div>
        )}
      </div>
    </div>
  );

  // Render summary section
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <div style={styles.summary}>
        <div style={styles.sectionTitle}>Technical Profile</div>
        <div>{content.summary}</div>
      </div>
    );
  };

  // Render technical skills with skill bars
  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Categorize skills (simplified approach)
    const programmingLanguages = content.skills.filter(s => 
      s.toLowerCase().includes('python') ||
      s.toLowerCase().includes('java') ||
      s.toLowerCase().includes('c++') ||
      s.toLowerCase().includes('javascript') ||
      s.toLowerCase().includes('typescript') ||
      s.toLowerCase().includes('php') ||
      s.toLowerCase().includes('ruby') ||
      s.toLowerCase().includes('golang') ||
      s.toLowerCase().includes('scala')
    );
    
    const frameworks = content.skills.filter(s => 
      s.toLowerCase().includes('react') ||
      s.toLowerCase().includes('angular') ||
      s.toLowerCase().includes('vue') ||
      s.toLowerCase().includes('django') ||
      s.toLowerCase().includes('flask') ||
      s.toLowerCase().includes('spring') ||
      s.toLowerCase().includes('express') ||
      s.toLowerCase().includes('rails') ||
      s.toLowerCase().includes('laravel') ||
      s.toLowerCase().includes('.net')
    );
    
    const databases = content.skills.filter(s => 
      s.toLowerCase().includes('sql') ||
      s.toLowerCase().includes('mysql') ||
      s.toLowerCase().includes('postgresql') ||
      s.toLowerCase().includes('mongodb') ||
      s.toLowerCase().includes('oracle') ||
      s.toLowerCase().includes('redis') ||
      s.toLowerCase().includes('cassandra') ||
      s.toLowerCase().includes('dynamodb')
    );
    
    const tools = content.skills.filter(s => 
      s.toLowerCase().includes('git') ||
      s.toLowerCase().includes('docker') ||
      s.toLowerCase().includes('kubernetes') ||
      s.toLowerCase().includes('jenkins') ||
      s.toLowerCase().includes('aws') ||
      s.toLowerCase().includes('azure') ||
      s.toLowerCase().includes('gcp') ||
      s.toLowerCase().includes('terraform') ||
      s.toLowerCase().includes('ci/cd')
    );
    
    const otherSkills = content.skills.filter(s => 
      !programmingLanguages.includes(s) && 
      !frameworks.includes(s) && 
      !databases.includes(s) && 
      !tools.includes(s)
    );
    
    // Helper function to render skill category
    const renderSkillCategory = (title: string, skills: string[]) => {
      if (skills.length === 0) return null;
      
      return (
        <div style={styles.skillsCategory}>
          <div style={styles.skillCategoryTitle}>{title}</div>
          {skills.map((skill, index) => {
            // Simulating proficiency level with simple pattern matching
            // In a real app, you'd have actual data for this
            let level = 0.7; // Default to 70%
            
            if (skill.toLowerCase().includes('advanced') || 
                skill.toLowerCase().includes('expert') || 
                skill.toLowerCase().includes('proficient')) {
              level = 0.9;
            } else if (skill.toLowerCase().includes('intermediate')) {
              level = 0.7;
            } else if (skill.toLowerCase().includes('basic') || 
                       skill.toLowerCase().includes('beginner')) {
              level = 0.4;
            }
            
            // Clean up the skill name (remove proficiency indicators)
            let cleanName = skill
              .replace(/\(.*?\)/g, '')
              .replace(/(advanced|expert|proficient|intermediate|basic|beginner)/i, '')
              .trim();
            
            return (
              <div key={index} style={styles.skillBar}>
                <div style={styles.skillName}>{cleanName}</div>
                <div style={styles.skillLevel}>
                  <div 
                    style={{
                      ...styles.skillLevelFill,
                      width: `${level * 100}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    };
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Technical Skills</div>
        
        {renderSkillCategory('Programming Languages', programmingLanguages)}
        {renderSkillCategory('Frameworks & Libraries', frameworks)}
        {renderSkillCategory('Databases', databases)}
        {renderSkillCategory('Tools & Platforms', tools)}
        {renderSkillCategory('Other Skills', otherSkills)}
      </div>
    );
  };

  // Render work experience 
  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Work Experience</div>
        
        {content.experience.map((exp, index) => (
          <div key={index} style={styles.experienceEntry}>
            <div style={styles.entryHeader}>
              <div style={styles.roleAndCompany}>
                <span style={styles.jobTitle}>{exp.position}</span>
                <span style={styles.company}>{exp.company}</span>
              </div>
              <div style={styles.dateLocation}>
                <span>
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
                {exp.location && <span>{exp.location}</span>}
              </div>
            </div>
            
            {exp.description && (
              <div style={styles.description}>{exp.description}</div>
            )}
            
            {exp.achievements && exp.achievements.filter(a => a.trim()).length > 0 && (
              <ul style={styles.bulletList}>
                {exp.achievements.filter(a => a.trim()).map((achievement, i) => (
                  <li key={i} style={styles.bulletItem}>{achievement}</li>
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
            <div style={styles.dateLocation}>
              <span>
                {edu.startDate} - {edu.endDate || 'Present'}
              </span>
              {edu.location && <span>{edu.location}</span>}
            </div>
          </div>
        ))}
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

  // Render projects section with emphasis on technologies
  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Technical Projects</div>
        
        {content.projects.map((project, index) => (
          <div key={index} style={styles.projectEntry}>
            <div style={styles.projectHeader}>
              <div style={styles.projectName}>{project.name}</div>
              {(project.startDate || project.endDate) && (
                <div style={{fontSize: fontSizeMap[fontSize].small, color: '#6b7280'}}>
                  {project.startDate}{project.endDate ? ` - ${project.endDate}` : ''}
                </div>
              )}
            </div>
            
            <div style={styles.projectDescription}>{project.description}</div>
            
            {project.technologies && project.technologies.length > 0 && (
              <div style={styles.technologies}>
                {project.technologies.map((tech, i) => (
                  <div key={i} style={styles.technologyTag}>{tech}</div>
                ))}
              </div>
            )}
            
            {project.achievements && project.achievements.filter(a => a.trim()).length > 0 && (
              <ul style={styles.bulletList}>
                {project.achievements.filter(a => a.trim()).map((achievement, i) => (
                  <li key={i} style={styles.bulletItem}>{achievement}</li>
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
        <div style={styles.sectionTitle}>{section.title}</div>
        
        {section.items.map((item, i) => (
          <div key={i} style={styles.experienceEntry}>
            {item.title && (
              <div style={styles.jobTitle}>{item.title}</div>
            )}
            {item.subtitle && (
              <div style={styles.institution}>{item.subtitle}</div>
            )}
            {item.date && (
              <div style={{fontSize: fontSizeMap[fontSize].small, color: '#6b7280', marginBottom: '0.25rem'}}>
                {item.date}
              </div>
            )}
            {item.description && (
              <div style={styles.description}>{item.description}</div>
            )}
            
            {item.bullets && item.bullets.filter(b => b.trim()).length > 0 && (
              <ul style={styles.bulletList}>
                {item.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={styles.bulletItem}>{bullet}</li>
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

  // Determine which sections go in main column vs side column
  const mainColumnSections: ResumeSection[] = ['summary', 'experience', 'projects', 'customSections'];
  const sideColumnSections: ResumeSection[] = ['skills', 'education', 'certifications'];

  return (
    <div style={styles.container}>
      {/* Header section with name and contact info */}
      {renderHeader()}
      
      {/* Main content in two-column layout */}
      <div style={styles.layout}>
        {/* Main column - Experience and Projects */}
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

export default TechnicalTemplate; 