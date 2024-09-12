import React from 'react';
import { ToolCall, ToolResult } from 'ai';

import { Terminal } from '@phosphor-icons/react';

interface ToolInvocationProps {
  toolInvocation: ToolCall | ToolResult;
}

export const ToolInvocation: React.FC<ToolInvocationProps> = ({
  toolInvocation,
}) => {
  const renderToolCall = (name: string, args: any) => (
    <>
      <span className='mb-1 flex items-center gap-2'>
        <span className='sr-only'>Action:</span>{' '}
        <Terminal weight='bold' className='text-lg' />{' '}
        <span className='font-mono font-[550]'>{name}</span>
      </span>
      {args && Object.keys(args).length > 0 && (
        <div className='rounded-t-3 bg-white/15 px-3 py-0 text-sm last:rounded-b-3'>
          <table>
            <tbody>
              {Object.entries(args).map(([key, value]) => (
                <tr
                  key={key}
                  className='border-b border-white/20 last:border-b-0'
                >
                  <td className='py-2 pr-2 font-semibold text-white/75 align-baseline'>
                    {key}:
                  </td>
                  <td className='py-2 pl-2 font-mono align-baseline w-full'>
                    <pre className='whitespace-pre-wrap'>
                      {typeof value === 'string' ?
                        value
                      : JSON.stringify(value, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderToolResult = (result: any) => (
    <div>
      <span className='sr-only'>Result:</span>
      <pre className='whitespace-pre-wrap rounded-b-3 bg-black/15 px-3 py-2 text-sm'>
        {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );

  if ('state' in toolInvocation) {
    switch (toolInvocation.state) {
      case 'partial-call':
        return (
          <div className='my-2 border-l-4 border-yellow-500 pl-3'>
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            <div className='rounded-b-3 bg-black/15 px-3 py-2 text-sm text-yellow-600'>
              Action in progress...
            </div>
          </div>
        );
      case 'call':
        return (
          <div className='my-2 border-l-4 border-blue-500 pl-3'>
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            <div className='rounded-b-3 bg-black/15 px-3 py-2 text-sm text-blue-600'>
              Waiting for result...
            </div>
          </div>
        );
      case 'result':
        return (
          <div className='my-2 border-l-4 border-green-500 pl-3'>
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            {renderToolResult(toolInvocation.result)}
          </div>
        );
    }
  } else if ('result' in toolInvocation) {
    return (
      <div className='my-2 border-l-4 border-green-500 pl-3'>
        {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
        {renderToolResult(toolInvocation.result)}
      </div>
    );
  } else {
    return (
      <div className='my-2 border-l-4 border-blue-500 pl-3'>
        {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
        <div className='rounded-b-3 bg-black/15 px-3 py-2 text-sm text-blue-600'>
          Waiting for result...
        </div>
      </div>
    );
  }
};
