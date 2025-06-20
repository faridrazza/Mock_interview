import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// Register fonts
Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJA.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7V1s.ttf', fontWeight: 700 }
  ]
});

interface CreativeResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const CreativeResumePDF: React.FC<CreativeResumePDFProps> = ({ 
  content, 
  accentColor = '#6366f1',
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
      fontFamily: 'Poppins',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#374151',
      backgroundColor: '#ffffff',
      lineHeight: dynamicSpacing.lineHeight,
    },
    header: {
      backgroundColor: accentColor,
      color: '#ffffff',
      padding: 30,
      textAlign: 'center',
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      marginBottom: 15,
      textTransform: 'uppercase',
      letterSpacing: 1
    },
    title: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      marginBottom: 6,
      opacity: 0.9
    },
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
      marginTop: 6,
      flexWrap: 'wrap'
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      marginRight: 10
    },
    mainContent: {
      flexDirection: 'row',
      padding: 20
    },
    leftColumn: {
      width: '33%',
      paddingRight: 15
    },
    rightColumn: {
      width: '67%',
      paddingLeft: 15
    },
    section: {
      marginBottom: spacingMap[spacing].section
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 10,
      paddingBottom: 2,
      borderBottom: `2 solid ${accentColor}`
    },
    skillsList: {
      flexDirection: 'column',
      gap: 5,
      marginBottom: 10
    },
    skillItem: {
      fontSize: fontSizeMap[fontSize].normal,
      color: '#374151',
      marginBottom: 5
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
      paddingLeft: 15,
      borderLeft: `2 solid ${accentColor}40`
    },
    jobTitle: {
      fontWeight: 'bold',
      marginBottom: 3
    },
    company: {
      color: accentColor,
      fontWeight: 'normal',
    },
    dateLocation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#6B7280',
      marginBottom: 5,
      flexWrap: 'wrap'
    },
    description: {
      marginBottom: 5
    },
    bulletList: {
      marginTop: 5
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].item,
      flexDirection: 'row'
    },
    bulletPoint: {
      width: 10,
    },
    bulletText: {
      flex: 1
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry,
      paddingLeft: 15,
      borderLeft: `2 solid ${accentColor}40`
    },
    degree: {
      fontWeight: 'bold'
    },
    institution: {
      color: accentColor
    },
    certificationEntry: {
      marginBottom: 5
    },
    certName: {
      fontWeight: 'bold'
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    projectName: {
      fontWeight: 'bold',
      color: accentColor
    },
    technologies: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 5
    },
    technologyTag: {
      padding: '2 5',
      fontSize: fontSizeMap[fontSize].small - 1,
      marginBottom: 2
    }
  });

  // Helper functions for rendering sections
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.name}>{content.contactInfo.name}</Text>
      
      {content.experience && content.experience.length > 0 && content.experience[0].position && (
        <Text style={styles.title}>{content.experience[0].position}</Text>
      )}
      
      <View style={styles.contactRow}>
        {content.contactInfo.email && (
          <Text style={styles.contactItem}>{content.contactInfo.email}</Text>
        )}
        {content.contactInfo.phone && (
          <Text style={styles.contactItem}>{content.contactInfo.phone}</Text>
        )}
        {content.contactInfo.location && (
          <Text style={styles.contactItem}>{content.contactInfo.location}</Text>
        )}
      </View>
      
      <View style={styles.contactRow}>
        {content.contactInfo.linkedin && (
          <Text style={styles.contactItem}>{content.contactInfo.linkedin}</Text>
        )}
        {content.contactInfo.website && (
          <Text style={styles.contactItem}>{content.contactInfo.website}</Text>
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

  const renderExperience = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {content.experience && content.experience.map((exp, index) => (
        <View key={index} style={styles.experienceEntry}>
          <Text style={styles.jobTitle}>
            {exp.position}{' '}
            <Text style={styles.company}>@ {exp.company || 'Freelance'}</Text>
          </Text>
          
          <View style={styles.dateLocation}>
            <Text>{exp.location}</Text>
            <Text>{`${exp.startDate} - ${exp.endDate || 'Present'}`}</Text>
          </View>
          
          {exp.description && <Text style={styles.description}>{exp.description}</Text>}
          
          {exp.achievements && exp.achievements.filter(a => a.trim()).length > 0 && (
            <View style={styles.bulletList}>
              {exp.achievements.filter(a => a.trim()).map((achievement, idx) => (
                <View key={idx} style={styles.bulletItem}>
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
            <Text>{edu.location}</Text>
            <Text>{`${edu.startDate} - ${edu.endDate || 'Present'}`}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSkills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsList}>
        {content.skills && content.skills.map((skill, index) => (
          <Text key={index} style={styles.skillItem}>{skill}</Text>
        ))}
      </View>
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {content.certifications && content.certifications.map((cert, index) => (
        <View key={index} style={styles.certificationEntry}>
          <Text style={styles.certName}>{cert.name}</Text>
          <Text>{cert.issuer}{cert.date ? ` • ${cert.date}` : ''}</Text>
        </View>
      ))}
    </View>
  );

  const renderProjects = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {content.projects && content.projects.map((project, index) => (
        <View key={index} style={styles.projectEntry}>
          <Text style={styles.projectName}>{project.name}</Text>
          {project.description && <Text style={styles.description}>{project.description}</Text>}
          
          {project.technologies && project.technologies.length > 0 && (
            <View style={styles.technologies}>
              {project.technologies.map((tech, idx) => (
                <View key={idx} style={styles.technologyTag}>
                  <Text>{tech}</Text>
                </View>
              ))}
            </View>
          )}
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
              {item.subtitle && <Text style={{color: accentColor}}>{item.subtitle}</Text>}
              {item.date && <Text style={{fontSize: fontSizeMap[fontSize].small, color: '#6B7280'}}>{item.date}</Text>}
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

  // Define left column sections
  const leftColumnSections: ResumeSection[] = ['skills', 'education', 'certifications'];
  
  // Define right column sections
  const rightColumnSections = sectionOrder.filter(
    section => !leftColumnSections.includes(section) && section !== 'contactInfo'
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        
        <View style={styles.mainContent}>
          <View style={styles.leftColumn}>
            {/* Render left column sections */}
            {leftColumnSections.map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderSectionById(sectionId)}
              </React.Fragment>
            ))}
          </View>
          
          <View style={styles.rightColumn}>
            {/* Render right column sections */}
            {rightColumnSections.map(sectionId => (
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

export default CreativeResumePDF; 