import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { InterviewConfiguration, InterviewMessage, InterviewFeedback } from '@/types/interview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, AlertCircle, Mic, Clock, MessageSquare } from 'lucide-react';
import { Avatar3D } from '@/components/Avatar3D';
import AudioRecorder from '@/components/AudioRecorder';
import ChatMessage from '@/components/ChatMessage';
import { Sidebar } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import InterviewFeedbackComponent from '@/components/interview/InterviewFeedback';
import { useBackendConfig, createMigrationWrapper, lambdaApi } from '@/config/aws-lambda';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback: (props: { error: Error }) => React.ReactNode },
  { hasError: boolean, error: Error | null }
> {
  constructor(props: { children: React.ReactNode, fallback: (props: { error: Error }) => React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in interview component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({ error: this.state.error as Error });
    }
    return this.props.children;
  }
}

const InterviewSession = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfiguration | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [timer, setTimer] = useState<number>(0);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('voice');
  const [showTextInput, setShowTextInput] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const audioInitialized = useRef<boolean>(false);
  
  useEffect(() => {
    const audio = new Audio();
    audio.onplay = () => {
      console.log("Audio started playing");
      setIsSpeaking(true);
    };
    audio.onended = () => {
      console.log("Audio playback ended");
      setIsSpeaking(false);
    };
    audio.onerror = (e) => {
      console.error("Audio playback error:", e);
      setIsSpeaking(false);
    };
    audio.onpause = () => {
      console.log("Audio playback paused");
      setIsSpeaking(false);
    };
    
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  useEffect(() => {
    try {
      const configData = sessionStorage.getItem('interviewConfig');
      if (!configData) {
        toast({
          title: 'Configuration missing',
          description: 'Interview configuration not found. Please set up a new interview.',
          variant: 'destructive',
        });
        navigate('/interview/config');
        return;
      }
      
      const config = JSON.parse(configData) as InterviewConfiguration;
      setInterviewConfig(config);
      
      startInterview(config);
      
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error in interview initialization:', error);
      toast({
        title: 'Configuration error',
        description: 'Invalid interview configuration. Please set up a new interview.',
        variant: 'destructive',
      });
      navigate('/interview/config');
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (interviewId) {
        saveInterviewEndTime(interviewId);
      }
    };
  }, [navigate, toast]);
  
  useEffect(() => {
    const initializeAudio = () => {
      if (!audioInitialized.current && audioRef.current) {
        audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audioRef.current.volume = 0.01;
        
        const playPromise = audioRef.current.play();
        if (playPromise) {
          playPromise
            .then(() => {
              console.log("Audio context initialized successfully");
              audioInitialized.current = true;
              audioRef.current!.pause();
              audioRef.current!.currentTime = 0;
              audioRef.current!.volume = 1.0;
            })
            .catch(err => {
              console.warn("Could not auto-initialize audio context:", err);
            });
        }
      }
    };
    
    document.addEventListener('click', initializeAudio);
    document.addEventListener('touchstart', initializeAudio);
    document.addEventListener('keydown', initializeAudio);
    
    return () => {
      document.removeEventListener('click', initializeAudio);
      document.removeEventListener('touchstart', initializeAudio);
      document.removeEventListener('keydown', initializeAudio);
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async (config: InterviewConfiguration) => {
    try {
      setLoading(true);
      
      if (user) {
        const { data: interviewData, error: interviewError } = await supabase
          .from('interviews')
          .insert({
            user_id: user.id,
            job_role: config.jobRole,
            experience_level: config.experienceLevel,
            start_time: new Date().toISOString(),
          })
          .select('id')
          .single();
        
        if (interviewError) {
          console.error('Error creating interview record:', interviewError);
        } else if (interviewData) {
          setInterviewId(interviewData.id);
        }
      }
      
      const firstMessage: InterviewMessage = {
        id: uuidv4(),
        sender: 'ai',
        content: 'Loading your first question...',
        timestamp: new Date(),
      };
      
      setMessages([firstMessage]);
      
      await getNextQuestion(config, []);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: 'Interview error',
        description: 'Could not start the interview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInterviewEndTime = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('interviews')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating interview end time:', error);
      }
    } catch (error) {
      console.error('Error saving interview end time:', error);
    }
  };

  const saveMessageToDatabase = async (message: InterviewMessage, interview_id: string) => {
    if (!interview_id) {
      console.error('Cannot save message: No interview ID');
      return;
    }

    try {
      const { error } = await supabase
        .from('interview_questions')
        .insert({
          interview_id: interview_id,
          question_text: message.sender === 'ai' ? message.content : '',
          answer_text: message.sender === 'user' ? message.content : '',
        });

      if (error) {
        console.error('Error saving message to database:', error);
      }
    } catch (error) {
      console.error('Exception saving message to database:', error);
    }
  };

  const getNextQuestion = async (config: InterviewConfiguration, conversation: any[]) => {
    setIsAiThinking(true);
    
    try {
      // 🚀 AWS Lambda Hackathon: Using Lambda function for question generation
      const { useLambda } = useBackendConfig();
      console.log('🔍 DEBUG: useLambda value:', useLambda);
      console.log('🔍 DEBUG: useBackendConfig result:', useBackendConfig());
      
      let questionData: any, questionError: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for question generation');
        try {
          questionData = await lambdaApi.generateInterviewQuestion({
            jobRole: config.jobRole,
            experienceLevel: config.experienceLevel,
            yearsOfExperience: config.yearsOfExperience,
            conversationHistory: conversation,
          });
          questionError = null;
        } catch (error) {
          console.error('Lambda function error, falling back to Supabase:', error);
          questionError = error;
          questionData = null;
        }
      }
      
      // Fallback to Supabase if Lambda fails or not enabled
      if (!useLambda || questionError) {
        console.log('Using Supabase fallback for question generation');
        const result = await supabase.functions.invoke('generate-interview-question', {
        body: {
          jobRole: config.jobRole,
          experienceLevel: config.experienceLevel,
          yearsOfExperience: config.yearsOfExperience,
          conversationHistory: conversation,
        },
      });
        questionData = result.data;
        questionError = result.error;
      }
      
      if (questionError) {
        console.error("Error generating question:", questionError);
        const fallbackQuestions = [
          "Could you tell me about your relevant experience for this role?",
          "What are your key strengths that make you a good fit for this position?",
          "How do you handle challenging situations in the workplace?",
          "What are your career goals and how does this position align with them?",
          "Tell me about a project you're particularly proud of."
        ];
        const randomIndex = Math.floor(Math.random() * fallbackQuestions.length);
        const fallbackQuestion = fallbackQuestions[randomIndex];
        
        const newMessage: InterviewMessage = {
          id: uuidv4(),
          sender: 'ai',
          content: fallbackQuestion,
          timestamp: new Date(),
        };
        
        setMessages(prevMessages => {
          if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'ai' && 
            prevMessages[prevMessages.length - 1].content.includes('Loading')) {
            return [...prevMessages.slice(0, -1), newMessage];
          }
          return [...prevMessages, newMessage];
        });
        
        if (interviewId) {
          await saveMessageToDatabase(newMessage, interviewId);
        }
        
        try {
          await speakText(fallbackQuestion);
        } catch (speechError) {
          console.error("Error speaking fallback question:", speechError);
        }
        
        toast({
          title: 'Using offline questions',
          description: 'We encountered an issue connecting to our AI service. Using pre-defined questions instead.',
          variant: 'default',
        });
        
        setIsAiThinking(false);
        return;
      }

      if (!questionData || !questionData.question) {
        console.error("No question was generated, response:", questionData);
        const fallbackQuestion = "What skills do you think are most important for success in this role?";
        
        const newMessage: InterviewMessage = {
          id: uuidv4(),
          sender: 'ai',
          content: fallbackQuestion,
          timestamp: new Date(),
        };
        
        setMessages(prevMessages => {
          if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'ai' && 
            prevMessages[prevMessages.length - 1].content.includes('Loading')) {
            return [...prevMessages.slice(0, -1), newMessage];
          }
          return [...prevMessages, newMessage];
        });
        
        if (interviewId) {
          await saveMessageToDatabase(newMessage, interviewId);
        }
        
        try {
          await speakText(fallbackQuestion);
        } catch (speechError) {
          console.error("Error speaking fallback question:", speechError);
        }
        
        setIsAiThinking(false);
        return;
      }
      
      const newMessage: InterviewMessage = {
        id: uuidv4(),
        sender: 'ai',
        content: questionData.question,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => {
        if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'ai' && 
            prevMessages[prevMessages.length - 1].content.includes('Loading')) {
          return [...prevMessages.slice(0, -1), newMessage];
        }
        return [...prevMessages, newMessage];
      });
      
      if (interviewId) {
        await saveMessageToDatabase(newMessage, interviewId);
      }
      
      try {
        await speakText(questionData.question);
      } catch (speechError) {
        console.error("Error speaking question:", speechError);
      }
    } catch (error: any) {
      console.error('Error getting next question:', error);
      
      const fallbackQuestion = "Tell me about your approach to problem-solving.";
      
      const newMessage: InterviewMessage = {
        id: uuidv4(),
        sender: 'ai',
        content: fallbackQuestion,
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => {
        if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].sender === 'ai' && 
            prevMessages[prevMessages.length - 1].content.includes('Loading')) {
          return [...prevMessages.slice(0, -1), newMessage];
        }
        return [...prevMessages, newMessage];
      });
      
      if (interviewId) {
        await saveMessageToDatabase(newMessage, interviewId);
      }
      
      try {
        await speakText(fallbackQuestion);
      } catch (speechError) {
        console.error("Error speaking fallback question:", speechError);
      }
      
      toast({
        title: 'Question generation failed',
        description: 'Using a backup question instead.',
        variant: 'destructive',
      });
    } finally {
      setIsAiThinking(false);
    }
  };

  const speakText = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      setIsSpeaking(true);
      
      console.log("Calling text-to-speech with text:", text.substring(0, 50) + "...");
      
      // 🚀 AWS Lambda Hackathon: Using Lambda function for text-to-speech
      const { useLambda } = useBackendConfig();
      
      let data: any, error: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for text-to-speech');
        try {
          data = await lambdaApi.textToSpeech({
            text,
            voice: "en-US-Neural2-F", // Google Cloud TTS voice
            generateLipSync: true
          });
          error = null;
        } catch (lambdaError) {
          console.error('Lambda TTS error, falling back to Supabase:', lambdaError);
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
          voice: "3eIAPRQVsX0VrSFmqoTf" // Default voice
        }
      });
        data = result.data;
        error = result.error;
      }
      
      console.log("Text-to-speech response received:", { 
        hasData: !!data, 
        hasError: !!error,
        hasAudioContent: data && !!data.audioContent,
        hasLipSync: data && !!data.lipSync,
        audioContentLength: data?.audioContent ? data.audioContent.length : 0,
        lipSyncCuesCount: data?.lipSync?.mouthCues ? data.lipSync.mouthCues.length : 0
      });
      
      if (error) {
        console.error("Text-to-speech edge function error:", error);
        throw new Error(`Text-to-speech request failed: ${error.message}`);
      }
      
      if (!data || !data.audioContent) {
        console.warn("No audio content returned from text-to-speech");
        const avgWordsPerMinute = 150;
        const words = text.split(' ').length;
        const durationMs = (words / avgWordsPerMinute) * 60 * 1000;
        
        toast({
          title: "Audio unavailable",
          description: "Using silent mode for this response.",
          variant: "default",
        });
        
        setTimeout(() => {
          setIsSpeaking(false);
        }, durationMs);
        return;
      }
      
      const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
      
      // Remove lip sync attachment to let Avatar3D generate synthetic lip sync
      const finalAudioSrc = audioSrc;
      
      if (audioRef.current) {
        const handleAudioEnd = () => {
          console.log("Audio playback ended");
          setIsSpeaking(false);
          audioRef.current?.removeEventListener('ended', handleAudioEnd);
        };
        
        const handleAudioPlay = () => {
          console.log("Audio playback started, duration:", audioRef.current?.duration);
          setIsSpeaking(true);
        };
        
        const handleAudioError = (e: Event) => {
          console.error("Audio error event:", e);
          setIsSpeaking(false);
        };
        
        const handleAudioPause = () => {
          console.log("Audio paused");
          setIsSpeaking(false);
        };
        
        audioRef.current.removeEventListener('ended', handleAudioEnd);
        audioRef.current.removeEventListener('play', handleAudioPlay);
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.removeEventListener('pause', handleAudioPause);
        
        audioRef.current.addEventListener('ended', handleAudioEnd);
        audioRef.current.addEventListener('play', handleAudioPlay);
        audioRef.current.addEventListener('error', handleAudioError);
        audioRef.current.addEventListener('pause', handleAudioPause);
        
        audioRef.current.src = finalAudioSrc;
        
        setIsSpeaking(true);
        
        try {
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully");
                setIsSpeaking(true);
              })
              .catch(error => {
                console.error("Error playing audio:", error);
                toast({
                  title: "Audio playback error",
                  description: "Could not play audio. Check your browser settings.",
                  variant: "destructive",
                });
                
                const avgWordsPerMinute = 150;
                const words = text.split(' ').length;
                const durationMs = (words / avgWordsPerMinute) * 60 * 1000;
                
                setTimeout(() => {
                  setIsSpeaking(false);
                }, durationMs);
              });
          }
        } catch (error) {
          console.error("Exception playing audio:", error);
          toast({
            title: "Audio playback error",
            description: "Could not play audio. Check your browser settings.",
            variant: "destructive",
          });
          
          const avgWordsPerMinute = 150;
          const words = text.split(' ').length;
          const durationMs = (words / avgWordsPerMinute) * 60 * 1000;
          
          setTimeout(() => {
            setIsSpeaking(false);
          }, durationMs);
        }
      } else {
        console.error("Audio reference is null");
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      toast({
        title: "Text-to-speech error",
        description: "Could not generate speech. Using silent mode.",
        variant: "destructive",
      });
      
      const avgWordsPerMinute = 150;
      const words = text.split(' ').length;
      const durationMs = (words / avgWordsPerMinute) * 60 * 1000;
      
      setTimeout(() => {
        setIsSpeaking(false);
      }, durationMs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !interviewConfig) return;
    
    const userMessage: InterviewMessage = {
      id: uuidv4(),
      sender: 'user',
      content: inputText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    if (interviewId) {
      await saveMessageToDatabase(userMessage, interviewId);
    }
    
    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'ai' ? 'assistant' : 'user',
      content: msg.content,
    }));
    
    conversationHistory.push({
      role: 'user',
      content: inputText,
    });
    
    setIsAiThinking(true);
    
    if (interviewConfig) {
      getNextQuestion(interviewConfig, conversationHistory);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    if (text) {
      const userMessage: InterviewMessage = {
        id: uuidv4(),
        sender: 'user',
        content: text,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      if (interviewId) {
        saveMessageToDatabase(userMessage, interviewId);
      }
      
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      }));
      
      conversationHistory.push({
        role: 'user',
        content: text,
      });
      
      setIsAiThinking(true);
      
      if (interviewConfig) {
        getNextQuestion(interviewConfig, conversationHistory);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleEndInterview = async () => {
    if (window.confirm('Are you sure you want to end this interview?')) {
      if (interviewId) {
        await saveInterviewEndTime(interviewId);
      }
      navigate('/dashboard');
    }
  };

  const generateFeedback = async () => {
    if (!interviewConfig || messages.length < 2) {
      toast({
        title: "Insufficient data",
        description: "Complete more of the interview to receive feedback",
        variant: "destructive",
      });
      return;
    }

    setIsFeedbackLoading(true);

    try {
      const conversation = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.content,
      }));

      // 🚀 AWS Lambda Hackathon: Using Lambda function for feedback generation
      const { useLambda } = useBackendConfig();
      
      let data: any, error: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for feedback generation');
        try {
          data = await lambdaApi.generateInterviewFeedback({
            jobRole: interviewConfig.jobRole,
            experienceLevel: interviewConfig.experienceLevel,
            conversation: conversation,
            yearsOfExperience: interviewConfig.yearsOfExperience,
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
        console.log('Using Supabase fallback for feedback generation');
        const result = await supabase.functions.invoke('generate-interview-feedback', {
        body: {
          jobRole: interviewConfig.jobRole,
          experienceLevel: interviewConfig.experienceLevel,
          yearsOfExperience: interviewConfig.yearsOfExperience,
          claimedExperienceYears: interviewConfig.yearsOfExperience,
          technicalRole: true,
          evaluateExperienceMatch: true,
          conversation: conversation,
        },
      });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Error generating feedback:", error);
        toast({
          title: "Feedback generation failed",
          description: "We couldn't generate feedback at this time. Please try again later.",
          variant: "destructive",
        });
        setIsFeedbackLoading(false);
        return;
      }

      if (!data || !data.feedback) {
        console.error("No feedback was generated, response:", data);
        toast({
          title: "Feedback generation failed",
          description: "We couldn't generate meaningful feedback. Please try again.",
          variant: "destructive",
        });
        setIsFeedbackLoading(false);
        return;
      }

      setFeedback(data.feedback);
    } catch (error) {
      console.error("Error in feedback generation:", error);
      toast({
        title: "Feedback error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFeedbackLoading(false);
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

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="bg-white dark:bg-neutral-800 shadow-sm p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={handleEndInterview}
        >
          <ArrowLeft size={16} />
          Exit Interview
        </Button>
        
        <div className="flex items-center gap-3">
          <InterviewFeedbackComponent 
            feedback={feedback}
            isLoading={isFeedbackLoading}
            onGenerateFeedback={generateFeedback}
          />
          
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
            <Clock size={16} />
            <span>{formatTime(timer)}</span>
          </div>
        </div>
      </header>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-1/2 h-[250px] sm:h-[300px] md:h-auto relative bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
          <ErrorBoundary
            fallback={({ error }) => (
              <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Avatar Display Error</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                  We encountered an issue displaying the interviewer avatar.
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                  Error details: {error.message}
                </p>
                <div className="bg-neutral-100 dark:bg-neutral-700 p-4 rounded-lg w-full max-w-md">
                  <p className="text-sm font-medium mb-2">The interview will continue in text-only mode.</p>
                </div>
              </div>
            )}
          >
            <div 
              className="avatar-container h-full w-full rounded-lg overflow-hidden relative"
              style={{ 
                background: 'radial-gradient(circle, rgba(25,70,120,1) 0%, rgba(11,40,70,1) 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Avatar3D 
                isSpeaking={isSpeaking} 
                audioRef={audioRef} 
                modelUrl={'/assets/avatars/avatar_with_morphs.glb.glb'} 
                className="h-full w-full"
              />
            </div>
          </ErrorBoundary>
          
          {isAiThinking && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-lg flex items-center gap-3">
                <div className="animate-pulse flex space-x-1">
                  <div className="h-2 w-2 bg-brand-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-brand-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-brand-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Thinking...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col w-full md:w-1/2 border-l border-neutral-200 dark:border-neutral-700 h-[calc(100vh-350px)] sm:h-[calc(100vh-400px)] md:h-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                  Setting up your interview
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Preparing your {interviewConfig?.jobRole} interview...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="border-t border-neutral-200 dark:border-neutral-700 p-2 sm:p-4 bg-white dark:bg-neutral-800 sticky bottom-0">
                <div className="flex mb-2 sm:mb-3 gap-2">
                  <Button
                    variant={inputMode === 'voice' ? "default" : "outline"}
                    className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                    onClick={() => toggleInputMode('voice')}
                    disabled={isAiThinking}
                  >
                    <Mic size={16} className="sm:size-20" />
                    <span>Voice Answer</span>
                  </Button>
                  <Button
                    variant={inputMode === 'text' ? "default" : "outline"}
                    className="flex-1 gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                    onClick={() => toggleInputMode('text')}
                    disabled={isAiThinking}
                  >
                    <MessageSquare size={16} className="sm:size-20" />
                    <span>Text Answer</span>
                  </Button>
                </div>
                
                {showTextInput ? (
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="flex-1">
                      <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your answer..."
                        className="min-h-[40px] sm:min-h-[60px] text-sm sm:text-base resize-none"
                        disabled={isAiThinking || loading}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="icon"
                      className="self-end"
                      disabled={!inputText.trim() || isAiThinking || loading}
                    >
                      <Send size={16} className="sm:size-18" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex w-full">
                    <AudioRecorder 
                      onTranscription={handleVoiceTranscription}
                      disabled={isAiThinking || loading}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;

