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
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
});

// Function to sanitize text for PDF rendering
const sanitizeText = (text: string | undefined): string => {
  if (!text) return '';
  
  // Replace problematic Unicode characters and emojis with plain ASCII
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove symbols & pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport & map symbols
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove miscellaneous symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Remove dingbats
    .replace(/[^\x00-\x7F]/g, '');          // Remove any remaining non-ASCII characters
};

interface DataScientistResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const DataScientistResumePDF: React.FC<DataScientistResumePDFProps> = ({ 
  content, 
  accentColor = '#2563eb',
  fontSize = 'medium',
  spacing = 'normal'
}) => {
  // Calculate content volume
  const contentVolume = calculateContentVolume(content);
  
  // Get dynamic spacing based on content volume
  const dynamicSpacing = getDynamicSpacing(contentVolume, spacing);

  // Use appropriate line heights - normal for titles, compact for content
  const titleLineHeight = dynamicSpacing.lineHeight; // Original line height for titles
  const contentLineHeight = 1.05; // Keep compact line height for content

  // Font size mappings
  const fontSizeMap = {
    small: {
      name: 12,
      title: 9,
      sectionTitle: 9,
      normal: 7,
      small: 6,
    },
    medium: {
      name: 14,
      title: 10,
      sectionTitle: 10,
      normal: 8,
      small: 7,
    },
    large: {
      name: 16,
      title: 12,
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
      lineHeight: contentLineHeight,
    },
    header: {
      marginBottom: 20,
      borderBottom: `1 solid #e2e8f0`,
      paddingBottom: 15,
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      textTransform: 'uppercase',
      marginBottom: 8,
      lineHeight: titleLineHeight,
    },
    title: {
      fontSize: fontSizeMap[fontSize].title,
      color: '#64748b',
      marginTop: 5,
      marginBottom: 12,
      fontWeight: 'bold',
      lineHeight: titleLineHeight,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      marginRight: 20,
      marginBottom: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    contactIcon: {
      marginRight: 5,
      width: 50,
      fontWeight: 'bold',
      fontSize: fontSizeMap[fontSize].small,
      color: accentColor,
    },
    section: {
      marginBottom: spacingMap[spacing].section,
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      textTransform: 'uppercase',
      marginBottom: 8,
      paddingBottom: 2,
      borderBottom: `1 solid ${accentColor}`,
      lineHeight: titleLineHeight,
    },
    summaryText: {
      lineHeight: contentLineHeight,
    },
    paragraph: {
      lineHeight: contentLineHeight,
      marginBottom: 3,
      marginTop: 0,
      paddingVertical: 0,
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
      paddingBottom: spacingMap[spacing].entry,
      borderBottom: `0.5 solid #f1f5f9`,
    },
    noBorderBottom: {
      borderBottom: 'none',
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 5,
      flexWrap: 'wrap',
    },
    jobTitle: {
      fontWeight: 'bold',
      color: accentColor,
      flexShrink: 1,
      maxWidth: '70%',
      lineHeight: titleLineHeight,
    },
    company: {
      fontWeight: 'normal',
    },
    duration: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
    },
    locationText: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      fontStyle: 'italic',
      marginBottom: 4,
    },
    bulletList: {
      marginTop: 5,
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: spacingMap[spacing].item,
      lineHeight: contentLineHeight,
    },
    bulletPoint: {
      width: 10,
      fontSize: fontSizeMap[fontSize].normal,
    },
    bulletText: {
      flex: 1,
      lineHeight: contentLineHeight,
      marginVertical: 0,
    },
    skillsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 5,
    },
    skillItem: {
      backgroundColor: '#f1f5f9',
      borderRadius: 4,
      padding: '3 6',
      fontSize: fontSizeMap[fontSize].small,
      marginRight: 5,
      marginBottom: 5,
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    degreeText: {
      fontWeight: 'bold',
      lineHeight: titleLineHeight,
    },
    institutionText: {
      color: '#64748b',
    },
    certificationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    certName: {
      fontWeight: 'bold',
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    projectName: {
      fontWeight: 'bold',
      lineHeight: titleLineHeight,
    },
    technologiesContainer: {
      marginTop: 4,
    },
    technologyList: {
      fontSize: fontSizeMap[fontSize].small,
    },
    technologyLabel: {
      fontWeight: 'bold',
    },
    proudSection: {
      backgroundColor: '#f8fafc',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
    },
    proudItem: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    proudIcon: {
      width: 15,
      marginRight: 5,
    },
    proudTitle: {
      fontWeight: 'bold',
    }
  });

  // Render contact information
  const renderContactInfo = () => (
    <View style={styles.header}>
      <Text style={styles.name}>{sanitizeText(content.contactInfo.name) || 'Your Name'}</Text>
      {content.experience && content.experience.length > 0 && (
        <Text style={styles.title}>{sanitizeText(content.experience[0].position) || 'Your Title'}</Text>
      )}
      <View style={styles.contactRow}>
        {content.contactInfo.email && (
          <View style={styles.contactItem}>
            <Text>{sanitizeText(content.contactInfo.email)}</Text>
          </View>
        )}
        {content.contactInfo.phone && (
          <View style={styles.contactItem}>
            <Text>{sanitizeText(content.contactInfo.phone)}</Text>
          </View>
        )}
        {content.contactInfo.location && (
          <View style={styles.contactItem}>
            <Text>{sanitizeText(content.contactInfo.location)}</Text>
          </View>
        )}
        {content.contactInfo.linkedin && (
          <View style={styles.contactItem}>
            <Text>{sanitizeText(content.contactInfo.linkedin)}</Text>
          </View>
        )}
        {content.contactInfo.github && (
          <View style={styles.contactItem}>
            <Text>{sanitizeText(content.contactInfo.github)}</Text>
          </View>
        )}
        {content.contactInfo.website && (
          <View style={styles.contactItem}>
            <Text>{sanitizeText(content.contactInfo.website)}</Text>
          </View>
        )}
      </View>
    </View>
  );

  // Render summary section
  const renderSummary = () => {
    if (!content.summary) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={[styles.summaryText, styles.paragraph]}>{content.summary}</Text>
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
          <View 
            key={`exp-${index}`} 
            style={[
              styles.experienceEntry,
              index === content.experience!.length - 1 ? styles.noBorderBottom : null
            ]}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.jobTitle}>
                {exp.position}
                {exp.company && (
                  <Text style={styles.company}> • {exp.company}</Text>
                )}
              </Text>
              <Text style={styles.duration}>
                {exp.startDate} - {exp.endDate || 'Present'}
              </Text>
            </View>
            {exp.location && (
              <Text style={styles.locationText}>{exp.location}</Text>
            )}
            {exp.description && <Text style={styles.paragraph}>{exp.description}</Text>}
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
            <View style={styles.entryHeader}>
              <Text style={styles.degreeText}>
                {edu.degree}{edu.field ? `, ${edu.field}` : ''}
              </Text>
              <Text style={styles.duration}>
                {edu.startDate} - {edu.endDate || 'Present'}
              </Text>
            </View>
            <Text style={styles.institutionText}>{edu.institution}</Text>
            {edu.location && (
              <Text style={styles.locationText}>{edu.location}</Text>
            )}
            {edu.gpa && (
              <Text style={{ fontSize: fontSizeMap[fontSize].small, marginTop: 2 }}>
                GPA: {edu.gpa}
              </Text>
            )}
            {edu.achievements && edu.achievements.length > 0 && (
              <View style={styles.bulletList}>
                {edu.achievements
                  .filter(achievement => achievement.trim())
                  .map((achievement, i) => (
                    <View key={`edu-${index}-ach-${i}`} style={styles.bulletItem}>
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

  // Render skills section
  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tech Skills</Text>
        <View style={styles.skillsList}>
          {content.skills
            .filter(skill => skill.trim())
            .map((skill, index) => (
              <View key={`skill-${index}`} style={styles.skillItem}>
                <Text>{skill}</Text>
              </View>
            ))}
        </View>
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
          <View key={`cert-${index}`} style={styles.certificationRow}>
            <Text style={styles.certName}>{cert.name}</Text>
            <Text style={styles.certDetails}>
              {cert.issuer && cert.issuer}
              {cert.date && cert.issuer && ' • '}
              {cert.date && cert.date}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render projects section
  const renderProjects = () => {
    if (!content.projects || content.projects.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {content.projects.map((project, index) => (
          <View key={`proj-${index}`} style={styles.projectEntry}>
            <View style={styles.entryHeader}>
              <Text style={styles.projectName}>{project.name}</Text>
              {(project.startDate || project.endDate) && (
                <Text style={styles.duration}>
                  {project.startDate && project.startDate}
                  {project.startDate && project.endDate && ' - '}
                  {project.endDate && project.endDate}
                </Text>
              )}
            </View>
            {project.description && <Text style={styles.paragraph}>{project.description}</Text>}
            {project.technologies && project.technologies.length > 0 && (
              <View style={styles.technologiesContainer}>
                <Text style={styles.technologyList}>
                  <Text style={styles.technologyLabel}>Technologies: </Text>
                  {project.technologies.join(', ')}
                </Text>
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

  // Render custom sections
  const renderCustomSections = () => {
    if (!content.customSections || content.customSections.length === 0) return null;
    
    return content.customSections.map((section, index) => (
      <View key={`custom-${index}`} style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {section.items.map((item, i) => (
          <View 
            key={`custom-${index}-item-${i}`} 
            style={[
              styles.experienceEntry,
              i === section.items.length - 1 ? styles.noBorderBottom : null
            ]}
          >
            {item.title && (
              <View style={styles.entryHeader}>
                <Text style={styles.projectName}>{item.title}</Text>
                {item.date && (
                  <Text style={styles.duration}>{item.date}</Text>
                )}
              </View>
            )}
            {item.subtitle && (
              <Text style={styles.locationText}>{item.subtitle}</Text>
            )}
            {item.description && <Text style={styles.paragraph}>{item.description}</Text>}
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

  // Render "Most Proud Of" section (special custom section from the image)
  const renderProudSection = () => {
    // This is a special section based on the image
    // We'll check if there are any custom sections with this title
    const proudSection = content.customSections?.find(
      section => section.title.toLowerCase().includes('proud')
    );
    
    if (proudSection) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Proud Of</Text>
          <View style={styles.proudSection}>
            {proudSection.items.map((item, i) => (
              <View key={`proud-${i}`} style={styles.proudItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.proudTitle}>{item.title}</Text>
                  {item.description && <Text style={styles.paragraph}>{item.description}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>
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
    <Document>
      <Page size="A4" style={styles.page}>
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
      </Page>
    </Document>
  );
};

export default DataScientistResumePDF;