import { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from 'ai/react';
import {
  ArrowFatLinesDown,
  ArrowFatLinesUp,
  PaperPlaneTilt,
  Stop,
} from '@phosphor-icons/react';
import { Message } from '../molecules/Message';

declare global {
  interface Window {
    electronAPI: {
      getHttpServerUrl: () => Promise<string | null>;
      onHttpServerStart: (callback: (port: number) => void) => () => void;
    };
  }
}

function Chat() {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const removeListener = window.electronAPI.onHttpServerStart((port) => {
      setServerUrl(`http://localhost:${port}`);
    });

    window.electronAPI.getHttpServerUrl().then((url) => {
      if (url) setServerUrl(url);
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Chat error:', error);
    setError(
      'An error occurred while processing your request. Please try again.'
    );
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    data,
  } = useChat({
    api: serverUrl ? `${serverUrl}/api/chat` : undefined,
    experimental_toolCallStreaming: true,
    onError: handleError,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      attachments: [],
    },
  });

  // Get the latest metadata
  const latestMetadata = data?.[data.length - 1];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!serverUrl) {
    return (
      <div className='flex h-screen items-center justify-center'>
        Loading...
      </div>
    );
  }

  return (
    <div className='flex h-screen w-screen flex-col'>
      {error && (
        <div className='mb-4 rounded-lg border border-current px-4 py-2 text-red-500'>
          {error}
        </div>
      )}

      <div
        ref={chatContainerRef}
        className='flex flex-grow flex-col overflow-auto p-4'
      >
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>

      {latestMetadata && (
        <div className='mx-4 mb-2 flex gap-4 rounded-lg bg-white/10 p-2 text-sm leading-none'>
          {/* <span>totalTokens: {latestMetadata.value.totalTokens}</span> */}
          <div className='flex items-center gap-2'>
            <ArrowFatLinesUp weight='bold' className='text-[1.25em]' />{' '}
            {latestMetadata.value.promptTokens}
          </div>
          <div className='flex items-center gap-2'>
            <ArrowFatLinesDown weight='bold' className='text-[1.25em]' />{' '}
            {latestMetadata.value.completionTokens}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className='mx-4 mb-4 grid gap-2 [grid-template-columns:1fr_min-content]'
      >
        <input
          className='flex-grow rounded-lg border bg-transparent p-2'
          value={input}
          placeholder='Message&hellip;'
          onChange={handleInputChange}
          disabled={isLoading}
        />
        {isLoading ?
          <button
            type='button'
            onClick={stop}
            className='grid aspect-square place-content-center rounded-lg bg-red-500 p-2 text-white'
          >
            <Stop weight='bold' className='text-[1.25em]' />{' '}
            <span className='sr-only'>Stop</span>
          </button>
        : <button
            type='submit'
            className='grid aspect-square place-content-center rounded-lg bg-blue-500 p-2 text-white disabled:bg-blue-300'
            disabled={isLoading}
          >
            <PaperPlaneTilt weight='bold' className='text-[1.25em]' />{' '}
            <span className='sr-only'>Send</span>
          </button>
        }
      </form>
    </div>
  );
}

export default Chat;
