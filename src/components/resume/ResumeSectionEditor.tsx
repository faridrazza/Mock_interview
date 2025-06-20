
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ResumeSection, ResumeContent, ExperienceEntry, EducationEntry, CertificationEntry, ProjectEntry } from '@/types/resume';

interface ResumeSectionEditorProps {
  sectionType: ResumeSection;
  resumeData: ResumeContent;
  onChange: (sectionType: ResumeSection, newData: any) => void;
}

const ResumeSectionEditor: React.FC<ResumeSectionEditorProps> = ({
  sectionType,
  resumeData,
  onChange,
}) => {
  const handleChange = (value: any) => {
    onChange(sectionType, value);
  };

  const renderContactInfoSection = () => {
    const { contactInfo } = resumeData;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={contactInfo.name || ''} 
              onChange={(e) => handleChange({
                ...contactInfo,
                name: e.target.value
              })}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              value={contactInfo.email || ''}
              onChange={(e) => handleChange({
                ...contactInfo,
                email: e.target.value
              })}
              placeholder="john.doe@example.com"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              value={contactInfo.phone || ''}
              onChange={(e) => handleChange({
                ...contactInfo,
                phone: e.target.value
              })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location"
              value={contactInfo.location || ''}
              onChange={(e) => handleChange({
                ...contactInfo,
                location: e.target.value
              })}
              placeholder="City, State"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
            <Input 
              id="linkedin"
              value={contactInfo.linkedin || ''}
              onChange={(e) => handleChange({
                ...contactInfo,
                linkedin: e.target.value
              })}
              placeholder="linkedin.com/in/johndoe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Personal Website (Optional)</Label>
            <Input 
              id="website"
              value={contactInfo.website || ''}
              onChange={(e) => handleChange({
                ...contactInfo,
                website: e.target.value
              })}
              placeholder="johndoe.com"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub (Optional)</Label>
          <Input 
            id="github"
            value={contactInfo.github || ''}
            onChange={(e) => handleChange({
              ...contactInfo,
              github: e.target.value
            })}
            placeholder="github.com/johndoe"
          />
        </div>
      </div>
    );
  };

  const renderSummarySection = () => {
    const summary = resumeData.summary || '';
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea 
            id="summary"
            value={summary}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write a brief summary of your professional background, skills, and career goals..."
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            A strong summary highlights your key qualifications and what makes you unique. Keep it concise (3-5 sentences).
          </p>
        </div>
      </div>
    );
  };

  const renderExperienceSection = () => {
    const experiences = resumeData.experience || [];
    
    const addExperience = () => {
      const newExperience: ExperienceEntry = {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        location: '',
        description: '',
        achievements: [''],
      };
      handleChange([...experiences, newExperience]);
    };
    
    const updateExperience = (index: number, field: keyof ExperienceEntry, value: any) => {
      const updatedExperiences = [...experiences];
      updatedExperiences[index] = {
        ...updatedExperiences[index],
        [field]: value
      };
      handleChange(updatedExperiences);
    };
    
    const removeExperience = (index: number) => {
      const updatedExperiences = [...experiences];
      updatedExperiences.splice(index, 1);
      handleChange(updatedExperiences);
    };
    
    const addAchievement = (expIndex: number) => {
      const updatedExperiences = [...experiences];
      updatedExperiences[expIndex].achievements.push('');
      handleChange(updatedExperiences);
    };
    
    const updateAchievement = (expIndex: number, achievementIndex: number, value: string) => {
      const updatedExperiences = [...experiences];
      updatedExperiences[expIndex].achievements[achievementIndex] = value;
      handleChange(updatedExperiences);
    };
    
    const removeAchievement = (expIndex: number, achievementIndex: number) => {
      const updatedExperiences = [...experiences];
      updatedExperiences[expIndex].achievements.splice(achievementIndex, 1);
      handleChange(updatedExperiences);
    };
    
    const moveExperienceUp = (index: number) => {
      if (index === 0) return;
      const updatedExperiences = [...experiences];
      const temp = updatedExperiences[index - 1];
      updatedExperiences[index - 1] = updatedExperiences[index];
      updatedExperiences[index] = temp;
      handleChange(updatedExperiences);
    };
    
    const moveExperienceDown = (index: number) => {
      if (index === experiences.length - 1) return;
      const updatedExperiences = [...experiences];
      const temp = updatedExperiences[index + 1];
      updatedExperiences[index + 1] = updatedExperiences[index];
      updatedExperiences[index] = temp;
      handleChange(updatedExperiences);
    };
    
    return (
      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Experience #{index + 1}</h4>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveExperienceUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveExperienceDown(index)}
                    disabled={index === experiences.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`company-${index}`}>Company Name</Label>
                  <Input 
                    id={`company-${index}`}
                    value={exp.company} 
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`position-${index}`}>Position</Label>
                  <Input 
                    id={`position-${index}`}
                    value={exp.position} 
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    placeholder="Job Title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                  <Input 
                    id={`startDate-${index}`}
                    value={exp.startDate} 
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${index}`}>End Date</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id={`endDate-${index}`}
                      value={exp.endDate} 
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      placeholder="MM/YYYY or Present"
                      disabled={!!exp.current}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`location-${index}`}>Location</Label>
                  <Input 
                    id={`location-${index}`}
                    value={exp.location || ''} 
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea 
                  id={`description-${index}`}
                  value={exp.description} 
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="Briefly describe your role and responsibilities"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Key Achievements</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addAchievement(index)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Achievement
                  </Button>
                </div>
                {exp.achievements.map((achievement, achievementIndex) => (
                  <div key={achievementIndex} className="flex items-center space-x-2">
                    <Input 
                      value={achievement}
                      onChange={(e) => updateAchievement(index, achievementIndex, e.target.value)}
                      placeholder="Describe a key achievement or responsibility"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeAchievement(index, achievementIndex)}
                      disabled={exp.achievements.length <= 1}
                      className="h-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-center">
          <Button 
            type="button" 
            onClick={addExperience}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Work Experience
          </Button>
        </div>
      </div>
    );
  };

  const renderEducationSection = () => {
    const education = resumeData.education || [];
    
    const addEducation = () => {
      const newEducation: EducationEntry = {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        location: '',
      };
      handleChange([...education, newEducation]);
    };
    
    const updateEducation = (index: number, field: keyof EducationEntry, value: any) => {
      const updatedEducation = [...education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      handleChange(updatedEducation);
    };
    
    const removeEducation = (index: number) => {
      const updatedEducation = [...education];
      updatedEducation.splice(index, 1);
      handleChange(updatedEducation);
    };
    
    const moveEducationUp = (index: number) => {
      if (index === 0) return;
      const updatedEducation = [...education];
      const temp = updatedEducation[index - 1];
      updatedEducation[index - 1] = updatedEducation[index];
      updatedEducation[index] = temp;
      handleChange(updatedEducation);
    };
    
    const moveEducationDown = (index: number) => {
      if (index === education.length - 1) return;
      const updatedEducation = [...education];
      const temp = updatedEducation[index + 1];
      updatedEducation[index + 1] = updatedEducation[index];
      updatedEducation[index] = temp;
      handleChange(updatedEducation);
    };
    
    return (
      <div className="space-y-6">
        {education.map((edu, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Education #{index + 1}</h4>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveEducationUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => moveEducationDown(index)}
                    disabled={index === education.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`institution-${index}`}>Institution</Label>
                  <Input 
                    id={`institution-${index}`}
                    value={edu.institution} 
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    placeholder="University or School Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`location-edu-${index}`}>Location</Label>
                  <Input 
                    id={`location-edu-${index}`}
                    value={edu.location || ''} 
                    onChange={(e) => updateEducation(index, 'location', e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`degree-${index}`}>Degree</Label>
                  <Input 
                    id={`degree-${index}`}
                    value={edu.degree} 
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Bachelor's, Master's, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`field-${index}`}>Field of Study</Label>
                  <Input 
                    id={`field-${index}`}
                    value={edu.field || ''} 
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    placeholder="Computer Science, Business, etc."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-startDate-${index}`}>Start Date</Label>
                  <Input 
                    id={`edu-startDate-${index}`}
                    value={edu.startDate} 
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edu-endDate-${index}`}>End Date</Label>
                  <Input 
                    id={`edu-endDate-${index}`}
                    value={edu.endDate || ''} 
                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    placeholder="MM/YYYY or Present"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-center">
          <Button 
            type="button" 
            onClick={addEducation}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Education
          </Button>
        </div>
      </div>
    );
  };

  const renderSkillsSection = () => {
    const skills = resumeData.skills || [];
    
    const addSkill = () => {
      handleChange([...skills, '']);
    };
    
    const updateSkill = (index: number, value: string) => {
      const updatedSkills = [...skills];
      updatedSkills[index] = value;
      handleChange(updatedSkills);
    };
    
    const removeSkill = (index: number) => {
      const updatedSkills = [...skills];
      updatedSkills.splice(index, 1);
      handleChange(updatedSkills);
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Skills</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addSkill}
              className="h-8"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Skill
            </Button>
          </div>
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input 
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                placeholder="Enter a skill (e.g., JavaScript, Project Management)"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => removeSkill(index)}
                className="h-10 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertificationsSection = () => {
    const certifications = resumeData.certifications || [];
    
    const addCertification = () => {
      const newCertification: CertificationEntry = {
        name: '',
        issuer: '',
        date: '',
      };
      handleChange([...certifications, newCertification]);
    };
    
    const updateCertification = (index: number, field: keyof CertificationEntry, value: any) => {
      const updatedCertifications = [...certifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        [field]: value
      };
      handleChange(updatedCertifications);
    };
    
    const removeCertification = (index: number) => {
      const updatedCertifications = [...certifications];
      updatedCertifications.splice(index, 1);
      handleChange(updatedCertifications);
    };
    
    return (
      <div className="space-y-6">
        {certifications.map((cert, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Certification #{index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeCertification(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`cert-name-${index}`}>Certification Name</Label>
                <Input 
                  id={`cert-name-${index}`}
                  value={cert.name} 
                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                  placeholder="AWS Certified Solutions Architect"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cert-issuer-${index}`}>Issuing Organization</Label>
                  <Input 
                    id={`cert-issuer-${index}`}
                    value={cert.issuer || ''} 
                    onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    placeholder="Amazon Web Services"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cert-date-${index}`}>Date Earned</Label>
                  <Input 
                    id={`cert-date-${index}`}
                    value={cert.date || ''} 
                    onChange={(e) => updateCertification(index, 'date', e.target.value)}
                    placeholder="MM/YYYY"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-center">
          <Button 
            type="button" 
            onClick={addCertification}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Certification
          </Button>
        </div>
      </div>
    );
  };

  const renderProjectsSection = () => {
    const projects = resumeData.projects || [];
    
    const addProject = () => {
      const newProject: ProjectEntry = {
        name: '',
        description: '',
        technologies: [],
        achievements: [],
      };
      handleChange([...projects, newProject]);
    };
    
    const updateProject = (index: number, field: keyof ProjectEntry, value: any) => {
      const updatedProjects = [...projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value
      };
      handleChange(updatedProjects);
    };
    
    const removeProject = (index: number) => {
      const updatedProjects = [...projects];
      updatedProjects.splice(index, 1);
      handleChange(updatedProjects);
    };
    
    const addProjectTechnology = (projectIndex: number) => {
      const updatedProjects = [...projects];
      if (!updatedProjects[projectIndex].technologies) {
        updatedProjects[projectIndex].technologies = [];
      }
      updatedProjects[projectIndex].technologies!.push('');
      handleChange(updatedProjects);
    };
    
    const updateProjectTechnology = (projectIndex: number, techIndex: number, value: string) => {
      const updatedProjects = [...projects];
      updatedProjects[projectIndex].technologies![techIndex] = value;
      handleChange(updatedProjects);
    };
    
    const removeProjectTechnology = (projectIndex: number, techIndex: number) => {
      const updatedProjects = [...projects];
      updatedProjects[projectIndex].technologies!.splice(techIndex, 1);
      handleChange(updatedProjects);
    };
    
    return (
      <div className="space-y-6">
        {projects.map((project, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Project #{index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeProject(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`project-name-${index}`}>Project Name</Label>
                  <Input 
                    id={`project-name-${index}`}
                    value={project.name} 
                    onChange={(e) => updateProject(index, 'name', e.target.value)}
                    placeholder="E-commerce Website"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`project-url-${index}`}>Project URL (Optional)</Label>
                  <Input 
                    id={`project-url-${index}`}
                    value={project.url || ''} 
                    onChange={(e) => updateProject(index, 'url', e.target.value)}
                    placeholder="https://project-example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`project-description-${index}`}>Project Description</Label>
                <Textarea 
                  id={`project-description-${index}`}
                  value={project.description} 
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Describe what the project does and your role in it"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Technologies Used</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => addProjectTechnology(index)}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Technology
                  </Button>
                </div>
                {project.technologies && project.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className="flex items-center space-x-2">
                    <Input 
                      value={tech}
                      onChange={(e) => updateProjectTechnology(index, techIndex, e.target.value)}
                      placeholder="React, Node.js, etc."
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeProjectTechnology(index, techIndex)}
                      className="h-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        <div className="flex justify-center">
          <Button 
            type="button" 
            onClick={addProject}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Project
          </Button>
        </div>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (sectionType) {
      case 'contactInfo':
        return renderContactInfoSection();
      case 'summary':
        return renderSummarySection();
      case 'experience':
        return renderExperienceSection();
      case 'education':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      case 'certifications':
        return renderCertificationsSection();
      case 'projects':
        return renderProjectsSection();
      default:
        return <div>Unknown section type</div>;
    }
  };

  return renderSectionContent();
};

export default ResumeSectionEditor;
