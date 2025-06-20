import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica-bold@1.0.4/Helvetica-Bold.ttf', fontWeight: 700 }
  ]
});

interface TechnicalResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const TechnicalResumePDF: React.FC<TechnicalResumePDFProps> = ({ 
  content, 
  accentColor = '#0d9488',
  fontSize = 'medium',
  spacing = 'normal'
}) => {
  // Calculate content volume
  const contentVolume = calculateContentVolume(content);
  
  // Get dynamic spacing based on content volume
  const dynamicSpacing = getDynamicSpacing(contentVolume, spacing);

  // Font size mappings
  const fontSizeMap = {
    small: {
      name: 12,
      sectionTitle: 9,
      normal: 7,
      small: 6
    },
    medium: {
      name: 14,
      sectionTitle: 10,
      normal: 8,
      small: 7
    },
    large: {
      name: 16,
      sectionTitle: 12,
      normal: 9,
      small: 8
    }
  };

  // Spacing mappings - now using dynamic spacing
  const spacingMap = {
    compact: {
      section: dynamicSpacing.sectionSpacing,
      entry: dynamicSpacing.entrySpacing,
      item: dynamicSpacing.itemSpacing,
      itemSpacing: dynamicSpacing.itemSpacing,
    },
    normal: {
      section: dynamicSpacing.sectionSpacing,
      entry: dynamicSpacing.entrySpacing,
      item: dynamicSpacing.itemSpacing,
      itemSpacing: dynamicSpacing.itemSpacing,
    },
    spacious: {
      section: dynamicSpacing.sectionSpacing,
      entry: dynamicSpacing.entrySpacing,
      item: dynamicSpacing.itemSpacing,
      itemSpacing: dynamicSpacing.itemSpacing,
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

  // Define which sections go in main column vs side column
  const mainColumnSections: ResumeSection[] = ['summary', 'experience', 'projects', 'customSections'];
  const sideColumnSections: ResumeSection[] = ['skills', 'education', 'certifications'];

  // Create styles with dynamic properties
  const styles = StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: dynamicSpacing.lineHeight,
      color: '#1f2937',
      padding: 30,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacingMap[spacing].section,
      borderBottom: `1 solid ${accentColor}`,
      paddingBottom: 10
    },
    headerLeft: {
      flexDirection: 'column',
      flexGrow: 1
    },
    headerRight: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'center'
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 4
    },
    title: {
      fontSize: fontSizeMap[fontSize].sectionTitle - 1,
      color: '#4b5563'
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      marginBottom: 2
    },
    contentLayout: {
      flexDirection: 'row',
      gap: 15
    },
    mainColumn: {
      width: '65%'
    },
    sideColumn: {
      width: '35%',
      backgroundColor: '#f8fafc',
      padding: 10,
      borderRadius: 5,
      border: '1 solid #e2e8f0'
    },
    section: {
      marginBottom: spacingMap[spacing].section,
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 8,
      paddingBottom: 2,
      borderBottom: `1 solid ${accentColor}`
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    roleAndCompany: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#6b7280',
      marginBottom: 5
    },
    description: {
      marginBottom: 5
    },
    bulletList: {
      marginTop: 4
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: spacingMap[spacing].itemSpacing,
    },
    bulletPoint: {
      width: 10,
    },
    bulletText: {
      flex: 1
    },
    skillCategory: {
      marginBottom: 8
    },
    skillCategoryTitle: {
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#4b5563'
    },
    skillBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4
    },
    skillName: {
      width: '50%',
      paddingRight: 5
    },
    skillLevel: {
      width: '50%',
      height: 4,
      backgroundColor: '#e2e8f0',
      borderRadius: 2
    },
    skillLevelFill: {
      height: '100%',
      backgroundColor: accentColor,
      borderRadius: 2
    },
    educationEntry: {
      marginBottom: 6
    },
    degree: {
      fontWeight: 'bold',
      marginBottom: 2
    },
    institution: {
      marginBottom: 1
    },
    certEntry: {
      marginBottom: 4
    },
    certName: {
      fontWeight: 'bold',
      marginBottom: 1
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#6b7280'
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    projectHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3
    },
    projectName: {
      fontWeight: 'bold',
      color: accentColor
    },
    technologies: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
      marginBottom: 4,
      gap: 4
    },
    technologyTag: {
      backgroundColor: `${accentColor}20`,
      padding: '2 5',
      borderRadius: 2,
      fontSize: fontSizeMap[fontSize].small
    }
  });

  // Helper functions for rendering sections
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.name}>{content.contactInfo.name}</Text>
        {content.experience && content.experience.length > 0 && content.experience[0].position && (
          <Text style={styles.title}>{content.experience[0].position}</Text>
        )}
      </View>
      
      <View style={styles.headerRight}>
        {content.contactInfo.email && (
          <Text style={styles.contactItem}>{content.contactInfo.email}</Text>
        )}
        {content.contactInfo.phone && (
          <Text style={styles.contactItem}>{content.contactInfo.phone}</Text>
        )}
        {content.contactInfo.location && (
          <Text style={styles.contactItem}>{content.contactInfo.location}</Text>
        )}
        {content.contactInfo.linkedin && (
          <Text style={styles.contactItem}>{content.contactInfo.linkedin}</Text>
        )}
        {content.contactInfo.github && (
          <Text style={styles.contactItem}>{content.contactInfo.github}</Text>
        )}
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text>{content.summary}</Text>
    </View>
  );

  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Categorize skills
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
        <View style={styles.skillCategory}>
          <Text style={styles.skillCategoryTitle}>{title}</Text>
          {skills.map((skill, index) => {
            // Simulating skill level
            let level = 0.7; // Default 70%
            
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
            
            // Clean up skill name
            let cleanName = skill
              .replace(/\(.*?\)/g, '')
              .replace(/(advanced|expert|proficient|intermediate|basic|beginner)/i, '')
              .trim();
              
            return (
              <View key={index} style={styles.skillBar}>
                <Text style={styles.skillName}>{cleanName}</Text>
                <View style={styles.skillLevel}>
                  <View style={[styles.skillLevelFill, { width: `${level * 100}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      );
    };
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {renderSkillCategory('Programming Languages', programmingLanguages)}
        {renderSkillCategory('Frameworks & Libraries', frameworks)}
        {renderSkillCategory('Databases', databases)}
        {renderSkillCategory('Tools & Platforms', tools)}
        {renderSkillCategory('Other Skills', otherSkills)}
      </View>
    );
  };

  const renderExperience = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {content.experience && content.experience.map((exp, index) => (
        <View key={index} style={styles.experienceEntry}>
          <View style={styles.roleAndCompany}>
            <Text style={styles.jobTitle}>{exp.position}</Text>
            <Text style={styles.company}>{exp.company}</Text>
          </View>
          <View style={styles.dateLocation}>
            <Text>
              {exp.startDate} - {exp.endDate || 'Present'}
            </Text>
            {exp.location && <Text>{exp.location}</Text>}
          </View>
          
          {exp.description && (
            <Text style={styles.description}>{exp.description}</Text>
          )}
          
          {exp.achievements && exp.achievements.filter(a => a.trim()).length > 0 && (
            <View style={styles.bulletList}>
              {exp.achievements.filter(a => a.trim()).map((achievement, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{achievement}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderProjects = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {content.projects && content.projects.map((project, index) => (
        <View key={index} style={styles.projectEntry}>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{project.name}</Text>
            {(project.startDate || project.endDate) && (
              <Text style={styles.certDetails}>
                {project.startDate}{project.endDate ? ` - ${project.endDate}` : ''}
              </Text>
            )}
          </View>
          
          <Text style={styles.description}>{project.description}</Text>
          
          {project.technologies && project.technologies.length > 0 && (
            <View style={styles.technologies}>
              {project.technologies.map((tech, i) => (
                <View key={i} style={styles.technologyTag}>
                  <Text>{tech}</Text>
                </View>
              ))}
            </View>
          )}
          
          {project.achievements && project.achievements.filter(a => a.trim()).length > 0 && (
            <View style={styles.bulletList}>
              {project.achievements.filter(a => a.trim()).map((achievement, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{achievement}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderEducation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      {content.education && content.education.map((edu, index) => (
        <View key={index} style={styles.educationEntry}>
          <Text style={styles.degree}>
            {edu.degree}{edu.field ? `, ${edu.field}` : ''}
          </Text>
          <Text style={styles.institution}>{edu.institution}</Text>
          <View style={styles.dateLocation}>
            <Text style={styles.certDetails}>
              {edu.startDate} - {edu.endDate || 'Present'}
            </Text>
            {edu.location && <Text style={styles.certDetails}>{edu.location}</Text>}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {content.certifications && content.certifications.map((cert, index) => (
        <View key={index} style={styles.certEntry}>
          <Text style={styles.certName}>{cert.name}</Text>
          <Text style={styles.certDetails}>
            {cert.issuer && `${cert.issuer}`}
            {cert.date && cert.issuer && ' | '}
            {cert.date && `${cert.date}`}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderCustomSections = () => (
    <>
      {content.customSections && content.customSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={{marginBottom: spacingMap[spacing].entry}}>
              {item.title && <Text style={{fontWeight: 'bold'}}>{item.title}</Text>}
              {item.subtitle && <Text>{item.subtitle}</Text>}
              {item.date && <Text style={{fontSize: fontSizeMap[fontSize].small, color: '#6b7280'}}>{item.date}</Text>}
              {item.description && <Text style={{marginTop: 2}}>{item.description}</Text>}
              
              {item.bullets && item.bullets.filter(b => b.trim()).length > 0 && (
                <View style={styles.bulletList}>
                  {item.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                    <View key={bulletIndex} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </>
  );

  // Helper to render a section by ID
  const renderSectionById = (sectionId: ResumeSection) => {
    switch(sectionId) {
      case 'summary':
        return content.summary ? renderSummary() : null;
      case 'experience':
        return content.experience && content.experience.length > 0 ? renderExperience() : null;
      case 'education':
        return content.education && content.education.length > 0 ? renderEducation() : null;
      case 'skills':
        return content.skills && content.skills.length > 0 ? renderSkills() : null;
      case 'certifications':
        return content.certifications && content.certifications.length > 0 ? renderCertifications() : null;
      case 'projects':
        return content.projects && content.projects.length > 0 ? renderProjects() : null;
      case 'customSections':
        return content.customSections && content.customSections.length > 0 ? renderCustomSections() : null;
      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        
        {/* Main content in two-column layout */}
        <View style={styles.contentLayout}>
          {/* Main column - Summary, Experience, Projects */}
          <View style={styles.mainColumn}>
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
          </View>
          
          {/* Side column - Skills, Education, Certifications */}
          <View style={styles.sideColumn}>
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
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default TechnicalResumePDF; 