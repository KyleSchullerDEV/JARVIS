import React from 'react';
import { ToolCall, ToolResult } from 'ai';

interface ToolInvocationProps {
  toolInvocation: ToolCall | ToolResult;
}

export const ToolInvocation: React.FC<ToolInvocationProps> = ({ toolInvocation }) => {
  const renderToolCall = (name: string, args: any) => (
    <div className='mb-2'>
      <strong>Action:</strong> {name}
      <pre className='mt-1 rounded bg-gray-100 p-2 text-sm'>
        {JSON.stringify(args, null, 2)}
      </pre>
    </div>
  );

  const renderToolResult = (result: any) => (
    <div className='mb-2'>
      <strong>Result:</strong>
      <pre className='mt-1 rounded bg-gray-100 p-2 text-sm'>
        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );

  if ('state' in toolInvocation) {
    switch (toolInvocation.state) {
      case 'partial-call':
        return (
          <div className='my-2 border-l-4 border-yellow-500 pl-5'>
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            <div className='text-yellow-600'>Action in progress...</div>
          </div>
        );
      case 'call':
        return (
          <div className='my-2 border-l-4 border-blue-500 pl-5'>
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            <div className='text-blue-600'>Waiting for result...</div>
          </div>
        );
      case 'result':
        return (
          <div className='my-2 border-l-4 border-green-500 pl-5'>
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            {renderToolResult(toolInvocation.result)}
          </div>
        );
    }
  } else if ('result' in toolInvocation) {
    return (
      <div className='my-2 border-l-4 border-green-500 pl-5'>
        {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
        {renderToolResult(toolInvocation.result)}
      </div>
    );
  } else {
    return (
      <div className='my-2 border-l-4 border-blue-500 pl-5'>
        {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
        <div className='text-blue-600'>Waiting for result...</div>
      </div>
    );
  }
};