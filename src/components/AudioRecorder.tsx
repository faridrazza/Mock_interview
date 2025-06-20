import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBackendConfig, lambdaApi } from '@/config/aws-lambda';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onTranscription, 
  disabled = false,
  className = ""
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  /**
   * Get optimal audio configuration for MediaRecorder
   * Prioritizes formats most compatible with Amazon Transcribe
   */
  const getAudioRecorderOptions = () => {
    const options = [
      // WAV format (best compatibility with Transcribe)
      { mimeType: 'audio/wav' },
      { mimeType: 'audio/wav;codecs=pcm' },
      
      // WebM with Opus codec (supported by Transcribe)
      { mimeType: 'audio/webm;codecs=opus' },
      { mimeType: 'audio/webm' },
      
      // MP4 fallbacks
      { mimeType: 'audio/mp4' },
      { mimeType: 'audio/mp4;codecs=mp4a.40.2' },
      
      // Last resort
      { mimeType: 'audio/ogg;codecs=opus' },
    ];

    for (const option of options) {
      if (MediaRecorder.isTypeSupported(option.mimeType)) {
        console.log(`Using audio format: ${option.mimeType}`);
        return option;
      }
    }

    console.warn('No optimal audio format supported, using browser default');
    return {};
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for speech recognition
          channelCount: 1 // Mono audio
        }
      });
      
      const recorderOptions = getAudioRecorderOptions();
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Use the same MIME type that was used for recording
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log(`Recorded audio: ${audioBlob.size} bytes, type: ${mimeType}`);
        
        await processAudio(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop recording after 60 seconds to prevent very long recordings
      setTimeout(() => {
        if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('Auto-stopping recording after 60 seconds');
          stopRecording();
        }
      }, 60000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Microphone access denied',
        description: 'Please allow microphone access to record your answer',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    // Validate audio size before processing
    if (audioBlob.size < 1000) { // Less than 1KB
      toast({
        title: 'Recording too short',
        description: 'Please record for at least 2 seconds and speak clearly.',
        variant: 'destructive',
      });
      setIsProcessing(false);
      return;
    }

    if (audioBlob.size > 25 * 1024 * 1024) { // Greater than 25MB
      toast({
        title: 'Recording too long',
        description: 'Please record a shorter message (maximum 2 minutes).',
        variant: 'destructive',
      });
      setIsProcessing(false);
      return;
    }

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        try {
          // 🚀 AWS Lambda Hackathon: Using Lambda function for speech-to-text
          const { useLambda } = useBackendConfig();
          
          let data: any, error: any;
          
          if (useLambda) {
            console.log('🚀 Using AWS Lambda for speech-to-text');
            try {
              data = await lambdaApi.speechToText({
                audio: base64Audio,
              });
              error = null;
              console.log('✅ Lambda speech-to-text successful');
            } catch (lambdaError: any) {
              console.error('❌ Lambda STT error:', lambdaError);
              error = lambdaError;
              data = null;
              
              // Show specific error message if available
              if (lambdaError.message) {
                toast({
                  title: 'Speech recognition failed',
                  description: lambdaError.message,
                  variant: 'destructive',
                });
                setIsProcessing(false);
                return;
              }
            }
          }
          
          // Fallback to Supabase if Lambda fails or not enabled
          if (!useLambda || error) {
            console.log('Using Supabase fallback for speech-to-text');
            const result = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio },
            });
            data = result.data;
            error = result.error;
          }

          if (error) {
            throw new Error(error.message || 'Transcription service error');
          }

          if (data && data.text && data.text.trim()) {
            console.log('✅ Transcription successful:', data.text);
            onTranscription(data.text);
            
            toast({
              title: 'Speech recognized',
              description: 'Your answer has been transcribed successfully.',
              variant: 'default',
            });
          } else {
            console.warn('⚠️ No text in transcription response:', data);
            toast({
              title: 'No speech detected',
              description: 'Could not detect speech in your recording. Please try speaking more clearly.',
              variant: 'destructive',
            });
          }
        } catch (error: any) {
          console.error('Error in speech-to-text processing:', error);
          
          // Provide specific error messages based on error type
          let errorTitle = 'Transcription error';
          let errorMessage = 'An error occurred during transcription. Please try again.';
          
          if (error.message) {
            if (error.message.includes('too short') || error.message.includes('2 seconds')) {
              errorTitle = 'Recording too short';
              errorMessage = 'Please record for at least 2 seconds and speak clearly.';
            } else if (error.message.includes('too large') || error.message.includes('shorter') || error.message.includes('25MB')) {
              errorTitle = 'Recording too long';
              errorMessage = 'Please record a shorter message (maximum 25MB for OpenAI Whisper).';
            } else if (error.message.includes('No speech detected') || error.message.includes('no speech')) {
              errorTitle = 'No speech detected';
              errorMessage = 'Please ensure you are speaking clearly into the microphone.';
            } else if (error.message.includes('Audio format') || error.message.includes('format')) {
              errorTitle = 'Audio format issue';
              errorMessage = 'Audio format not supported. Please try recording again.';
            } else if (error.message.includes('temporarily busy') || error.message.includes('try again in a moment')) {
              errorTitle = 'Service busy';
              errorMessage = 'Our speech recognition service is temporarily busy. Please try again in a moment.';
            } else if (error.message.includes('Authentication error')) {
              errorTitle = 'Service error';
              errorMessage = 'There was an authentication issue. Please try again or contact support.';
            } else {
              errorMessage = error.message;
            }
          }
          
          toast({
            title: errorTitle,
            description: errorMessage,
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        console.error('FileReader error');
        toast({
          title: 'Processing error',
          description: 'Could not process audio recording. Please try again.',
          variant: 'destructive',
        });
        setIsProcessing(false);
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      toast({
        title: 'Processing error',
        description: 'Could not process audio recording',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {isRecording ? (
        <Button 
          variant="destructive" 
          className="w-full h-full flex items-center justify-center animate-pulse"
          onClick={stopRecording}
          disabled={disabled}
        >
          <Square size={24} />
          <span className="ml-2">Stop Recording</span>
        </Button>
      ) : isProcessing ? (
        <Button 
          variant="outline" 
          className="w-full h-full flex items-center justify-center"
          disabled={true}
        >
          <Loader2 size={24} className="animate-spin" />
          <span className="ml-2">Processing...</span>
        </Button>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-full flex items-center justify-center text-brand-600 dark:text-brand-400 border-brand-300 dark:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/30"
          onClick={startRecording}
          disabled={disabled}
        >
          <Mic size={24} />
          <span className="ml-2">Record Answer</span>
        </Button>
      )}
    </div>
  );
};

export default AudioRecorder;
