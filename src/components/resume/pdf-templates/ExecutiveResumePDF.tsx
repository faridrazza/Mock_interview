import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// Register fonts - using reliable CDN sources
Font.register({
  family: 'Georgia',
  fonts: [
    { 
      src: 'https://db.onlinewebfonts.com/t/3cff9206b4c4e9b36708a3e53a1b611c.woff',
      fontWeight: 400,
      fontStyle: 'normal'
    },
    { 
      src: 'https://db.onlinewebfonts.com/t/e6a74d8554cec29947124c7e29e05b4f.woff',
      fontWeight: 400,
      fontStyle: 'italic'
    },
    { 
      src: 'https://db.onlinewebfonts.com/t/5bfd262d27ff18e30acc8b315f50f1ed.woff',
      fontWeight: 700,
      fontStyle: 'normal'
    }
  ]
});

// Fallback font for better support
Font.register({
  family: 'Times New Roman',
  fonts: [
    { src: 'https://db.onlinewebfonts.com/t/32441a722b2f96b4f2912b81dea54393.woff' }
  ]
});

interface ExecutiveResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const ExecutiveResumePDF: React.FC<ExecutiveResumePDFProps> = ({ 
  content, 
  accentColor = '#1e293b',
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
      fontFamily: 'Times-Roman',
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: dynamicSpacing.lineHeight,
      color: '#333333',
      padding: 30,
      letterSpacing: 0.2
    },
    header: {
      marginBottom: spacingMap[spacing].section,
      borderBottom: `1 solid ${accentColor}`,
      paddingBottom: 10
    },
    nameAndTitle: {
      marginBottom: 5
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontFamily: 'Times-Bold',
      fontWeight: 700,
      color: accentColor,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    title: {
      fontSize: fontSizeMap[fontSize].sectionTitle - 1,
      color: '#64748b',
      fontStyle: 'italic',
      marginBottom: 5
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 5,
      gap: 8
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      marginRight: 15
    },
    contentLayout: {
      flexDirection: 'row',
      gap: 20
    },
    mainColumn: {
      width: '70%'
    },
    sideColumn: {
      width: '30%'
    },
    section: {
      marginBottom: spacingMap[spacing].section,
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontFamily: 'Times-Roman',
      fontWeight: 700,
      color: accentColor,
      marginBottom: 8,
      paddingBottom: 2,
      borderBottom: `1 solid ${accentColor}`,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    summary: {
      marginBottom: spacingMap[spacing].section,
      fontSize: fontSizeMap[fontSize].normal + 0.5,
      fontStyle: 'italic',
      lineHeight: dynamicSpacing.lineHeight,
      color: '#4b5563'
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    entryHeader: {
      marginBottom: 5
    },
    roleCompanyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
      flexWrap: 'wrap'
    },
    position: {
      fontFamily: 'Times-Roman',
      fontWeight: 700,
      fontSize: fontSizeMap[fontSize].normal + 1,
    },
    company: {
      fontFamily: 'Times-Roman',
      fontWeight: 700,
      color: accentColor
    },
    dateLocation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b',
      marginBottom: 4
    },
    description: {
      marginBottom: 4
    },
    bulletList: {
      marginTop: 4
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: spacingMap[spacing].itemSpacing,
      alignItems: 'flex-start',
    },
    bulletPoint: {
      width: 15,
      marginRight: 5,
      textAlign: 'center',
      fontFamily: 'Times-Roman',
      fontSize: fontSizeMap[fontSize].normal,
    },
    bulletText: {
      flex: 1,
      paddingTop: 1,
    },
    skillCategory: {
      marginBottom: 8
    },
    skillCategoryTitle: {
      fontFamily: 'Times-Roman',
      fontWeight: 700,
      marginBottom: 4,
      color: accentColor
    },
    skillItem: {
      flexDirection: 'row',
      marginBottom: 2
    },
    educationEntry: {
      marginBottom: 8
    },
    degree: {
      fontFamily: 'Times-Roman',
      fontWeight: 700,
      marginBottom: 2
    },
    institution: {
      marginBottom: 2
    },
    certEntry: {
      marginBottom: 5
    },
    certName: {
      fontFamily: 'Times-Roman',
      fontWeight: 700,
      marginBottom: 1
    },
    certDetails: {
      fontSize: fontSizeMap[fontSize].small,
      color: '#64748b'
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry
    },
    projectName: {
      fontFamily: 'Times-Roman',
      fontWeight: 700,
      marginBottom: 2
    }
  });

  // Helper functions for rendering sections
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.nameAndTitle}>
        <Text style={styles.name}>{content.contactInfo.name}</Text>
        {content.experience && content.experience.length > 0 && content.experience[0].position && (
          <Text style={styles.title}>{content.experience[0].position}</Text>
        )}
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
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summary}>
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
            <View style={styles.roleCompanyRow}>
              <Text style={styles.position}>{exp.position}</Text>
              <Text style={styles.company}>{exp.company}</Text>
            </View>
            <View style={styles.dateLocation}>
              <Text>
                {exp.startDate} - {exp.endDate || 'Present'}
              </Text>
              {exp.location && <Text>{exp.location}</Text>}
            </View>
          </View>
          
          {exp.description && (
            <Text style={styles.description}>{exp.description}</Text>
          )}
          
          {exp.achievements && exp.achievements.filter(a => a.trim()).length > 0 && (
            <View style={styles.bulletList}>
              {exp.achievements.filter(a => a.trim()).map((achievement, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>{"•"}</Text>
                  <Text style={styles.bulletText}>{achievement}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Organize skills into categories for better presentation
    const leadershipSkills = content.skills.filter(s => 
      s.toLowerCase().includes('leadership') || 
      s.toLowerCase().includes('management') || 
      s.toLowerCase().includes('strategic') ||
      s.toLowerCase().includes('executive') ||
      s.toLowerCase().includes('vision') ||
      s.toLowerCase().includes('board') ||
      s.toLowerCase().includes('c-suite')
    );
    
    const businessSkills = content.skills.filter(s => 
      s.toLowerCase().includes('business') || 
      s.toLowerCase().includes('finance') || 
      s.toLowerCase().includes('operations') ||
      s.toLowerCase().includes('revenue') ||
      s.toLowerCase().includes('growth') ||
      s.toLowerCase().includes('profit') ||
      s.toLowerCase().includes('sales') ||
      s.toLowerCase().includes('marketing')
    );
    
    const technicalSkills = content.skills.filter(s => 
      !leadershipSkills.includes(s) && !businessSkills.includes(s)
    );
    
    const renderSkillCategory = (title: string, skills: string[]) => {
      if (skills.length === 0) return null;
      
      return (
        <View style={styles.skillCategory}>
          <Text style={styles.skillCategoryTitle}>{title}</Text>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Text style={styles.bulletPoint}>{"•"}</Text>
              <Text>{skill}</Text>
            </View>
          ))}
        </View>
      );
    };
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {renderSkillCategory('Leadership & Strategy', leadershipSkills)}
        {renderSkillCategory('Business Acumen', businessSkills)}
        {renderSkillCategory('Technical Expertise', technicalSkills)}
      </View>
    );
  };

  const renderEducation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      {content.education && content.education.map((edu, index) => (
        <View key={index} style={styles.educationEntry}>
          <Text style={styles.degree}>
            {edu.degree}{edu.field ? `, ${edu.field}` : ''}
          </Text>
          <Text style={styles.institution}>{edu.institution}</Text>
          <Text style={styles.certDetails}>
            {edu.location && <Text>{edu.location} | </Text>}
            {edu.startDate} - {edu.endDate || 'Present'}
          </Text>
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

  const renderProjects = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Projects</Text>
      {content.projects && content.projects.map((project, index) => (
        <View key={index} style={styles.projectEntry}>
          <Text style={styles.projectName}>{project.name}</Text>
          {(project.startDate || project.endDate) && (
            <Text style={styles.certDetails}>
              {project.startDate} - {project.endDate || 'Present'}
            </Text>
          )}
          
          <Text style={styles.description}>{project.description}</Text>
          
          {project.technologies && project.technologies.length > 0 && (
            <Text style={{marginBottom: 4, fontStyle: 'italic'}}>
              Technologies: {project.technologies.join(', ')}
            </Text>
          )}
          
          {project.achievements && project.achievements.filter(a => a.trim()).length > 0 && (
            <View style={styles.bulletList}>
              {project.achievements.filter(a => a.trim()).map((achievement, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletPoint}>{"•"}</Text>
                  <Text style={styles.bulletText}>{achievement}</Text>
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
              {item.title && <Text style={{fontFamily: 'Times-Roman', fontWeight: 700}}>{item.title}</Text>}
              {item.subtitle && <Text>{item.subtitle}</Text>}
              {item.date && <Text style={{fontSize: fontSizeMap[fontSize].small, color: '#64748b'}}>{item.date}</Text>}
              {item.description && <Text style={{marginTop: 2}}>{item.description}</Text>}
              
              {item.bullets && item.bullets.filter(b => b.trim()).length > 0 && (
                <View style={styles.bulletList}>
                  {item.bullets.filter(b => b.trim()).map((bullet, bulletIndex) => (
                    <View key={bulletIndex} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>{"•"}</Text>
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

  // Determine which sections go in the main column vs side column
  const mainColumnSections: ResumeSection[] = ['summary', 'experience', 'projects', 'customSections'];
  const sideColumnSections: ResumeSection[] = ['skills', 'education', 'certifications'];

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

export default ExecutiveResumePDF; 