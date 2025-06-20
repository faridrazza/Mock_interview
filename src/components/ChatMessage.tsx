import React from 'react';
import { cn } from '@/lib/utils';
import { InterviewMessage } from '@/types/interview';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: InterviewMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.sender === 'ai';
  const isLoading = message.isLoading;
  const messageDate = message.timestamp instanceof Date 
    ? message.timestamp 
    : new Date(message.timestamp);
  
  return (
    <div className={cn(
      "flex w-full mb-4",
      isAi ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "max-w-3/4 rounded-lg p-4",
        isAi 
          ? "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-tl-none"
          : "bg-brand-500 text-white rounded-tr-none",
        isLoading && "animate-pulse"
      )}>
        {isLoading ? (
          <div className="flex space-x-1.5 items-center">
            <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        <div className={cn(
          "text-xs mt-1",
          isAi ? "text-neutral-500 dark:text-neutral-400" : "text-brand-100"
        )}>
          {format(messageDate, 'h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
