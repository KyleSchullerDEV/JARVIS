import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ToolInvocation } from '../atoms/ToolInvocation';
import { Message as AIMessage } from 'ai';

interface MessageProps {
  message: AIMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <div
      className={twMerge(
        'mb-4 rounded-4 px-4 py-3 space-y-4',
        message.role === 'user' ? 'bg-slate-600 rounded-br-0 self-end' : 'bg-blue-600 rounded-bl-0 self-start'
      )}
    >
      <div className='sr-only' hidden>
        {message.role === 'user' ? 'The user said: ' : 'JARVIS responded: '}
      </div>
      {message.content && (
        <div className='whitespace-pre-wrap'>{message.content}</div>
      )}
      {message.toolInvocations && message.toolInvocations.length > 0 && (
        <div>
          {message.toolInvocations.map((toolInvocation, index) => (
            <ToolInvocation key={index} toolInvocation={toolInvocation} />
          ))}
        </div>
      )}
    </div>
  );
};