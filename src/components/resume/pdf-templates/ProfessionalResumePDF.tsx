import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// No need to register fonts - using built-in PDF fonts

interface ProfessionalResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const ProfessionalResumePDF: React.FC<ProfessionalResumePDFProps> = ({ 
  content, 
  accentColor = '#14532D',
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
      title: 9,
      sectionTitle: 9,
      normal: 7,
      small: 6
    },
    medium: {
      name: 14,
      title: 10,
      sectionTitle: 10,
      normal: 8,
      small: 7
    },
    large: {
      name: 16,
      title: 12,
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
      backgroundColor: '#FFFFFF',
      fontFamily: 'Times-Roman',
      fontSize: fontSizeMap[fontSize].normal,
      color: '#333',
      padding: 35,
      lineHeight: dynamicSpacing.lineHeight
    },
    header: {
      borderBottom: '1 solid #E7E5E4',
      paddingBottom: 10,
      marginBottom: 15,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    headerLeft: {
      width: '60%',
    },
    headerRight: {
      width: '40%',
      textAlign: 'right',
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontFamily: 'Times-Bold',
      color: accentColor,
      marginBottom: 5,
      textTransform: 'uppercase'
    },
    title: {
      fontSize: fontSizeMap[fontSize].title,
      color: '#57534E',
      marginBottom: 5,
      fontFamily: 'Times-Italic'
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#57534E',
      marginBottom: 2,
      fontFamily: 'Times-Roman'
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontFamily: 'Times-Bold',
      color: accentColor,
      marginBottom: 8,
      paddingBottom: 2,
      borderBottom: `1 solid ${accentColor}`,
      textTransform: 'uppercase'
    },
    section: {
      marginBottom: Math.max(6, spacingMap[spacing].section - 4),
    },
    entry: {
      marginBottom: Math.max(2, spacingMap[spacing].entry - 2),
    },
    entryHeader: {
      marginBottom: 2,
    },
    roleAndCompany: {
      fontSize: fontSizeMap[fontSize].normal + 1,
      fontFamily: 'Times-Bold',
      marginBottom: 2,
    },
    location: {
      color: '#78716C',
      fontSize: fontSizeMap[fontSize].small,
      fontFamily: 'Times-Italic',
      marginRight: 8,
    },
    date: {
      color: '#78716C',
      fontSize: fontSizeMap[fontSize].small,
    },
    description: {
      margin: '1 0',
      color: '#44403C',
      lineHeight: dynamicSpacing.lineHeight * 0.9, // Slightly tighter for descriptions
      fontFamily: 'Times-Roman'
    },
    summary: {
      margin: '2 0 10 0',
      fontSize: fontSizeMap[fontSize].normal,
      fontFamily: 'Times-Italic',
      lineHeight: dynamicSpacing.lineHeight,
      paddingLeft: 10,
      borderLeft: `2 solid ${accentColor}`
    },
    bulletList: {
      marginTop: 2,
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: 1,
      paddingLeft: 10,
    },
    bulletPoint: {
      width: 10,
      textAlign: 'center',
      fontFamily: 'Times-Roman'
    },
    bulletText: {
      width: '95%',
      fontFamily: 'Times-Roman',
      lineHeight: dynamicSpacing.lineHeight * 0.8, // More compact bullets
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].item,
    },
    degreeField: {
      fontFamily: 'Times-Bold'
    },
    institution: {
      fontFamily: 'Times-Italic'
    },
    columns: {
      flexDirection: 'row',
      marginTop: 10,
      columnGap: 20,
    },
    leftColumn: {
      width: '65%',
    },
    rightColumn: {
      width: '35%',
    },
    skillCategory: {
      marginBottom: 3,
    },
    skillCategoryTitle: {
      fontFamily: 'Times-Bold',
      marginBottom: 3
    },
    skillsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillItem: {
      marginRight: 5,
      marginBottom: 3,
    },
    certificationEntry: {
      marginBottom: 2,
    },
    certName: {
      fontFamily: 'Times-Bold'
    },
    certDate: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#78716C',
      fontFamily: 'Times-Roman'
    },
    projectEntry: {
      marginBottom: Math.max(2, spacingMap[spacing].entry - 2),
    },
    projectName: {
      fontFamily: 'Times-Bold',
      marginBottom: 3
    },
    technologies: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 3,
    },
    technologyTag: {
      backgroundColor: '#E7E5E4',
      padding: 3,
      marginRight: 4,
      marginBottom: 3,
      fontSize: fontSizeMap[fontSize].small - 1,
      fontFamily: 'Times-Roman'
    }
  });

  // Helper functions for rendering sections
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{content.contactInfo.name}</Text>
          {content.experience && content.experience.length > 0 && (
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
        </View>
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Summary</Text>
      <Text style={{...styles.summary, margin: '2 0 10 0', backgroundColor: 'transparent'}}>{content.summary}</Text>
    </View>
  );

  // Determine which sections go into left and right columns
  const leftColumnSections: ResumeSection[] = [];
  const rightColumnSections: ResumeSection[] = [];
  
  sectionOrder.forEach((section) => {
    // Experience, projects go in the left column
    if (section === 'experience' || section === 'projects') {
      leftColumnSections.push(section);
    } else if (section !== 'contactInfo' && section !== 'summary') { 
      // Everything else except contact info and summary go in the right column
      rightColumnSections.push(section);
    }
  });

  const renderExperience = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experience</Text>
      <View style={{ marginTop: 2 }}>
        {content.experience && content.experience.map((exp, index) => (
          <View key={index} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.roleAndCompany}>
                {exp.position} | {exp.company || 'Freelancing'}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.location}>{exp.location}</Text>
                <Text style={styles.date}>{`${exp.startDate} - ${exp.endDate || 'Present'}`}</Text>
              </View>
            </View>
            
            {exp.description && (
              <Text style={{
                ...styles.description,
                lineHeight: 0.80,
              }}>
                {exp.description}
              </Text>
            )}
            
            {exp.achievements && exp.achievements.filter(a => a.trim()).length > 0 && (
              <View style={{...styles.bulletList, marginTop: 1}}>
                {exp.achievements.filter(a => a.trim()).map((achievement, idx) => (
                  <View key={idx} style={{...styles.bulletItem, marginBottom: 0.5}}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={{...styles.bulletText, lineHeight: 1.15}}>{achievement}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderEducation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      <View style={{ marginTop: 2 }}>
        {content.education && content.education.map((edu, index) => (
          <View key={index} style={styles.educationEntry}>
            <Text style={styles.degreeField}>
              {edu.degree}{edu.field ? `, ${edu.field}` : ''}
            </Text>
            <Text style={styles.institution}>{edu.institution}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.date}>{`${edu.startDate} - ${edu.endDate || 'Present'}`}</Text>
              {edu.location && <Text style={styles.location}>{edu.location}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Separate skills into categories for better presentation
    const technicalSkills = content.skills.filter(s => 
      s.toLowerCase().includes('python') || 
      s.toLowerCase().includes('java') ||
      s.toLowerCase().includes('c++') ||
      s.toLowerCase().includes('javascript') || 
      s.toLowerCase().includes('sql') ||
      s.toLowerCase().includes('react') ||
      s.toLowerCase().includes('node')
    );
    
    const otherSkills = content.skills.filter(s => 
      !s.toLowerCase().includes('python') && 
      !s.toLowerCase().includes('java') &&
      !s.toLowerCase().includes('c++') &&
      !s.toLowerCase().includes('javascript') &&
      !s.toLowerCase().includes('sql') &&
      !s.toLowerCase().includes('react') &&
      !s.toLowerCase().includes('node')
    );
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={{ marginTop: 2 }}>
          {technicalSkills.length > 0 && (
            <View style={{...styles.skillCategory, marginBottom: 3}}>
              <Text style={styles.skillCategoryTitle}>Technical Skills</Text>
              <View style={styles.bulletList}>
                {technicalSkills.map((skill, index) => (
                  <View key={index} style={{...styles.bulletItem, marginBottom: 1}}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {otherSkills.length > 0 && (
            <View style={{...styles.skillCategory, marginBottom: 3}}>
              <Text style={styles.skillCategoryTitle}>Additional Skills</Text>
              <View style={styles.bulletList}>
                {otherSkills.map((skill, index) => (
                  <View key={index} style={{...styles.bulletItem, marginBottom: 1}}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderCertifications = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      <View style={{ marginTop: 2 }}>
        {content.certifications && content.certifications.map((cert, index) => (
          <View key={index} style={styles.certificationEntry}>
            <Text style={styles.certName}>{cert.name}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.institution}>{cert.issuer}</Text>
              {cert.date && <Text style={styles.certDate}>{cert.date}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderProjects = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      <View style={{ marginTop: 2 }}>
        {content.projects && content.projects.map((project, index) => (
          <View key={index} style={styles.projectEntry}>
            <Text style={styles.projectName}>{project.name}</Text>
            {project.description && (
              <Text style={{
                ...styles.description,
                lineHeight: 0.80,
              }}>
                {project.description}
              </Text>
            )}
            
            {project.technologies && project.technologies.length > 0 && (
              <View style={{ flexDirection: 'row', marginTop: 1, marginBottom: 1 }}>
                <Text style={{ fontFamily: 'Times-Italic' }}>Technologies: </Text>
                <Text style={{ fontFamily: 'Times-Roman' }}>{project.technologies.join(', ')}</Text>
              </View>
            )}
            
            {project.achievements && project.achievements.filter(a => a.trim()).length > 0 && (
              <View style={{...styles.bulletList, marginTop: 1}}>
                {project.achievements.filter(a => a.trim()).map((achievement, idx) => (
                  <View key={idx} style={{...styles.bulletItem, marginBottom: 0.5}}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={{...styles.bulletText, lineHeight: 1.15}}>{achievement}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderCustomSections = () => (
    <>
      {content.customSections && content.customSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={{ marginTop: 2 }}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.entry}>
                {item.title && <Text style={styles.degreeField}>{item.title}</Text>}
                {item.subtitle && <Text style={styles.institution}>{item.subtitle}</Text>}
                {item.date && <Text style={styles.date}>{item.date}</Text>}
                {item.description && (
                  <Text style={{
                    ...styles.description,
                    lineHeight: 0.80,
                  }}>
                    {item.description}
                  </Text>
                )}
                
                {item.bullets && item.bullets.filter(b => b.trim()).length > 0 && (
                  <View style={{...styles.bulletList, marginTop: 1}}>
                    {item.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                      <View key={bulletIndex} style={{...styles.bulletItem, marginBottom: 0.5}}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={{...styles.bulletText, lineHeight: 1.15}}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
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
        
        {/* Render summary first if present */}
        {content.summary && renderSummary()}
        
        {/* Two-column layout for the rest of the content */}
        <View style={styles.columns}>
          <View style={styles.leftColumn}>
            {leftColumnSections.map(sectionId => (
              <React.Fragment key={sectionId}>
                {renderSectionById(sectionId)}
              </React.Fragment>
            ))}
          </View>
          
          <View style={styles.rightColumn}>
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

export default ProfessionalResumePDF; 