import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { CompanyInterviewQuestion, InterviewSuggestion } from '@/types/advancedInterview';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfExportProps {
  jobRole: string;
  companyName: string;
  questions: CompanyInterviewQuestion[];
  suggestions: InterviewSuggestion[];
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const PdfExport: React.FC<PdfExportProps> = ({ 
  jobRole, 
  companyName, 
  questions, 
  suggestions 
}) => {
  const handleExport = () => {
    try {
      const doc = new jsPDF();
      
      // Set title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(`${companyName} ${jobRole} Interview Preparation`, 14, 22);
      
      // Add date
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add interview questions table
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Interview Questions', 14, 40);
      
      // Format questions for table
      const questionsData = questions.map(q => [
        q.questionText,
        q.category,
        q.year,
        q.references.join(', ')
      ]);
      
      // Use autoTable directly
      autoTable(doc, {
        startY: 45,
        head: [['Question', 'Category', 'Year', 'References']],
        body: questionsData,
        headStyles: { fillColor: [0, 128, 128] },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 30 },
          2: { cellWidth: 20 },
          3: { cellWidth: 50 },
        }
      });
      
      // Get the Y position after the table
      const finalY = (doc as any).lastAutoTable?.finalY || 45;
      let yPos = finalY + 20;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Preparation Suggestions', 14, yPos);
      yPos += 10;
      
      // Make sure suggestions is an array before iterating
      if (Array.isArray(suggestions)) {
        suggestions.forEach((suggestion, index) => {
          // Check if we need a new page
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${suggestion.title}`, 14, yPos);
          yPos += 7;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          // Split long text into multiple lines
          const splitText = doc.splitTextToSize(suggestion.description, 180);
          doc.text(splitText, 14, yPos);
          yPos += splitText.length * 6 + 7;
        });
      }
      
      // Save PDF
      doc.save(`${companyName.replace(/\s+/g, '-')}_${jobRole.replace(/\s+/g, '-')}_Interview_Prep.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };
  
  return (
    <Button 
      onClick={handleExport} 
      variant="outline" 
      className="gap-2 border-brand-200 text-brand-700 hover:bg-brand-50 hover:text-brand-800 dark:border-brand-800 dark:text-brand-400 dark:hover:bg-brand-900/30"
    >
      <Download size={16} />
      Export as PDF
    </Button>
  );
};

export default PdfExport;
