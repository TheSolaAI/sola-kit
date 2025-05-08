import { PRIME_DIRECTIVE, SOLA_KIT_TOOLS } from '../../../index';
import { ApiClient } from '@/sola/apiClient';
import { SolaKitToolContext } from '@/sola';
import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { AIKit } from '@/index';
import { AIKitSettings } from '../../../components/ChatUI';

export const runtime = 'edge';

const google = createGoogleGenerativeAI({
  apiKey: 'AIzaSyDr1-32vvsbjcRWuvdgcXPyJgC7ofF_5vI',
});

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
const createSolaKit = (settings?: AIKitSettings) => {
  return new AIKit({
    model: google('gemini-2.0-flash-lite'),
    systemPrompt: PRIME_DIRECTIVE,
    toolSetFactories: SOLA_KIT_TOOLS,
    // Apply settings from client if provided
    appendToolSetDefinition: settings?.appendToolSetDefinition,
    orchestrationMode: settings?.orchestrationMode
      ? {
          enabled: settings.orchestrationMode.enabled,
          systemPrompt: settings.orchestrationMode.systemPrompt,
          appendToolSetDefinition:
            settings.orchestrationMode.appendToolSetDefinition,
          // Re-use the main model for orchestration by default
          model: google('gemini-2.0-flash-lite'),
        }
      : undefined,
    maxRecursionDepth: settings?.maxRecursionDepth,
  });
};

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { messages, walletAddress, settings } = body;

    // Check for wallet address in headers first, then body, then env vars
    const userWalletPublicKey =
      req.headers.get('X-Wallet-Address') ||
      walletAddress ||
      process.env.WALLET_PUBLIC_KEY ||
      'DEFAULT_PUBLIC_KEY';

    // Create instances for this request (best practice for serverless functions)
    const apiClient = createApiClient();
    const solaKit = createSolaKit(settings);

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

    // Get the actual system prompt that will be used
    let systemPrompt = PRIME_DIRECTIVE;
    if (settings?.appendToolSetDefinition) {
      const toolSetsJson = solaKit.getToolSetsJson();
      systemPrompt = `${systemPrompt}\n\nAvailable toolsets and their tools:\n${toolSetsJson}`;
    }

    // Use the new streamText method for better streaming support
    const stream = await solaKit.streamText({
      prompt: latestMessage,
      history: messageHistory,
      toolsContext: toolContext,
      toolSets,
    });

    // Create a response with appropriate headers if the user wants to see the system prompt
    const response = stream.toDataStreamResponse();

    if (settings?.showSystemPrompt) {
      // Add the system prompt to the response headers
      // Need to use Response constructor to modify headers
      const streamResponse = await Response.fromResponse(response);
      streamResponse.headers.set('X-System-Prompt', systemPrompt);
      return streamResponse;
    }

    return response;
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
