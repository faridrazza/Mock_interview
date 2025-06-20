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

interface ModernResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const ModernResumePDF: React.FC<ModernResumePDFProps> = ({ 
  content, 
  accentColor = '#0ea5e9',
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
    'experience',
    'education',
    'skills',
    'certifications',
    'projects',
    'customSections'
  ];

  // Use section order from content, or fall back to default
  const sectionOrder = content.sectionOrder || defaultSectionOrder;

  // Define which sections go in left panel
  const leftPanelSections = ['contactInfo', 'skills', 'certifications'];
  
  // Create styles with dynamic properties
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Roboto',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#334155',
      padding: 20,
      lineHeight: dynamicSpacing.lineHeight,
    },
    leftPanel: {
      width: '33%',
      backgroundColor: '#f8fafc',
      padding: 15,
      marginRight: 15,
    },
    rightPanel: {
      width: '67%',
      padding: 5,
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 5,
    },
    title: {
      fontSize: fontSizeMap[fontSize].normal,
      color: '#64748b',
      marginBottom: 10,
    },
    contactInfo: {
      marginBottom: 15,
    },
    contactItem: {
      marginBottom: 3,
      fontSize: fontSizeMap[fontSize].small,
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 8,
      paddingBottom: 2,
      borderBottom: `1 solid ${accentColor}`,
    },
    section: {
      marginBottom: spacingMap[spacing].section,
    },
    skillsList: {
      marginBottom: 8,
    },
    skillItem: {
      padding: 4,
      backgroundColor: '#e2e8f0',
      borderRadius: 2,
      fontSize: fontSizeMap[fontSize].small,
      marginBottom: 4,
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    jobTitle: {
      fontWeight: 'bold',
      marginBottom: 2,
    },
    company: {
      fontWeight: 'normal',
      color: '#64748b',
    },
    dateLocation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      marginBottom: 4,
    },
    bulletList: {
      marginTop: 4,
    },
    bulletItem: {
      marginBottom: spacingMap[spacing].itemSpacing,
      flexDirection: 'row',
    },
    bulletPoint: {
      width: 10,
      fontSize: fontSizeMap[fontSize].normal,
    },
    bulletText: {
      flex: 1,
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].item,
    },
    degree: {
      fontWeight: 'bold',
    },
    institution: {
      color: '#64748b',
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    projectName: {
      fontWeight: 'bold',
      marginBottom: 2,
    },
    technologies: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 2,
      marginBottom: 2,
    },
    technologyTag: {
      backgroundColor: '#e2e8f0',
      fontSize: fontSizeMap[fontSize].small - 1,
      padding: 2,
      marginRight: 4,
      marginBottom: 2,
      borderRadius: 2,
    }
  });

  // Helper functions for rendering sections
  const renderContactInfo = () => (
    <View style={styles.contactInfo}>
      <Text style={styles.name}>{content.contactInfo.name}</Text>
      <View style={{marginTop: 8}}>
        {content.contactInfo.email && (
          <Text style={styles.contactItem}>Email: {content.contactInfo.email}</Text>
        )}
        {content.contactInfo.phone && (
          <Text style={styles.contactItem}>Phone: {content.contactInfo.phone}</Text>
        )}
        {content.contactInfo.location && (
          <Text style={styles.contactItem}>Location: {content.contactInfo.location}</Text>
        )}
        {content.contactInfo.linkedin && (
          <Text style={styles.contactItem}>LinkedIn: {content.contactInfo.linkedin}</Text>
        )}
        {content.contactInfo.website && (
          <Text style={styles.contactItem}>Website: {content.contactInfo.website}</Text>
        )}
      </View>
    </View>
  );

  const renderSkills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsList}>
        {content.skills && content.skills.map((skill, index) => (
          <View key={index} style={styles.skillItem}>
            <Text>{skill}</Text>
          </View>
        ))}
      </View>
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
            <Text>{`${edu.startDate} - ${edu.endDate || 'Present'}`}</Text>
            <Text>{edu.location}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {content.certifications && content.certifications.map((cert, index) => (
        <View key={index} style={{marginBottom: 5}}>
          <Text style={{fontWeight: 'bold'}}>{cert.name}</Text>
          <Text style={{fontSize: fontSizeMap[fontSize].small}}>
            {cert.issuer}{cert.date ? ` • ${cert.date}` : ''}
          </Text>
        </View>
      ))}
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
            {exp.position} • <Text style={styles.company}>{exp.company || 'Freelancing'}</Text>
          </Text>
          <View style={styles.dateLocation}>
            <Text>{`${exp.startDate} - ${exp.endDate || 'Present'}`}</Text>
            <Text>{exp.location}</Text>
          </View>
          {exp.description && <Text style={{marginBottom: 4}}>{exp.description}</Text>}
          
          {exp.achievements && exp.achievements.filter(a => a.trim()).map((achievement, idx) => (
            <View key={idx} style={styles.bulletItem}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{achievement}</Text>
            </View>
          ))}
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
          {project.description && <Text style={{marginBottom: 4}}>{project.description}</Text>}
          
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
              {item.subtitle && <Text style={{fontSize: fontSizeMap[fontSize].small}}>{item.subtitle}</Text>}
              {item.date && <Text style={{fontSize: fontSizeMap[fontSize].small, color: '#64748b'}}>{item.date}</Text>}
              {item.description && <Text style={{marginTop: 2}}>{item.description}</Text>}
              
              {item.bullets && item.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                <View key={bulletIndex} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
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
        <View style={styles.leftPanel}>
          {renderContactInfo()}
          
          {/* Render left panel sections */}
          {sectionOrder
            .filter(section => leftPanelSections.includes(section) && section !== 'contactInfo')
            .map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderSectionById(sectionId)}
              </React.Fragment>
            ))}
        </View>
        
        <View style={styles.rightPanel}>
          {/* Render right panel sections */}
          {sectionOrder
            .filter(section => !leftPanelSections.includes(section))
            .map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderSectionById(sectionId)}
              </React.Fragment>
            ))}
        </View>
      </Page>
    </Document>
  );
};

export default ModernResumePDF; 