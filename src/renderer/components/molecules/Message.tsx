import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ToolInvocation } from './ToolInvocation';

interface MessageProps {
  message: any;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  return (
    <>
      {message.content && (
        <div
          className={twMerge(
            'mb-4 whitespace-pre-wrap rounded-lg bg-blue-600 p-4',
            message.role === 'user' && 'bg-slate-600'
          )}
        >
          <div className='flex items-start justify-between'>
            <strong>{message.role === 'user' ? 'User: ' : 'JARVIS: '}</strong>
          </div>
          <div className='mt-2'>{message.content}</div>
        </div>
      )}
      {message.toolInvocations && message.toolInvocations.length > 0 && (
        <div className='mb-4'>
          {message.toolInvocations.map(
            (toolInvocation: any, index: number) => (
              <ToolInvocation
                key={index}
                toolInvocation={toolInvocation}
              />
            )
          )}
        </div>
      )}
    </>
  );
};