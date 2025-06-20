import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { calculateContentVolume, getDynamicSpacing } from '@/utils/resumeSpacingUtils';

// No need to register fonts - using built-in PDF fonts

interface ChronologicalResumePDFProps {
  content: ResumeContent;
  accentColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'spacious';
}

const ChronologicalResumePDF: React.FC<ChronologicalResumePDFProps> = ({ 
  content, 
  accentColor = '#2563eb',
  fontSize = 'medium',
  spacing = 'normal'
}) => {
  // Calculate content volume
  const contentVolume = calculateContentVolume(content);
  
  // Get dynamic spacing based on content volume
  // Apply a multiplier to make Chronological template more compact
  const chronologicalSpacingMultiplier = 0.9; // 10% more compact than other templates
  const dynamicSpacing = getDynamicSpacing(contentVolume, spacing);
  
  // Apply the multiplier to all spacing values
  const adjustedSpacing = {
    sectionSpacing: Math.max(2, Math.floor(dynamicSpacing.sectionSpacing * chronologicalSpacingMultiplier)),
    entrySpacing: Math.max(1, Math.floor(dynamicSpacing.entrySpacing * chronologicalSpacingMultiplier)),
    itemSpacing: Math.max(1, Math.floor(dynamicSpacing.itemSpacing * chronologicalSpacingMultiplier)),
    lineHeight: Math.max(1.1, dynamicSpacing.lineHeight * 0.95) // Slightly reduce line height
  };

  // Font size mappings - slightly smaller for this template
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

  // Spacing mappings - now using adjusted dynamic spacing
  const spacingMap = {
    compact: {
      section: adjustedSpacing.sectionSpacing,
      entry: adjustedSpacing.entrySpacing,
      item: adjustedSpacing.itemSpacing,
      itemSpacing: adjustedSpacing.itemSpacing,
    },
    normal: {
      section: adjustedSpacing.sectionSpacing,
      entry: adjustedSpacing.entrySpacing,
      item: adjustedSpacing.itemSpacing,
      itemSpacing: adjustedSpacing.itemSpacing,
    },
    spacious: {
      section: adjustedSpacing.sectionSpacing,
      entry: adjustedSpacing.entrySpacing,
      item: adjustedSpacing.itemSpacing,
      itemSpacing: adjustedSpacing.itemSpacing,
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
      fontFamily: 'Helvetica',
      fontSize: fontSizeMap[fontSize].normal,
      lineHeight: adjustedSpacing.lineHeight,
      color: '#333333',
      padding: 25, // Reduced from 30
    },
    header: {
      marginBottom: Math.max(5, spacingMap[spacing].section - 3), // Reduced margin
      textAlign: 'center',
    },
    name: {
      fontSize: fontSizeMap[fontSize].name,
      fontFamily: 'Helvetica-Bold',
      color: accentColor,
      marginBottom: 3, // Reduced from 5
    },
    contactInfo: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8, // Reduced from 10
      marginTop: 3, // Reduced from 5
    },
    contactItem: {
      fontSize: fontSizeMap[fontSize].small,
      marginBottom: 1, // Reduced from 2
    },
    section: {
      marginBottom: spacingMap[spacing].section,
    },
    sectionTitle: {
      fontSize: fontSizeMap[fontSize].sectionTitle,
      fontFamily: 'Helvetica-Bold',
      color: accentColor,
      marginBottom: 6, // Reduced from 8
      paddingBottom: 2,
      borderBottom: `1 solid ${accentColor}`,
      textTransform: 'uppercase',
    },
    jobTitle: {
      fontFamily: 'Helvetica-Bold',
      fontSize: fontSizeMap[fontSize].normal + 1,
    },
    company: {
      fontFamily: 'Helvetica-Bold',
      marginBottom: 1, // Reduced from 2
    },
    dateLocation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: fontSizeMap[fontSize].small,
      marginBottom: 3, // Reduced from 5
    },
    date: {
      fontStyle: 'italic',
    },
    location: {
      fontStyle: 'italic',
    },
    experienceEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    bulletList: {
      marginTop: 3, // Reduced from 5
    },
    bulletItem: {
      flexDirection: 'row',
      marginBottom: spacingMap[spacing].itemSpacing,
    },
    bulletPoint: {
      width: 8, // Reduced from 10
      fontSize: fontSizeMap[fontSize].normal,
    },
    bulletText: {
      flex: 1,
    },
    // New styles for 2-column skills layout
    skillsLayout: {
      flexDirection: 'row',
      gap: 10,
    },
    skillsColumn: {
      flex: 1,
    },
    skillCategory: {
      marginBottom: 5, // Reduced from 8
    },
    skillCategoryTitle: {
      fontFamily: 'Helvetica-Bold',
      marginBottom: 3, // Reduced from 4
    },
    skillsGrid: {
      flexDirection: 'column',
    },
    skillItem: {
      flexDirection: 'row',
      marginBottom: 2, // Reduced from 3
    },
    educationEntry: {
      marginBottom: spacingMap[spacing].entry - 1, // Reduced
    },
    degree: {
      fontFamily: 'Helvetica-Bold',
      marginBottom: 1, // Reduced from 2
    },
    institution: {
      marginBottom: 1, // Reduced from 2
    },
    certEntry: {
      marginBottom: 3, // Reduced from 4
    },
    certName: {
      fontFamily: 'Helvetica-Bold',
      marginBottom: 1,
    },
    projectEntry: {
      marginBottom: spacingMap[spacing].entry,
    },
    projectName: {
      fontFamily: 'Helvetica-Bold',
      marginBottom: 1, // Reduced from 2
    },
    technologies: {
      marginBottom: 3, // Reduced from 4
      flexDirection: 'row',
      flexWrap: 'wrap',
    }
  });

  // Helper functions for rendering sections
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.name}>{content.contactInfo.name}</Text>
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
          <Text style={styles.jobTitle}>{exp.position}</Text>
          <Text style={styles.company}>{exp.company}</Text>
          <View style={styles.dateLocation}>
            <Text style={styles.date}>
              {exp.startDate} - {exp.endDate || 'Present'}
            </Text>
            {exp.location && <Text style={styles.location}>{exp.location}</Text>}
          </View>
          
          {exp.description && <Text style={{marginBottom: 4}}>{exp.description}</Text>}
          
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

  // Modified renderSkills function to use 2-column layout
  const renderSkills = () => {
    if (!content.skills || content.skills.length === 0) return null;
    
    // Organize skills into categories
    const technicalSkills = content.skills.filter(s => 
      s.toLowerCase().includes('programming') || 
      s.toLowerCase().includes('software') || 
      s.toLowerCase().includes('development') ||
      s.toLowerCase().includes('database') ||
      s.toLowerCase().includes('cloud') ||
      s.toLowerCase().includes('engineering') ||
      s.toLowerCase().includes('java') ||
      s.toLowerCase().includes('python') ||
      s.toLowerCase().includes('javascript') ||
      s.toLowerCase().includes('react') ||
      s.toLowerCase().includes('node') ||
      s.toLowerCase().includes('aws') ||
      s.toLowerCase().includes('azure')
    );
    
    const softSkills = content.skills.filter(s => 
      s.toLowerCase().includes('communication') || 
      s.toLowerCase().includes('leadership') || 
      s.toLowerCase().includes('teamwork') ||
      s.toLowerCase().includes('management') ||
      s.toLowerCase().includes('collaboration')
    );
    
    const otherSkills = content.skills.filter(s => 
      !technicalSkills.includes(s) && !softSkills.includes(s)
    );
    
    // Split skills into left and right columns for better space utilization
    const leftColumnSkills = [
      { title: 'Technical Skills', skills: technicalSkills },
      { title: 'Professional Skills', skills: softSkills.slice(0, Math.ceil(softSkills.length/2)) }
    ].filter(category => category.skills.length > 0);
    
    const rightColumnSkills = [
      { title: 'Professional Skills', skills: softSkills.slice(Math.ceil(softSkills.length/2)) },
      { title: 'Additional Skills', skills: otherSkills }
    ].filter(category => category.skills.length > 0);
    
    const renderSkillCategory = (title, skills) => {
      if (skills.length === 0) return null;
      
      return (
        <View style={styles.skillCategory}>
          <Text style={styles.skillCategoryTitle}>{title}</Text>
          <View style={styles.skillsGrid}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    };
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsLayout}>
          <View style={styles.skillsColumn}>
            {leftColumnSkills.map((category, index) => 
              renderSkillCategory(category.title, category.skills)
            )}
          </View>
          <View style={styles.skillsColumn}>
            {rightColumnSkills.map((category, index) => 
              renderSkillCategory(category.title, category.skills)
            )}
          </View>
        </View>
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
          <View style={styles.dateLocation}>
            <Text>{edu.startDate} - {edu.endDate || 'Present'}</Text>
            {edu.location && <Text>{edu.location}</Text>}
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
          <Text style={styles.contactItem}>
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
          <Text>{project.description}</Text>
          
          {project.technologies && project.technologies.length > 0 && (
            <Text style={{marginTop: 3, marginBottom: 3}}>
              <Text style={{fontFamily: 'Helvetica-Bold'}}>Technologies: </Text>
              {project.technologies.join(', ')}
            </Text>
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

  const renderCustomSections = () => (
    <>
      {content.customSections && content.customSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={{marginBottom: spacingMap[spacing].entry}}>
              {item.title && <Text style={{fontFamily: 'Helvetica-Bold'}}>{item.title}</Text>}
              {item.subtitle && <Text>{item.subtitle}</Text>}
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        
        {/* Render all sections in order */}
        {sectionOrder
          .filter(section => section !== 'contactInfo')
          .map(sectionId => (
            <React.Fragment key={sectionId}>
              {renderSectionById(sectionId)}
            </React.Fragment>
          ))}
      </Page>
    </Document>
  );
};

export default ChronologicalResumePDF; 