import React from 'react';
import { AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface ATSAnalysis {
  score?: number;
  feedback?: string;
  keyword_matches?: string[];
  missing_keywords?: string[];
  formatting_issues?: string[];
  improvement_suggestions?: string[];
  content_hash?: string;
  analyzed_at?: string;
  from_cache?: boolean;
}

interface ATSScoreIndicatorProps {
  score?: number;
  atsAnalysis?: ATSAnalysis;
  showStatus?: boolean; // Whether to show cache/timing status
  templateId?: string; // Current template being used
  previousScore?: number; // Score before template optimization
}

const ATSScoreIndicator: React.FC<ATSScoreIndicatorProps> = ({ 
  score, 
  atsAnalysis,
  showStatus = true,
  templateId,
  previousScore
}) => {
  if (!score && !atsAnalysis?.score) {
    return (
      <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No ATS score available</p>
        </div>
      </div>
    );
  }

  const currentScore = score || atsAnalysis?.score || 0;
  
  // Check if using ATS-optimized template
  const isATSTemplate = templateId && 
    ['professional', 'standard', 'minimal', 'executive', 'technical', 'modern'].includes(templateId);
  
  // Calculate improvement if we have a previous score
  const hasImprovement = previousScore && currentScore > previousScore;
  const improvement = hasImprovement ? currentScore - previousScore : 0;
  
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Check if analysis is recent (within last 5 minutes)
  const isRecent = atsAnalysis?.analyzed_at && 
    new Date(atsAnalysis.analyzed_at).getTime() > Date.now() - 5 * 60 * 1000;

  return (
    <div className="space-y-3">
      <div className={`rounded-lg p-4 ${getScoreColor(currentScore)}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">ATS Compatibility</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{currentScore}%</span>
            {hasImprovement && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+{improvement}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(currentScore)}`}
            style={{ width: `${currentScore}%` }}
          />
        </div>
        
        {/* Template improvement indicator */}
        {isATSTemplate && (
          <div className="mb-2">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                Professional Template Active
              </span>
            </div>
            <p className="text-xs opacity-75 mt-1">
              This template provides clean formatting that enhances readability and ATS parsing
            </p>
          </div>
        )}
        
        {showStatus && atsAnalysis && (
          <div className="flex items-center gap-2 text-xs opacity-75">
            {atsAnalysis.from_cache ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                <span>Cached result</span>
              </>
            ) : isRecent ? (
              <>
                <Clock className="h-3 w-3" />
                <span>Recently analyzed</span>
              </>
            ) : atsAnalysis.analyzed_at ? (
              <>
                <Clock className="h-3 w-3" />
                <span>
                  Analyzed {new Date(atsAnalysis.analyzed_at).toLocaleDateString()}
                </span>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSScoreIndicator;
