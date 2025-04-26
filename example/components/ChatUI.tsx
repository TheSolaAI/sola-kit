'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

interface ChatUIProps {
  messages: Message[];
  input: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  walletConnected: boolean;
  walletAddress: string;
  onWalletAddressChange: (address: string) => void;
}

export function ChatUI({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  walletConnected,
  walletAddress,
  onWalletAddressChange,
}: ChatUIProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});

  // Toggle tool calls visibility for a specific message
  const toggleToolCalls = (messageId: string) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, expandedMessages]);

  // Format tool calls for display using the new message structure
  const renderToolCalls = (message: Message) => {
    const toolCalls =
      message.parts?.filter(part => part.type === 'tool-invocation') || [];

    if (toolCalls.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 border-t border-gray-700 pt-3">
        <div className="space-y-3">
          {toolCalls.map((toolCall, idx) => (
            <div key={idx} className="bg-gray-800 rounded-md p-3 text-sm">
              <div className="font-medium text-primary mb-1">
                {toolCall.toolInvocation.toolName || 'Unknown Tool'}
              </div>
              {toolCall.toolInvocation.args && (
                <div>
                  <div className="text-xs text-muted mb-1">Arguments:</div>
                  <pre className="bg-gray-900 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(
                      typeof toolCall.toolInvocation.args === 'string'
                        ? JSON.parse(toolCall.toolInvocation.args)
                        : toolCall.toolInvocation.args,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
              {/* {toolCall.toolInvocation.result && (
                <div className="mt-2">
                  <div className="text-xs text-muted mb-1">Result:</div>
                  <pre className="bg-gray-900 p-2 rounded text-xs overflow-x-auto">
                    {typeof toolCall.toolInvocation.result === 'string'
                      ? toolCall.toolInvocation.result
                      : JSON.stringify(toolCall.toolInvocation.result, null, 2)}
                  </pre>
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper to check if a message has tool calls
  const hasToolCalls = (message: Message) => {
    return (
      message.parts?.some(part => part.type === 'tool-invocation') || false
    );
  };

  // Helper to count tool calls in a message
  const countToolCalls = (message: Message) => {
    return (
      message.parts?.filter(part => part.type === 'tool-invocation').length || 0
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="bg-card p-6 rounded-lg max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Welcome to SolaKit Demo</h2>
            <p className="mb-4 text-muted">
              This is a simple example showcasing the SolaKit library with tool
              calling and message history capabilities.
            </p>

            {walletConnected ? (
              <div className="bg-secondary p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Connected Wallet:</h3>
                <div className="bg-card p-2 rounded border border-gray-700 break-all text-sm font-mono">
                  {walletAddress}
                </div>
              </div>
            ) : (
              <div className="bg-secondary p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Enter your wallet address:</h3>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={e => onWalletAddressChange(e.target.value)}
                  placeholder="Enter Solana wallet address"
                  className="w-full p-2 bg-card border border-gray-700 rounded-md text-sm font-mono"
                />
              </div>
            )}

            <div className="bg-secondary p-4 rounded-md">
              <h3 className="font-medium mb-2">Try asking about:</h3>
              <ul className="list-disc list-inside text-left space-y-1 text-sm text-muted">
                <li>Current price of SOL</li>
                <li>Get data for a specific NFT collection</li>
                <li>Transfer SOL to another wallet</li>
                <li>Get trending AI projects on Solana</li>
              </ul>
            </div>

            {!walletConnected && (
              <div className="mt-4 p-3 border border-amber-700 bg-opacity-20 bg-amber-900 rounded-md text-amber-400 text-sm">
                Note: Connect your wallet to use all features
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.map(message => (
            <div
              key={message.id}
              className={clsx(
                'p-4 rounded-lg',
                message.role === 'user'
                  ? 'bg-secondary ml-8 mr-0'
                  : 'bg-card mr-8 ml-0'
              )}
            >
              <div className="font-medium mb-2 text-sm">
                {message.role === 'user' ? 'You' : 'Sola AI'}
              </div>
              <div className="markdown-content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              {message.role === 'assistant' && hasToolCalls(message) && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleToolCalls(message.id)}
                    className="flex items-center text-xs text-primary hover:text-primary-hover"
                  >
                    {expandedMessages[message.id] ? (
                      <>
                        <ChevronUp size={14} className="mr-1" /> Hide tool calls
                        ({countToolCalls(message)})
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} className="mr-1" /> View tool
                        calls ({countToolCalls(message)})
                      </>
                    )}
                  </button>

                  {expandedMessages[message.id] && renderToolCalls(message)}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-gray-800 pt-4"
      >
        <div className="flex-1 bg-secondary rounded-lg overflow-hidden">
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder={
              walletConnected
                ? 'Ask anything about Solana...'
                : 'Connect wallet for full functionality...'
            }
            className="w-full p-3 bg-transparent focus:outline-none resize-none min-h-[60px]"
            disabled={isLoading || !walletConnected}
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form && input.trim()) {
                  form.dispatchEvent(
                    new Event('submit', { cancelable: true, bubbles: true })
                  );
                }
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim() || !walletConnected}
          className={clsx(
            'p-3 rounded-lg flex items-center justify-center',
            input.trim() && walletConnected
              ? 'bg-primary hover:bg-primary-hover'
              : 'bg-secondary text-muted cursor-not-allowed'
          )}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
