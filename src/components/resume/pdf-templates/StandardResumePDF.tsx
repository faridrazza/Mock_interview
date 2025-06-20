import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// No need to register fonts - using built-in PDF fonts
// Helvetica is a built-in font in PDF, similar to Roboto in style

interface StandardResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const StandardResumePDF: React.FC<StandardResumePDFProps> = ({ 
  content, 
  accentColor = '#4f46e5',
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
  
  // Create styles with dynamic properties
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#374151',
      padding: 30,
      lineHeight: dynamicSpacing.lineHeight,
    },
    header: {
      marginBottom: 5,
      textAlign: 'center',
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontFamily: 'Helvetica-Bold',
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 10,
    },
    contactInfo: {
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: 3,
      marginBottom: 5,
      fontSize: fontSizeMap[fontSize].small,
      color: '#555555',
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      marginRight: 15,
      marginBottom: 3,
    },
    section: {
      marginBottom: spacingMap[spacing].section,
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontFamily: 'Helvetica-Bold',
      fontWeight: 'bold',
      color: accentColor,
      marginBottom: 8,
      paddingBottom: 2,
      borderBottom: `1 solid ${accentColor}`,
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    jobTitle: {
      fontFamily: 'Helvetica-Bold',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    company: {
      fontStyle: 'italic',
      color: '#4B5563',
    },
    dateLocation: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#6B7280',
    },
    description: {
      marginTop: 3,
      marginBottom: 4,
    },
    bulletList: {
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: spacingMap[spacing].itemSpacing,
    },
    bulletPoint: {
      width: 10,
    },
    bulletText: {
      flex: 1,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 5,
    },
    skillItem: {
      fontSize: fontSizeMap[fontSize].small,
      marginRight: 10,
      marginBottom: 5,
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].item,
    },
    degree: {
      fontFamily: 'Helvetica-Bold',
      fontWeight: 'bold',
    },
    institution: {
      fontStyle: 'italic',
      color: '#4B5563',
    }
  });

  // Helper functions for rendering sections
  const renderContactInfo = () => (
    <View style={styles.header}>
      <Text style={styles.name}>{content.contactInfo.name}</Text>
      
      <View style={styles.contactInfo}>
        <Text>
          {content.contactInfo.email}
          {content.contactInfo.phone && ` • ${content.contactInfo.phone}`}
          {content.contactInfo.location && ` • ${content.contactInfo.location}`}
        </Text>
        
        {(content.contactInfo.linkedin || content.contactInfo.website || content.contactInfo.github) && (
          <Text style={{marginTop: 2}}>
            {content.contactInfo.linkedin && content.contactInfo.linkedin}
            {content.contactInfo.website && 
              (content.contactInfo.linkedin ? ` • ${content.contactInfo.website}` : content.contactInfo.website)}
            {content.contactInfo.github && 
              ((content.contactInfo.linkedin || content.contactInfo.website) ? 
                ` • ${content.contactInfo.github}` : content.contactInfo.github)}
          </Text>
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
          <View style={styles.entryHeader}>
            <Text style={styles.jobTitle}>
              {exp.position}
            </Text>
            <Text style={styles.dateLocation}>
              {`${exp.startDate} - ${exp.endDate || 'Present'}`}
            </Text>
          </View>
          <View style={styles.entryHeader}>
            <Text style={styles.company}>{exp.company || 'Freelancing'}</Text>
            {exp.location && <Text style={styles.dateLocation}>{exp.location}</Text>}
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
          <View style={styles.entryHeader}>
            <Text style={styles.degree}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </Text>
            <Text style={styles.dateLocation}>
              {`${edu.startDate} - ${edu.endDate || 'Present'}`}
            </Text>
          </View>
          <View style={styles.entryHeader}>
            <Text style={styles.institution}>{edu.institution}</Text>
            {edu.location && <Text style={styles.dateLocation}>{edu.location}</Text>}
          </View>
        </View>
      ))}
    </View>
  );

  const renderSkills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <Text>
        {content.skills && content.skills.map((skill, index) => (
          <React.Fragment key={index}>
            {skill}
            {index < content.skills.length - 1 && <Text style={{margin: '0 5'}}>   •   </Text>}
          </React.Fragment>
        ))}
      </Text>
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

  const renderProjects = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {content.projects && content.projects.map((project, index) => (
        <View key={index} style={styles.experienceEntry}>
          <Text style={styles.jobTitle}>{project.name}</Text>
          {project.description && <Text style={styles.description}>{project.description}</Text>}
          
          {project.technologies && project.technologies.length > 0 && (
            <Text style={{fontStyle: 'italic', marginTop: 2, marginBottom: 2}}>
              <Text style={{fontWeight: 'bold'}}>Technologies: </Text>
              {project.technologies.join(', ')}
            </Text>
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderContactInfo()}
        
        {/* Render all sections in order */}
        {sectionOrder
          .filter(section => section !== 'contactInfo')
          .map(sectionId => {
            const sectionContent = renderSectionById(sectionId);
            // Only render content if it exists, avoiding empty fragments
            return sectionContent ? (
              <View key={sectionId.toString()}>{sectionContent}</View>
            ) : null;
          })}
      </Page>
    </Document>
  );
};

export default StandardResumePDF; 