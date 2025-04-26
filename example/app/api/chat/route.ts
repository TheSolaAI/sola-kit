import { PRIME_DIRECTIVE, SOLA_KIT_TOOLS } from '../../../index';
import { ApiClient } from '@/sola/apiClient';
import { SolaKitToolContext } from '@/sola';
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { SolaKit } from '@/index';

export const runtime = 'edge';

// Create API client with proper service URLs from environment variables
const createApiClient = () => {
  return new ApiClient({
    dataServiceUrl: process.env.NEXT_PUBLIC_DATA_SERVICE_URL,
    walletServiceUrl: process.env.NEXT_PUBLIC_WALLET_SERVICE_URL,
    goatIndexServiceUrl: process.env.NEXT_PUBLIC_GOAT_INDEX_SERVICE_URL,
    enableLogging: true,
  });
};

// Create a SolaKit instance with the OpenAI model and toolset factories
const createSolaKit = () => {
  return new SolaKit({
    model: openai(process.env.OPENAI_API_MODEL || 'gpt-4.1'),
    systemPrompt: PRIME_DIRECTIVE,
    toolSetFactories: SOLA_KIT_TOOLS,
  });
};

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { messages, walletAddress } = body;

    // Check for wallet address in headers first, then body, then env vars
    const userWalletPublicKey =
      req.headers.get('X-Wallet-Address') ||
      walletAddress ||
      process.env.WALLET_PUBLIC_KEY ||
      'DEFAULT_PUBLIC_KEY';

    // Create instances for this request (best practice for serverless functions)
    const apiClient = createApiClient();
    const solaKit = createSolaKit();

    // Auth token is still from environment, but in a real app it would be generated
    // based on a signature from the provided wallet address
    const authToken = process.env.AUTH_TOKEN || 'DEFAULT_AUTH_TOKEN';

    // Create a tool context for SolaKit
    const toolContext: SolaKitToolContext = {
      walletPublicKey: userWalletPublicKey,
      authToken,
      apiClient,
    };

    // Configure which tool sets to use (default to all)
    const toolSets = undefined; // undefined means all tool sets will be available

    // Get the latest message from the user
    const latestMessage = messages[messages.length - 1].content;

    // Process previous messages for history context
    const messageHistory = messages.slice(0, -1);

    // Use the new streamText method for better streaming support
    const stream = solaKit.streamText({
      prompt: latestMessage,
      history: messageHistory,
      toolsContext: toolContext,
      toolSets,
    });

    // Return response as a StreamingTextResponse
    return stream.toDataStreamResponse();
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
