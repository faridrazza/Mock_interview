import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// No need to register fonts - using built-in PDF fonts instead

interface MinimalResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const MinimalResumePDF: React.FC<MinimalResumePDFProps> = ({ 
  content, 
  accentColor = '#333',
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
  
  // Determine which sections go into left and right columns
  const leftColumnSections: ResumeSection[] = [];
  const rightColumnSections: ResumeSection[] = [];
  
  sectionOrder.forEach((section) => {
    // We'll put experience and projects in the left column,
    // and everything else in the right column
    if (section === 'experience' || section === 'projects') {
      leftColumnSections.push(section);
    } else if (section !== 'contactInfo') { // Contact info is always in the header
      rightColumnSections.push(section);
    }
  });
  
  // Create styles with dynamic properties
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#FFFFFF',
      fontFamily: 'Times-Roman',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#333333',
      padding: 30,
      lineHeight: dynamicSpacing.lineHeight
    },
    header: {
      marginBottom: 15,
    },
    headerTop: {
      marginBottom: 3,
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontFamily: 'Times-Bold',
      marginBottom: 3,
      color: accentColor
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      fontSize: fontSizeMap[fontSize].small,
      color: '#555555',
      marginTop: 3,
    },
    contactItem: {
      marginRight: 10,
      marginBottom: 2,
    },
    mainContent: {
      flexDirection: 'row',
      gap: 20,
    },
    leftColumn: {
      width: '65%',
    },
    rightColumn: {
      width: '35%',
    },
    section: {
      marginBottom: Math.max(6, spacingMap[spacing].section - 4),
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontFamily: 'Times-Bold',
      textTransform: 'uppercase',
      marginBottom: 6,
      letterSpacing: 0.5,
      borderBottom: `1 solid ${accentColor}`,
      paddingBottom: 2,
      color: accentColor
    },
    experienceEntry: {
      marginBottom: Math.max(2, spacingMap[spacing].entry - 2),
    },
    companyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    companyName: {
      fontFamily: 'Times-Bold',
    },
    roleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
      fontFamily: 'Times-Italic',
    },
    dates: {
      textAlign: 'right',
      fontSize: fontSizeMap[fontSize].small,
    },
    location: {
      textAlign: 'right',
      fontSize: fontSizeMap[fontSize].small,
    },
    bulletList: {
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: 0.5,
    },
    bulletPoint: {
      width: 8,
    },
    bulletText: {
      flex: 1,
      lineHeight: dynamicSpacing.lineHeight * 0.85,
    },
    educationEntry: {
      marginBottom: Math.max(1, spacingMap[spacing].item - 1),
    },
    educationInstitution: {
      fontFamily: 'Times-Bold',
    },
    educationDegree: {
      fontFamily: 'Times-Italic',
    },
    skillsList: {
      marginBottom: 3,
    },
    skillItem: {
      marginBottom: 1,
      paddingLeft: 2,
    },
    certItem: {
      marginBottom: 3,
    },
    certName: {
      fontFamily: 'Times-Bold',
    },
    description: {
      marginTop: 1,
      marginBottom: 1,
      lineHeight: dynamicSpacing.lineHeight * 0.8,
    }
  });

  // Helper functions for rendering sections
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.name}>{content.contactInfo.name}</Text>
      </View>
      <View style={styles.contactInfo}>
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
        {content.contactInfo.website && (
          <Text style={styles.contactItem}>{content.contactInfo.website}</Text>
        )}
      </View>
    </View>
  );

  const renderExperience = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      {content.experience && content.experience.map((exp, index) => (
        <View key={index} style={styles.experienceEntry}>
          <View style={styles.companyHeader}>
            <Text style={styles.companyName}>{exp.company || 'Freelance'}</Text>
            <Text style={styles.dates}>{`${exp.startDate} - ${exp.endDate || 'Present'}`}</Text>
          </View>
          <View style={styles.roleHeader}>
            <Text>{exp.position}</Text>
            <Text style={styles.location}>{exp.location}</Text>
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

  const renderProjects = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {content.projects && content.projects.map((project, index) => (
        <View key={index} style={styles.experienceEntry}>
          <Text style={styles.companyName}>{project.name}</Text>
          {project.description && <Text style={styles.description}>{project.description}</Text>}
          
          {project.technologies && project.technologies.length > 0 && (
            <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 1, marginBottom: 1}}>
              <Text style={{fontFamily: 'Times-Italic'}}>Technologies: </Text>
              <Text>{project.technologies.join(', ')}</Text>
            </View>
          )}
          
          {project.achievements && project.achievements.filter(a => a.trim()).length > 0 && (
            <View style={styles.bulletList}>
              {project.achievements.filter(a => a.trim()).map((achievement, idx) => (
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
          <Text style={styles.educationInstitution}>{edu.institution}</Text>
          <Text style={styles.educationDegree}>
            {edu.degree}{edu.field ? `, ${edu.field}` : ''}
          </Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={styles.location}>{edu.location}</Text>
            <Text style={styles.dates}>{`${edu.startDate} - ${edu.endDate || 'Present'}`}</Text>
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
          <View key={index} style={styles.skillItem}>
            <Text>• {skill}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      {content.certifications && content.certifications.map((cert, index) => (
        <View key={index} style={styles.certItem}>
          <Text style={styles.certName}>{cert.name}</Text>
          <Text>{cert.issuer}{cert.date ? ` • ${cert.date}` : ''}</Text>
        </View>
      ))}
    </View>
  );

  const renderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={{lineHeight: 0.9}}>{content.summary}</Text>
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
              {item.subtitle && <Text style={{fontStyle: 'italic'}}>{item.subtitle}</Text>}
              {item.date && <Text style={{fontSize: fontSizeMap[fontSize].small}}>{item.date}</Text>}
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

  // Try-catch wrapper for better error handling
  try {
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
  } catch (error) {
    console.error("Error rendering MinimalResumePDF:", error);
    // Fallback to a simple document in case of error
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Unable to render resume. Please try another template.</Text>
        </Page>
      </Document>
    );
  }
};

export default MinimalResumePDF; 