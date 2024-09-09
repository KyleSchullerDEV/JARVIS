import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "ai/react";
import { ToolCall, ToolResult } from "ai";

import { PaperPlaneTilt, Stop } from "@phosphor-icons/react";

import { twMerge } from "tailwind-merge";

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
    console.error("Chat error:", error);
    setError("An error occurred while processing your request. Please try again.");
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, data } = useChat({
    api: serverUrl ? `${serverUrl}/api/chat` : undefined,
    experimental_toolCallStreaming: true,
    onError: handleError,
    headers: {
      "Content-Type": "application/json",
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
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!serverUrl) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <div ref={chatContainerRef} className="flex-grow overflow-auto p-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {messages.map((m) => (
          <MessageComponent key={m.id} message={m} />
        ))}
      </div>

      {latestMetadata && (
        <div className="bg-white/10 mx-4 mb-2 p-2 rounded-md leading-none border-gray-200 text-sm flex gap-2">
          <span>totalTokens: {latestMetadata.value.totalTokens}</span>
          <span>promptTokens: {latestMetadata.value.promptTokens}</span>
          <span>completionTokens: {latestMetadata.value.completionTokens}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-4 mb-4 grid [grid-template-columns:1fr_min-content] gap-2">
        <input className="flex-grow p-2 border rounded bg-transparent" value={input} placeholder="Message&hellip;" onChange={handleInputChange} disabled={isLoading} />
        {isLoading ? (
          <button type="button" onClick={stop} className="p-2 bg-red-500 text-white rounded aspect-square">
            <Stop /> <span className="sr-only">Stop</span>
          </button>
        ) : (
          <button type="submit" className="p-2 bg-blue-500 text-white rounded disabled:bg-blue-300 aspect-square" disabled={isLoading}>
            <PaperPlaneTilt /> <span className="sr-only">Send</span>
          </button>
        )}
      </form>
    </div>
  );
}

function MessageComponent({ message }: { message: any }) {
  return (
    <>
      {message.content && (
        <div className={twMerge("whitespace-pre-wrap mb-4 p-4 bg-blue-600 rounded-lg", message.role === "user" && "bg-slate-600")}>
          <div className="flex justify-between items-start">
            <strong>{message.role === "user" ? "User: " : "JARVIS: "}</strong>
          </div>
          <div className="mt-2">{message.content}</div>
        </div>
      )}
      {message.toolInvocations && message.toolInvocations.length > 0 && (
        <div className="mb-4">
          {message.toolInvocations.map((toolInvocation: ToolCall | ToolResult, index: number) => (
            <ToolInvocationComponent key={index} toolInvocation={toolInvocation} />
          ))}
        </div>
      )}
    </>
  );
}

function ToolInvocationComponent({ toolInvocation }: { toolInvocation: ToolCall | ToolResult }) {
  const renderToolCall = (name: string, args: any) => (
    <div className="mb-2">
      <strong>Action:</strong> {name}
      <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">{JSON.stringify(args, null, 2)}</pre>
    </div>
  );

  const renderToolResult = (result: any) => (
    <div className="mb-2">
      <strong>Result:</strong>
      <pre className="bg-gray-100 p-2 rounded mt-1 text-sm">{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</pre>
    </div>
  );

  if ("state" in toolInvocation) {
    switch (toolInvocation.state) {
      case "partial-call":
        return (
          <div className="border-l-4 pl-5 border-yellow-500 my-2">
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            <div className="text-yellow-600">Action in progress...</div>
          </div>
        );
      case "call":
        return (
          <div className="border-l-4 pl-5 border-blue-500 my-2">
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            <div className="text-blue-600">Waiting for result...</div>
          </div>
        );
      case "result":
        return (
          <div className="border-l-4 pl-5 border-green-500 my-2">
            {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
            {renderToolResult(toolInvocation.result)}
          </div>
        );
    }
  } else if ("result" in toolInvocation) {
    return (
      <div className="border-l-4 pl-5 border-green-500 my-2">
        {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
        {renderToolResult(toolInvocation.result)}
      </div>
    );
  } else {
    return (
      <div className="border-l-4 pl-5 border-blue-500 my-2">
        {renderToolCall(toolInvocation.toolName, toolInvocation.args)}
        <div className="text-blue-600">Waiting for result...</div>
      </div>
    );
  }
}

export default Chat;
