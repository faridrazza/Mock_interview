import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

interface ModernPhotoResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const ModernPhotoResumePDF: React.FC<ModernPhotoResumePDFProps> = ({ 
  content, 
  accentColor = '#2563eb',
  fontSize = 'medium',
  spacing = 'normal'
}) => {
  // Log to verify our updated version is being used
  console.log('Using updated ModernPhotoResumePDF (no photo, projects in right column)');
  
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
      small: 6,
    },
    medium: {
      name: 14,
      sectionTitle: 10,
      normal: 8,
      small: 7,
    },
    large: {
      name: 16,
      sectionTitle: 12,
      normal: 9,
      small: 8,
    }
  };

  // Spacing mappings
  const spacingMap = {
    compact: {
      section: dynamicSpacing.sectionSpacing,
      entry: dynamicSpacing.entrySpacing,
      item: dynamicSpacing.itemSpacing,
    },
    normal: {
      section: dynamicSpacing.sectionSpacing,
      entry: dynamicSpacing.entrySpacing,
      item: dynamicSpacing.itemSpacing,
    },
    spacious: {
      section: dynamicSpacing.sectionSpacing,
      entry: dynamicSpacing.entrySpacing,
      item: dynamicSpacing.itemSpacing,
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
  
  // Create styles with dynamic properties
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#FFFFFF',
      fontFamily: 'Roboto',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#334155',
      padding: 30,
      lineHeight: dynamicSpacing.lineHeight,
    },
    header: {
      marginBottom: 20,
      borderBottom: `1 solid ${accentColor}`,
      paddingBottom: 15,
    },
    headerInfo: {
      width: '100%',
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 5,
    },
    title: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      color: '#64748b',
      marginBottom: 10,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      marginRight: 20,
      marginBottom: 5,
    },
    mainContent: {
      flexDirection: 'row',
    },
    leftColumn: {
      width: '67%',
      paddingRight: 15,
    },
    rightColumn: {
      width: '33%',
      paddingLeft: 5,
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
      borderBottom: `1 solid ${accentColor}`,
    },
    summaryText: {
      marginBottom: 10,
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    entryHeader: {
      marginBottom: 5,
    },
    jobTitle: {
      fontWeight: 'bold',
    },
    company: {
      fontStyle: 'italic',
    },
    dateLocation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      marginBottom: 4,
    },
    bulletList: {
      marginTop: 5,
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: spacingMap[spacing].item,
    },
    bulletPoint: {
      width: 10,
      fontSize: fontSizeMap[fontSize].normal,
    },
    bulletText: {
      flex: 1,
    },
    skillCategory: {
      marginBottom: 8,
    },
    skillCategoryTitle: {
      fontWeight: 'bold',
      fontSize: fontSizeMap[fontSize].small,
      marginBottom: 4,
    },
    skillsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillItem: {
      backgroundColor: '#f1f5f9',
      padding: '2 5',
      borderRadius: 2,
      fontSize: fontSizeMap[fontSize].small - 1,
      marginRight: 4,
      marginBottom: 4,
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    degreeText: {
      fontWeight: 'bold',
    },
    institutionText: {
      fontStyle: 'italic',
    },
    certificationEntry: {
      marginBottom: 5,
    },
    certName: {
      fontWeight: 'bold',
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
    },
    languageList: {
      marginBottom: 10,
    },
    languageRow: {
      marginBottom: 4,
    },
    languageName: {
      fontWeight: 'bold',
      fontSize: fontSizeMap[fontSize].small,
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: '#e2e8f0',
      borderRadius: 2,
      marginTop: 2,
    },
    progressBar: {
      height: 4,
      backgroundColor: accentColor,
      borderRadius: 2,
    }
  });

  // Organize sections into left and right columns
  const leftColumnSections: ResumeSection[] = ['summary', 'experience', 'education'];
  const rightColumnSections: ResumeSection[] = ['skills', 'projects', 'certifications', 'customSections'];

  // Render header with contact info (without photo)
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <Text style={styles.name}>{content.contactInfo.name || 'Your Name'}</Text>
        
        {content.experience && content.experience.length > 0 && (
          <Text style={styles.title}>{content.experience[0].position || 'Your Title'}</Text>
        )}
        
        <View style={styles.contactRow}>
          {content.contactInfo.email && (
            <Text style={styles.contactItem}>
              {content.contactInfo.email}
            </Text>
          )}
          
          {content.contactInfo.phone && (
            <Text style={styles.contactItem}>
              {content.contactInfo.phone}
            </Text>
          )}
          
          {content.contactInfo.location && (
            <Text style={styles.contactItem}>
              {content.contactInfo.location}
            </Text>
          )}
          
          {content.contactInfo.linkedin && (
            <Text style={styles.contactItem}>
              {content.contactInfo.linkedin}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  // Render summary section
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>{content.summary}</Text>
      </View>
    );
  };

  // Render experience section
  const renderExperience = () => {
    if (!content.experience || content.experience.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {content.experience.map((exp, index) => (
          <View key={`exp-${index}`} style={styles.experienceEntry}>
            <View style={styles.entryHeader}>
              <Text>
                <Text style={styles.jobTitle}>{exp.position}</Text>
                {exp.company && (
                  <Text> at <Text style={styles.company}>{exp.company}</Text></Text>
                )}
              </Text>
            </View>
            
            <View style={styles.dateLocation}>
              <Text>{exp.startDate} - {exp.endDate || 'Present'}</Text>
              {exp.location && <Text>{exp.location}</Text>}
            </View>
            
            {exp.description && <Text>{exp.description}</Text>}
            
            {exp.achievements && exp.achievements.length > 0 && (
              <View style={styles.bulletList}>
                {exp.achievements
                  .filter(achievement => achievement.trim())
                  .map((achievement, i) => (
                    <View key={`exp-${index}-ach-${i}`} style={styles.bulletItem}>
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
  };

  // Render education section
  const renderEducation = () => {
    if (!content.education || content.education.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {content.education.map((edu, index) => (
          <View key={`edu-${index}`} style={styles.educationEntry}>
            <Text style={styles.degreeText}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </Text>
            <Text style={styles.institutionText}>{edu.institution}</Text>
            <View style={styles.dateLocation}>
              <Text>{edu.startDate} - {edu.endDate || 'Present'}</Text>
              {edu.location && <Text>{edu.location}</Text>}
            </View>
            {edu.gpa && (
              <Text style={{ fontSize: fontSizeMap[fontSize].small }}>
                GPA: {edu.gpa}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render skills section with categories
  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Group skills into categories (simplified version)
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {categories.map((category, i) => (
          <View key={`cat-${i}`} style={styles.skillCategory}>
            {categories.length > 1 && (
              <Text style={styles.skillCategoryTitle}>{category.title}</Text>
            )}
            <View style={styles.skillsList}>
              {category.skills.map((skill, j) => (
                skill.trim() && (
                  <View key={`skill-${i}-${j}`} style={styles.skillItem}>
                    <Text>{skill}</Text>
                  </View>
                )
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render certifications section
  const renderCertifications = () => {
    if (!content.certifications || content.certifications.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {content.certifications.map((cert, index) => (
          <View key={`cert-${index}`} style={styles.certificationEntry}>
            <Text style={styles.certName}>{cert.name}</Text>
            <Text style={styles.certDetails}>
              {cert.issuer && cert.issuer}
              {cert.date && cert.issuer && ' | '}
              {cert.date && cert.date}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render languages section
  const renderLanguages = () => {
    // Try to find a custom section that might be for languages
    const languageSection = content.customSections?.find(
      section => section.title.toLowerCase().includes('language')
    );
    
    if (languageSection && languageSection.items.length > 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languageList}>
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
                <View key={`lang-${i}`} style={styles.languageRow}>
                  <Text style={styles.languageName}>{item.title}</Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${proficiency * 100}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      );
    }
    
    return null;
  };

  // Render projects section
  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {content.projects.map((project, index) => (
          <View key={`proj-${index}`} style={styles.experienceEntry}>
            <Text style={styles.jobTitle}>{project.name}</Text>
            
            {(project.startDate || project.endDate) && (
              <Text style={{ fontSize: fontSizeMap[fontSize].small, color: '#64748b' }}>
                {project.startDate && project.startDate}
                {project.startDate && project.endDate && ' - '}
                {project.endDate && project.endDate}
              </Text>
            )}
            
            {project.description && <Text>{project.description}</Text>}
            
            {project.technologies && project.technologies.length > 0 && (
              <View style={styles.skillsList}>
                {project.technologies.map((tech, i) => (
                  <View key={`proj-${index}-tech-${i}`} style={styles.skillItem}>
                    <Text>{tech}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {project.achievements && project.achievements.length > 0 && (
              <View style={styles.bulletList}>
                {project.achievements
                  .filter(achievement => achievement.trim())
                  .map((achievement, i) => (
                    <View key={`proj-${index}-ach-${i}`} style={styles.bulletItem}>
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
      <View key={`custom-${index}`} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.items.map((item, i) => (
          <View key={`custom-${index}-item-${i}`} style={styles.experienceEntry}>
            {item.title && (
              <Text style={styles.jobTitle}>{item.title}</Text>
            )}
            {item.subtitle && (
              <Text style={styles.company}>{item.subtitle}</Text>
            )}
            {item.date && (
              <Text style={{ fontSize: fontSizeMap[fontSize].small, color: '#64748b' }}>
                {item.date}
              </Text>
            )}
            {item.description && <Text>{item.description}</Text>}
            {item.bullets && item.bullets.length > 0 && (
              <View style={styles.bulletList}>
                {item.bullets
                  .filter(bullet => bullet.trim())
                  .map((bullet, j) => (
                    <View key={`custom-${index}-item-${i}-bullet-${j}`} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text style={styles.bulletText}>{bullet}</Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        ))}
      </View>
    ));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with contact info */}
        {renderHeader()}
        
        {/* Two-column layout */}
        <View style={styles.mainContent}>
          {/* Left column - Summary, Experience, Education */}
          <View style={styles.leftColumn}>
            {renderSummary()}
            {renderExperience()}
            {renderEducation()}
          </View>
          
          {/* Right column - Skills, Projects, Certifications, Languages, Custom Sections */}
          <View style={styles.rightColumn}>
            {renderSkills()}
            {renderProjects()}
            {renderCertifications()}
            {renderLanguages()}
            {renderCustomSections()}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ModernPhotoResumePDF; 