'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Send, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { clsx } from 'clsx';

export interface AIKitSettings {
  appendToolSetDefinition: boolean;
  orchestrationMode: {
    enabled: boolean;
    systemPrompt?: string;
    appendToolSetDefinition?: boolean;
  };
  maxRecursionDepth: number;
  showSystemPrompt: boolean;
}

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
  settings: AIKitSettings;
  onSettingsChange: (settings: AIKitSettings) => void;
  systemPrompt?: string;
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
  settings,
  onSettingsChange,
  systemPrompt,
}: ChatUIProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [expandedMessages, setExpandedMessages] = useState<
    Record<string, boolean>
  >({});
  const [showSettings, setShowSettings] = useState(false);

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

  // Render settings panel
  const renderSettingsPanel = () => {
    return (
      <div className="bg-card p-4 rounded-lg mb-4 border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">AIKit Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="text-muted hover:text-white"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="appendToolSetDefinition" className="text-sm">
              Append ToolSet Definition
            </label>
            <input
              type="checkbox"
              id="appendToolSetDefinition"
              checked={settings.appendToolSetDefinition}
              onChange={e =>
                onSettingsChange({
                  ...settings,
                  appendToolSetDefinition: e.target.checked,
                })
              }
              className="h-4 w-4"
            />
          </div>

          {/* Orchestration Mode Section */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="font-medium text-sm mb-3">Orchestration Mode</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="orchestrationModeEnabled" className="text-sm">
                  Enable Orchestration
                </label>
                <input
                  type="checkbox"
                  id="orchestrationModeEnabled"
                  checked={settings.orchestrationMode.enabled}
                  onChange={e =>
                    onSettingsChange({
                      ...settings,
                      orchestrationMode: {
                        ...settings.orchestrationMode,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4"
                />
              </div>

              {settings.orchestrationMode.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="orchestrationAppendToolSetDefinition"
                      className="text-sm"
                    >
                      Append ToolSet Definition in Orchestration
                    </label>
                    <input
                      type="checkbox"
                      id="orchestrationAppendToolSetDefinition"
                      checked={
                        settings.orchestrationMode.appendToolSetDefinition !==
                        false
                      }
                      onChange={e =>
                        onSettingsChange({
                          ...settings,
                          orchestrationMode: {
                            ...settings.orchestrationMode,
                            appendToolSetDefinition: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="orchestrationSystemPrompt"
                      className="text-sm block mb-2"
                    >
                      Orchestration System Prompt
                    </label>
                    <textarea
                      id="orchestrationSystemPrompt"
                      value={settings.orchestrationMode.systemPrompt || ''}
                      onChange={e =>
                        onSettingsChange({
                          ...settings,
                          orchestrationMode: {
                            ...settings.orchestrationMode,
                            systemPrompt: e.target.value,
                          },
                        })
                      }
                      placeholder="Custom system prompt for orchestration"
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-sm font-mono min-h-[80px]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="maxRecursionDepth" className="text-sm">
              Max Recursion Depth
            </label>
            <input
              type="number"
              id="maxRecursionDepth"
              min={1}
              max={10}
              value={settings.maxRecursionDepth}
              onChange={e =>
                onSettingsChange({
                  ...settings,
                  maxRecursionDepth: parseInt(e.target.value) || 3,
                })
              }
              className="bg-secondary p-1 w-16 rounded text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="showSystemPrompt" className="text-sm">
              Show System Prompt
            </label>
            <input
              type="checkbox"
              id="showSystemPrompt"
              checked={settings.showSystemPrompt}
              onChange={e =>
                onSettingsChange({
                  ...settings,
                  showSystemPrompt: e.target.checked,
                })
              }
              className="h-4 w-4"
            />
          </div>
        </div>

        {settings.showSystemPrompt && systemPrompt && (
          <div className="mt-4">
            <div className="text-sm font-medium mb-1">System Prompt:</div>
            <div className="bg-gray-800 p-3 rounded-md text-xs max-h-60 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono">
                {systemPrompt}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="bg-card p-6 rounded-lg max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Welcome to SolaKit Demo</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full bg-secondary hover:bg-gray-700 transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
            </div>

            {showSettings && renderSettingsPanel()}

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
        <>
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-secondary hover:bg-gray-700 transition-colors flex items-center gap-1"
              title="Settings"
            >
              <Settings size={16} />
              <span className="text-xs">Settings</span>
            </button>
          </div>

          {showSettings && renderSettingsPanel()}

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
                          <ChevronUp size={14} className="mr-1" /> Hide tool
                          calls ({countToolCalls(message)})
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
        </>
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
