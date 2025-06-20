import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Avatar3D } from '@/components/Avatar3D';
import ChatMessage from '@/components/ChatMessage';
import AudioRecorder from '@/components/AudioRecorder';
import InterviewFeedback from '@/components/interview/InterviewFeedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ArrowLeft, XCircle, Mic, MessageSquare } from 'lucide-react';
import { AdvancedInterviewConfiguration, InterviewFeedback as InterviewFeedbackType } from '@/types/advancedInterview';
import { InterviewMessage } from '@/types/interview';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { invalidateUsageCache } from '@/utils/subscriptionUtils';
import { useBackendConfig, lambdaApi } from '@/config/aws-lambda';

const AdvancedInterviewSession: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setSpeaking] = useState(false);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [interviewConfig, setInterviewConfig] = useState<AdvancedInterviewConfiguration | null>(null);
  const [processingAnswer, setProcessingAnswer] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedbackType | null>(null);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    console.log("Loading interview configuration from session storage");
    const configStr = sessionStorage.getItem('advancedInterviewConfig');
    if (!configStr) {
      console.error("No interview configuration found in session storage");
      toast({
        title: 'Session not found',
        description: 'Please configure your interview first',
        variant: 'destructive',
      });
      navigate('/advanced-interview/config');
      return;
    }

    try {
      const config = JSON.parse(configStr);
      console.log("Parsed config:", config);
      setInterviewConfig(config);
      
      // Don't start interview until we have userId
      const fetchUserAndStartInterview = async () => {
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            setUserId(data.user.id);
            // Now that we have the userId, start the interview
            startInterview(config, data.user.id);
          } else {
            console.error("No user ID available");
            toast({
              title: 'Authentication error',
              description: 'Please sign in again',
              variant: 'destructive',
            });
            navigate('/auth');
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          toast({
            title: 'Authentication error',
            description: 'Could not verify your identity',
            variant: 'destructive',
          });
        }
      };
      
      fetchUserAndStartInterview();
    } catch (error) {
      console.error('Error parsing interview config:', error);
      toast({
        title: 'Invalid session data',
        description: 'Please configure your interview again',
        variant: 'destructive',
      });
      navigate('/advanced-interview/config');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async (config: AdvancedInterviewConfiguration, userIdParam: string) => {
    setLoading(true);
    try {
      console.log("Starting interview with config:", config);
      
      // Record this interview session - now using the passed userId parameter
      try {
        // First check if we already have a recent session to avoid duplicates
        const { data: existingSession, error: checkError } = await supabase
          .from('advanced_interview_sessions')
          .select('id, created_at')
          .eq('user_id', userIdParam)
          .eq('status', 'active')
          .eq('job_role', config.jobRole)
          .eq('company_name', config.companyName)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (checkError) {
          console.error("Error checking for existing sessions:", checkError);
        }
        
        // If we found an active session created in the last minute, use that instead
        const recentSession = existingSession?.length > 0 && 
          (new Date().getTime() - new Date(existingSession[0].created_at).getTime() < 60000);
          
        if (recentSession) {
          console.log("Using recent existing session instead of creating a new one");
        } else {
          // Only create a new session if we don't have a recent one
          const { error } = await supabase
            .from('advanced_interview_sessions')
            .insert({
              user_id: userIdParam,
              job_role: config.jobRole,
              company_name: config.companyName,
              created_at: new Date().toISOString(),
              status: 'active',
              questions: JSON.stringify(config.questions)
            });
            
          if (error) {
            console.error("Error recording advanced interview session:", error);
          } else {
            console.log("Successfully created new advanced interview session");
          }
        }
      } catch (err) {
        console.error("Failed to record advanced interview session:", err);
      }
      
      // 🚀 AWS Lambda Hackathon: Using Lambda function for advanced interview AI
      const { useLambda } = useBackendConfig();
      
      let data: any, error: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for advanced interview AI');
        try {
          data = await lambdaApi.advancedInterview({
            jobRole: config.jobRole,
            companyName: config.companyName,
            questions: config.questions
          });
          error = null;
        } catch (lambdaError) {
          console.error('Lambda advanced interview error, falling back to Supabase:', lambdaError);
          error = lambdaError;
          data = null;
        }
      }
      
      // Fallback to Supabase if Lambda fails or not enabled
      if (!useLambda || error) {
        console.log('Using Supabase fallback for advanced interview AI');
        const result = await supabase.functions.invoke('advanced-interview-ai', {
          body: { 
            jobRole: config.jobRole,
            companyName: config.companyName,
            questions: config.questions
          },
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Error invoking advanced-interview-ai:", error);
        throw new Error(error.message);
      }

      console.log("Received response from advanced-interview-ai:", data);

      if (data.question) {
        const loadingMessage: InterviewMessage = {
          id: uuidv4(),
          sender: 'ai',
          content: "...",
          timestamp: new Date(),
          isLoading: true
        };
        
        setMessages([loadingMessage]);
        
        const newMessage: InterviewMessage = {
          id: uuidv4(),
          sender: 'ai',
          content: data.question,
          timestamp: new Date()
        };
        
        const speechStarted = await speakMessage(data.question);
        
        setMessages([newMessage]);
      } else {
        console.error("No question received from advanced-interview-ai");
        toast({
          title: 'Failed to start interview',
          description: 'No interview question was generated',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error starting interview:', error);
      toast({
        title: 'Failed to start interview',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || processingAnswer) return;
    
    setProcessingAnswer(true);
    
    const userMessage: InterviewMessage = {
      id: uuidv4(),
      sender: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));
      
      conversationHistory.push({
        role: 'user',
        content: messageContent
      });
      
      const loadingMessage: InterviewMessage = {
        id: uuidv4(),
        sender: 'ai',
        content: "...",
        timestamp: new Date(),
        isLoading: true
      };
      
      setMessages(prev => [...prev, loadingMessage]);
      
      // 🚀 AWS Lambda Hackathon: Using Lambda function for advanced interview AI conversation
      const { useLambda } = useBackendConfig();
      
      let data: any, error: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for advanced interview AI conversation');
        try {
          data = await lambdaApi.advancedInterview({
            jobRole: interviewConfig?.jobRole || '',
            companyName: interviewConfig?.companyName || '',
            questions: interviewConfig?.questions,
            conversationHistory
          });
          error = null;
        } catch (lambdaError) {
          console.error('Lambda advanced interview conversation error, falling back to Supabase:', lambdaError);
          error = lambdaError;
          data = null;
        }
      }
      
      // Fallback to Supabase if Lambda fails or not enabled
      if (!useLambda || error) {
        console.log('Using Supabase fallback for advanced interview AI conversation');
        const result = await supabase.functions.invoke('advanced-interview-ai', {
          body: { 
            jobRole: interviewConfig?.jobRole,
            companyName: interviewConfig?.companyName,
            questions: interviewConfig?.questions,
            conversationHistory
          },
        });
        data = result.data;
        error = result.error;
      }
      
      if (error) throw new Error(error.message);
      
      if (data.question) {
        const aiMessage: InterviewMessage = {
          id: uuidv4(),
          sender: 'ai',
          content: data.question,
          timestamp: new Date()
        };
        
        const speechStarted = await speakMessage(data.question);
        
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => !msg.isLoading);
          return [...filteredMessages, aiMessage];
        });
      }
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      toast({
        title: 'Failed to get response',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingAnswer(false);
    }
  };

  const handleTranscription = (text: string) => {
    setUserInput(text);
    sendMessage(text);
  };

  const speakMessage = async (text: string) => {
    try {
      setIsPreparingAudio(true);
      
      // 🚀 AWS Lambda Hackathon: Using Lambda function for text-to-speech
      const { useLambda } = useBackendConfig();
      
      let data: any, error: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for text-to-speech');
        try {
          data = await lambdaApi.textToSpeech({
            text,
            voice: "3eIAPRQVsX0VrSFmqoTf"
          });
          error = null;
        } catch (lambdaError) {
          console.error('Lambda text-to-speech error, falling back to Supabase:', lambdaError);
          error = lambdaError;
          data = null;
        }
      }
      
      // Fallback to Supabase if Lambda fails or not enabled
      if (!useLambda || error) {
        console.log('Using Supabase fallback for text-to-speech');
        const result = await supabase.functions.invoke('text-to-speech', {
          body: { 
            text,
            voice: "3eIAPRQVsX0VrSFmqoTf"
          }
        });
        data = result.data;
        error = result.error;
      }
      
      if (error) throw new Error(error.message);
      
      if (data.audioContent) {
        const audioSrc = `data:audio/mpeg;base64,${data.audioContent}`;
        
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.onended = () => {
            setSpeaking(false);
          };
          
          setIsPreparingAudio(false);
          setSpeaking(true);
          await audioRef.current.play();
          return true;
        }
      }
      setIsPreparingAudio(false);
      return false;
    } catch (error: any) {
      console.error('Error playing audio:', error);
      setIsPreparingAudio(false);
      setSpeaking(false);
      
      toast({
        title: 'Audio playback failed',
        description: 'Unable to play the interview question audio',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleEndInterview = async () => {
    if (userId && interviewConfig && messages.length > 0) {
      try {
        // First check if we already have a session record for this session
        const { data: existingSession, error: queryError } = await supabase
          .from('advanced_interview_sessions')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
          console.error('Error checking for existing session:', queryError);
        }

        if (existingSession?.id) {
          // If we have an existing session, update it directly
          const { error: updateError } = await supabase
            .from('advanced_interview_sessions')
            .update({
              status: 'completed',
              end_time: new Date().toISOString(),
              messages: JSON.stringify(messages),
              feedback: feedback ? JSON.stringify(feedback) : null
            })
            .eq('id', existingSession.id);
          
          if (updateError) {
            console.error('Error updating session record:', updateError);
          } else {
            console.log('Successfully updated interview session');
            // Invalidate the usage cache to ensure counts are updated immediately
            invalidateUsageCache(userId);
          }
        } else {
          // Log a warning but don't create a new record - this should not happen
          // if the startInterview function worked properly
          console.warn('No active session found, but we should have had one from startInterview');
        }
      } catch (error) {
        console.error('Error saving interview data:', error);
      }
    }
    
    navigate('/dashboard');
  };

  const generateFeedback = async () => {
    if (messages.length < 4) {
      toast({
        title: "Not enough data",
        description: "Please complete more of the interview before requesting feedback.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingFeedback(true);
    setFeedbackError(null);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));

      console.log("Sending feedback request with conversation history:", conversationHistory.length, "messages");

      // 🚀 AWS Lambda Hackathon: Using Lambda function for feedback generation
      const { useLambda } = useBackendConfig();
      
      let data: any, error: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for Advanced AI feedback generation');
        try {
          data = await lambdaApi.generateInterviewFeedback({
            jobRole: interviewConfig?.jobRole || '',
            experienceLevel: 'mid-level',
            conversation: conversationHistory,
            companyName: interviewConfig?.companyName || '', // Ensure companyName is not undefined
          });
          error = null;
        } catch (lambdaError) {
          console.error('Lambda feedback error, falling back to Supabase:', lambdaError);
          error = lambdaError;
          data = null;
        }
      }
      
      // Fallback to Supabase if Lambda fails or not enabled
      if (!useLambda || error) {
        console.log('Using Supabase fallback for Advanced AI feedback generation');
        const result = await supabase.functions.invoke('generate-interview-feedback', {
          body: { 
            jobRole: interviewConfig?.jobRole,
            companyName: interviewConfig?.companyName,
            experienceLevel: 'mid-level',
            conversation: conversationHistory
          },
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Feedback generation error:", error);
        throw new Error(error.message || "Failed to call feedback generation service");
      }

      console.log("Received response from feedback generation:", data);

      if (data.error) {
        console.error("Feedback service returned error:", data.error);
        throw new Error(data.error);
      }

      if (!data.feedback) {
        console.error("No feedback data received");
        throw new Error("No feedback data was received from the service");
      }

      setFeedback(data.feedback);
      
      toast({
        title: "Feedback generated",
        description: "Your interview performance has been analyzed",
      });
    } catch (error: any) {
      console.error('Error generating feedback:', error);
      
      setFeedbackError(error.message || 'Unable to generate interview feedback');
      
      toast({
        title: 'Feedback generation failed',
        description: error.message || 'Unable to generate interview feedback',
        variant: 'destructive',
      });
    } finally {
      setGeneratingFeedback(false);
    }
  };

  const toggleInputMode = (mode: 'text' | 'voice') => {
    setInputMode(mode);
    if (mode === 'text') {
      setShowTextInput(true);
    } else {
      setShowTextInput(false);
    }
  };

  // Add session cleanup on unmount
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      // If the user navigates away without calling handleEndInterview,
      // we should ONLY update existing sessions, not create new ones
      if (userId) {
        const updateSession = async () => {
          try {
            // ONLY look for active sessions that were recently created
            const { data, error } = await supabase
              .from('advanced_interview_sessions')
              .select('id')
              .eq('user_id', userId)
              .eq('status', 'active')
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
            
            if (error && error.code !== 'PGRST116') {
              console.error('Error checking for active session on unmount:', error);
              return;
            }
            
            // Only proceed if we found an existing session
            if (data?.id) {
              const { error: updateError } = await supabase
                .from('advanced_interview_sessions')
                .update({
                  status: 'completed',
                  end_time: new Date().toISOString()
                })
                .eq('id', data.id);
              
              if (updateError) {
                console.error('Error updating session status on unmount:', updateError);
              } else {
                console.log('Successfully marked session as completed on unmount');
                // Invalidate usage cache to ensure counts are updated immediately
                invalidateUsageCache(userId);
              }
            } else {
              // Do NOT create a new session if none exists
              console.log('No active session found to update on unmount');
            }
          } catch (err) {
            console.error('Error in session cleanup on unmount:', err);
          }
        };
        
        updateSession();
      }
    };
  }, [userId]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={handleEndInterview} 
            className="mr-2 sm:mr-4"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold truncate max-w-[150px] sm:max-w-full">
              {interviewConfig ? `${interviewConfig.companyName} ${interviewConfig.jobRole} Interview` : 'Advanced Interview'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              AI-powered mock interview session
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-xs sm:text-sm"
            onClick={handleEndInterview}
          >
            <XCircle size={14} className="sm:size-16" />
            Exit
          </Button>
          
          <InterviewFeedback 
            feedback={feedback}
            isLoading={generatingFeedback}
            onGenerateFeedback={generateFeedback}
            error={feedbackError}
          />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-1/2 h-[250px] sm:h-[300px] md:h-auto relative bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center">
          <audio ref={audioRef} className="hidden" />
          <Avatar3D 
            modelUrl={'/assets/avatars/avatar_with_morphs.glb.glb'} 
            isSpeaking={isSpeaking} 
            audioRef={audioRef} 
          />
          
          {isPreparingAudio && (
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center">
              <span className="animate-pulse mr-2">●</span>
              Preparing speech...
            </div>
          )}
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col bg-neutral-50 dark:bg-neutral-900 h-[calc(100vh-350px)] sm:h-[calc(100vh-400px)] md:h-auto">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-2 sm:p-4 sticky bottom-0 bg-neutral-50 dark:bg-neutral-900">
            <div className="flex flex-col h-auto sm:h-32">
              <div className="flex mb-2 sm:mb-3 gap-2">
                <Button
                  variant={inputMode === 'voice' ? "default" : "outline"}
                  className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                  onClick={() => toggleInputMode('voice')}
                  disabled={processingAnswer}
                >
                  <Mic size={16} className="sm:size-20" />
                  <span>Voice Answer</span>
                </Button>
                <Button
                  variant={inputMode === 'text' ? "default" : "outline"}
                  className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                  onClick={() => toggleInputMode('text')}
                  disabled={processingAnswer}
                >
                  <MessageSquare size={16} className="sm:size-20" />
                  <span>Text Answer</span>
                </Button>
              </div>
              
              <div className="flex-1 flex">
                {showTextInput ? (
                  <div className="flex w-full gap-2">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer..."
                      className="resize-none flex-1 min-h-[40px] sm:min-h-[60px] text-sm sm:text-base"
                      disabled={processingAnswer}
                    />
                    <Button
                      onClick={() => sendMessage(userInput)}
                      disabled={!userInput.trim() || processingAnswer}
                      className="self-end h-8 w-8 sm:h-10 sm:w-auto px-0 sm:px-4"
                    >
                      <Send size={16} className="sm:size-18 sm:mr-2" />
                      <span className="hidden sm:inline">Send</span>
                    </Button>
                  </div>
                ) : (
                  <div className="w-full">
                    <AudioRecorder
                      onTranscription={handleTranscription}
                      disabled={processingAnswer}
                      className="h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedInterviewSession;
