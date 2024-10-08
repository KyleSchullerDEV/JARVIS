import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useChat } from 'ai/react';
import {
  ArrowFatLinesDown,
  ArrowFatLinesUp,
  Coins,
  PaperPlaneTilt,
  Stop,
  Gear,
} from '@phosphor-icons/react';

import Button from '../atoms/Button';
import { Message } from '../molecules/Message';
import { SettingsDialog } from './SettingsDialog';

declare global {
  interface Window {
    electronAPI: {
      getHttpServerUrl: () => Promise<string | null>;
      onHttpServerStart: (callback: (port: number) => void) => () => void;
      getSettings: () => Promise<Settings>;
      updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
    };
  }
}

const modelOptions = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-4o-mini',
] as const;

type Settings = {
  userName: string;
  model: (typeof modelOptions)[number];
  apiKey: string;
  maxToolRoundtrips: number;
  temperature: number;
};

function Chat() {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleError = useCallback((err: Error) => {
    const { error, details } = JSON.parse(err.message);
    setError(`${error}\n${details}`);
  }, []);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    data,
    // reload,
  } = useChat({
    api: serverUrl ? `${serverUrl}/api/chat` : undefined,
    experimental_toolCallStreaming: true,
    onError: handleError,
    headers: {
      'Content-Type': 'application/json',
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
        <pre className='mb-4 whitespace-pre-wrap border border-current px-4 py-2 text-red-500'>
          {error}
        </pre>
      )}

      <div
        ref={chatContainerRef}
        className='flex flex-grow flex-col overflow-auto p-4'
      >
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className='mx-4 mb-4 grid gap-2 [grid-template-columns:min-content_1fr_min-content]'
      >
        <input
          className='col-start-2 row-start-1 flex-grow rounded-3 border border-slate-700 bg-transparent px-4 py-3 hover:border-slate-500 focus:border-slate-50 focus:outline-none'
          value={input}
          placeholder='Message&hellip;'
          onChange={handleInputChange}
          disabled={isLoading}
        />
        {isLoading ?
          <Button
            onClick={stop}
            className='grid aspect-square place-content-center bg-red-500 p-3 text-white'
          >
            <Stop weight='bold' className='text-[1.25em]' />{' '}
            <span className='sr-only'>Stop</span>
          </Button>
        : <Button
            type='submit'
            className='grid aspect-square place-content-center bg-blue-700 p-3 text-white'
            disabled={isLoading}
          >
            <PaperPlaneTilt weight='bold' className='text-[1.25em]' />{' '}
            <span className='sr-only'>Send</span>
          </Button>
        }
        <Button
          onClick={() => setIsSettingsOpen(true)}
          className='col-start-1 row-start-1 grid aspect-square place-content-center bg-slate-700 p-3 text-white'
        >
          <Gear weight='bold' className='text-[1.25em]' />{' '}
          <span className='sr-only'>Settings</span>
        </Button>
      </form>
      {/*
      {latestMetadata ?
        <>
          <div className='flex items-center gap-2'>
            <Coins weight='duotone' className='text-[1.25em]' />{' '}
            {latestMetadata.value.totalTokens}
          </div>
          
          <div className='flex items-center gap-2'>
            <ArrowFatLinesUp weight='bold' className='text-[1.25em]' />{' '}
            {latestMetadata.value.promptTokens}
          </div>
          <div className='flex items-center gap-2'>
            <ArrowFatLinesDown weight='bold' className='text-[1.25em]' />{' '}
            {latestMetadata.value.completionTokens}
          </div>
        </>
      : <div className='flex items-center gap-2'>
          <Coins weight='duotone' className='text-[1.25em]' /> 0
        </div>
      }
      */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default Chat;
