# Advanced Configuration for AI-Kit

This document covers advanced configuration options for AI-Kit, allowing you to customize its behavior to suit your specific needs.

## Core Configuration Options

When initializing a SolaKit instance, you can provide the following configuration options:

```typescript
import { SolaKit } from '@sola-labs/ai-kit';

const solaKit = new SolaKit({
  // Required: Language model to use
  model: languageModel,

  // Optional: Custom system prompt to guide the assistant's behavior
  systemPrompt: 'You are an expert on Solana blockchain...',

  // Optional: Timeout for AI responses in milliseconds (default: 30000)
  timeout: 60000,

  // Optional: Array of tool set factories to include
  toolSetFactories: [tokenToolSetFactory(), nftToolSetFactory()],

  // Optional: Tool call cost threshold (default: undefined)
  toolCallCostThreshold: 5,
});
```

### Language Model Configuration

AI-Kit requires a language model to function. You can use any model compatible with Vercel's AI SDK.

```typescript
// Using OpenAI
import { OpenAILanguageModel } from '@ai-sdk/openai';

const model = new OpenAILanguageModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4', // Default is 'gpt-3.5-turbo'
});

// Using Anthropic
import { AnthropicLanguageModel } from '@ai-sdk/anthropic';

const model = new AnthropicLanguageModel({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-opus-20240229',
});
```

### Query Options

When making queries with AI-Kit, you can customize the behavior using the following options:

```typescript
const response = await solaKit.query({
  // Required: The prompt to send to the AI
  prompt: 'What is the current price of Solana?',

  // Optional: Conversation history for context
  history: previousMessages,

  // Optional: Override the system prompt for this query
  systemPrompt: 'You are a financial advisor specializing in cryptocurrency...',

  // Optional: Control which tool sets are available for this query
  enabledToolSets: ['token', 'nft'],

  // Optional: Provide additional context for tools
  toolContext: {
    userWallet: '8ZLnhM4vVANttRVxbKiFbaitDQSgpSBoHu3SXRKyv1Hz',
  },
});
```

### Streaming Options

For streaming responses (useful for UIs):

```typescript
const stream = solaKit.streamText({
  prompt: 'Explain how Solana achieves high throughput',
  // Same options available as normal queries
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

## Tool Set Configuration

Tool sets can be configured when you create them:

```typescript
import { tokenToolSetFactory } from '@sola-labs/ai-kit/sola';

const tokenTools = tokenToolSetFactory({
  // Tool-specific configuration
  apiKey: process.env.TOKEN_SERVICE_API_KEY,
  cache: true,
  cacheTime: 60000, // 1 minute
});
```

## API Client Configuration

To configure the underlying API client:

```typescript
import { ApiClient } from '@sola-labs/ai-kit/sola';

// Global configuration
ApiClient.configure({
  defaultHeaders: {
    'X-Custom-Header': 'value',
  },
  baseTimeout: 5000,
  retryConfig: {
    retries: 3,
    backoffFactor: 2,
  },
});
```

## Environment Variables

AI-Kit supports the following environment variables:

```
# Required for OpenAI integration
OPENAI_API_KEY=sk-...

# Required for specific tool sets
SOLA_API_KEY=sola-...

# Optional configuration
SOLA_API_BASE_URL=https://api.sola.ai
SOLA_DEBUG=true
```

## Caching

You can enable caching for tool responses to improve performance and reduce API costs:

```typescript
import { SolaKit } from '@sola-labs/ai-kit';
import { createMemoryCache } from '@sola-labs/ai-kit/cache';

const cache = createMemoryCache({
  ttl: 3600000, // Cache time-to-live in ms (1 hour)
  maxSize: 100, // Maximum number of cache entries
});

const solaKit = new SolaKit({
  model: languageModel,
  cache: cache,
});
```

## Security Best Practices

When using AI-Kit, consider these security practices:

1. Always store API keys in environment variables, not in source code
2. Be careful when using user-provided input directly in prompts
3. Set appropriate rate limits and cost thresholds
4. Validate and sanitize tool outputs before using them in critical operations

## Debugging

To debug issues with AI-Kit:

1. Enable debug logging:

   ```
   SOLA_DEBUG=true
   ```

2. Inspect tool calls and responses:

   ```typescript
   solaKit.on('toolCall', toolCall => {
     console.log('Tool called:', toolCall.name, toolCall.args);
   });

   solaKit.on('toolResponse', response => {
     console.log('Tool response:', response);
   });
   ```

3. Check the model's thought process:
   ```typescript
   solaKit.on('thinking', thoughts => {
     console.log('AI is thinking:', thoughts);
   });
   ```

## Error Handling

```typescript
try {
  const response = await solaKit.query({ prompt: 'What is Solana?' });
  console.log(response);
} catch (error) {
  if (error.code === 'tool_error') {
    console.error('Tool execution failed:', error.toolName, error.message);
  } else if (error.code === 'timeout') {
    console.error('Request timed out after', error.timeoutMs, 'ms');
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Further Reading

- Learn about [available toolsets](./toolsets.md)
- Understand how to [create custom toolsets](./creating-toolsets.md)
- Check out [example applications](./examples.md) built with AI-Kit
