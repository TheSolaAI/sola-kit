# Getting Started with AI-Kit

This guide will help you get started with AI-Kit, a powerful framework for building AI-powered blockchain tools.

## Installation

AI-Kit is available as an NPM package:

```bash
# Using npm
npm install @sola-labs/ai-kit

# Using yarn
yarn add @sola-labs/ai-kit

# Using pnpm
pnpm add @sola-labs/ai-kit
```

## Basic Setup

Here's a minimal example to set up AI-Kit with an OpenAI language model:

```typescript
import { SolaKit } from '@sola-labs/ai-kit';
import { OpenAILanguageModel } from '@ai-sdk/openai';

// Initialize the language model
const model = new OpenAILanguageModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a new SolaKit instance
const solaKit = new SolaKit({
  model,
  systemPrompt:
    'You are a helpful assistant with specialized knowledge about blockchain and cryptocurrencies, particularly Solana.',
  toolSetFactories: [], // We'll add toolsets later
});
```

## Making Queries

### Basic Query

To make a basic query to your AI assistant:

```typescript
const response = await solaKit.query({
  prompt: "What's the current price of Solana?",
});

console.log(response);
```

### Streaming Responses

For streaming responses (which is great for UI applications):

```typescript
const stream = solaKit.streamText({
  prompt: 'Tell me about Solana blockchain',
});

for await (const chunk of stream) {
  console.log(chunk); // Each chunk of the AI's response as it's generated
}
```

### With Conversation History

To maintain conversation context:

```typescript
import { UIMessage } from 'ai';

// Conversation history
const history: UIMessage[] = [
  { role: 'user', content: 'What is Solana?' },
  {
    role: 'assistant',
    content: 'Solana is a high-performance blockchain platform...',
  },
];

// Make a query with history
const response = await solaKit.query({
  prompt: 'How fast is it?',
  history,
});
```

## Next Steps

Now that you have AI-Kit set up, you can:

1. Learn about [available toolsets](./toolsets.md) that come with AI-Kit
2. Find out how to [create your own toolsets](./creating-toolsets.md)
3. Explore [advanced configurations](./configuration.md)

## Troubleshooting

If you encounter issues:

- Make sure you've provided a valid OpenAI API key
- Check that you have the required dependencies installed
- Ensure your TypeScript configuration is compatible (we recommend TypeScript 4.7+)
