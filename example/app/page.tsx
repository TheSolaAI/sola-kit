'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ChatUI } from '../components/ChatUI';
import Image from 'next/image';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      headers: {
        'X-Wallet-Address': walletAddress,
      },
      body: {
        walletAddress: walletAddress,
      },
    });

  const handleWalletConnection = () => {
    if (walletConnected) {
      // Disconnect wallet
      setWalletConnected(false);
      setWalletAddress('');
    } else {
      // Connect wallet if address is provided
      if (walletAddress.trim()) {
        setWalletConnected(true);
      }
    }
  };

  const handleWalletAddressChange = (address: string) => {
    setWalletAddress(address);
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      <header className="w-full bg-card p-4 flex justify-center border-b border-gray-800">
        <div className="max-w-4xl w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png"
                alt="SolaKit Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-foreground">SolaKit Demo</h1>
          </div>
          <button
            onClick={handleWalletConnection}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              walletConnected
                ? 'bg-green-700 hover:bg-green-800 text-white'
                : 'bg-primary hover:bg-primary-hover text-white'
            }`}
            disabled={!walletConnected && !walletAddress.trim()}
          >
            {walletConnected ? 'Disconnect' : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <div className="w-full max-w-4xl flex-1 p-4">
        <ChatUI
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          walletConnected={walletConnected}
          walletAddress={walletAddress}
          onWalletAddressChange={handleWalletAddressChange}
        />
      </div>

      <footer className="w-full bg-card p-4 border-t border-gray-800 text-center text-sm text-muted">
        <p>Built with SolaKit - The Tools and workflows that power Sola AI</p>
      </footer>
    </main>
  );
}
