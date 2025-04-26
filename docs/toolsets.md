# Available Toolsets in AI-Kit

AI-Kit comes with several pre-built toolsets for interacting with the Solana blockchain and related services. This document provides an overview of each toolset and its capabilities.

## Using Toolsets

Each toolset follows the same pattern:

1. Import it from `@sola-labs/ai-kit/sola`
2. Create the toolset using its factory function
3. Add it to the `toolSetFactories` array when initializing SolaKit

### Token Toolset

The Token Toolset provides tools for working with Solana tokens.

```typescript
import { tokenToolSetFactory } from '@sola-labs/ai-kit/sola';

// Create the token toolset
const tokenTools = tokenToolSetFactory({
  apiKey: process.env.SOLA_API_KEY, // Optional
});

// Add to SolaKit
const solaKit = new SolaKit({
  model,
  toolSetFactories: [tokenTools],
});
```

#### Available Tools

- `getTokenData` - Get detailed information about a token
- `tokenAddress` - Find the address of a token by symbol or name
- `topHolders` - Get the top holders of a token
- `bubblemaps` - Generate a link to bubblemaps for a token
- `getLimitOrder` - Get current limit orders for a token
- `limitOrder` - Place a limit order for a token

### NFT Toolset

Tools for working with NFTs on Solana.

```typescript
import { nftToolSetFactory } from '@sola-labs/ai-kit/sola';

// Create the NFT toolset
const nftTools = nftToolSetFactory({
  apiKey: process.env.SOLA_API_KEY, // Optional
});

// Add to SolaKit
const solaKit = new SolaKit({
  model,
  toolSetFactories: [nftTools],
});
```

#### Available Tools

- `getTrendingNFTs` - Get a list of currently trending NFT collections
- `getNFTPrice` - Get the current price of an NFT collection

### Lulo Toolset

Tools for interacting with Lulo, a Solana wallet service.

```typescript
import { luloToolSetFactory } from '@sola-labs/ai-kit/sola';

// Create the Lulo toolset
const luloTools = luloToolSetFactory({
  apiKey: process.env.SOLA_API_KEY, // Optional
});

// Add to SolaKit
const solaKit = new SolaKit({
  model,
  toolSetFactories: [luloTools],
});
```

#### Available Tools

- `getLuloAssets` - Get assets in a Lulo wallet
- `depositLulo` - Generate a deposit address for a Lulo wallet
- `withdrawLulo` - Withdraw assets from a Lulo wallet

### On-Chain Toolset

Tools for direct interactions with the Solana blockchain.

```typescript
import { onChainToolSetFactory } from '@sola-labs/ai-kit/sola';

// Create the on-chain toolset
const onChainTools = onChainToolSetFactory({
  apiKey: process.env.SOLA_API_KEY, // Optional
});

// Add to SolaKit
const solaKit = new SolaKit({
  model,
  toolSetFactories: [onChainTools],
});
```

#### Available Tools

- `resolveSnsName` - Resolve a Solana Name Service name to an address
- `transferSolTx` - Create a transaction to transfer SOL
- `transferSpl` - Create a transaction to transfer SPL tokens
- `swapTokens` - Create a transaction to swap tokens via Jupiter

### AI Projects Toolset

Tools for discovering AI projects on Solana.

```typescript
import { aiProjectsToolSetFactory } from '@sola-labs/ai-kit/sola';

// Create the AI projects toolset
const aiProjectsTools = aiProjectsToolSetFactory({
  apiKey: process.env.SOLA_API_KEY, // Optional
});

// Add to SolaKit
const solaKit = new SolaKit({
  model,
  toolSetFactories: [aiProjectsTools],
});
```

#### Available Tools

- `filterTrendingAiProjects` - Get a list of trending AI projects on Solana

## Using Multiple Toolsets

You can combine multiple toolsets:

```typescript
import { SolaKit } from '@sola-labs/ai-kit';
import {
  tokenToolSetFactory,
  nftToolSetFactory,
  onChainToolSetFactory,
  luloToolSetFactory,
  aiProjectsToolSetFactory,
} from '@sola-labs/ai-kit/sola';

// Create all toolsets
const tokenTools = tokenToolSetFactory();
const nftTools = nftToolSetFactory();
const onChainTools = onChainToolSetFactory();
const luloTools = luloToolSetFactory();
const aiProjectsTools = aiProjectsToolSetFactory();

// Add all toolsets to SolaKit
const solaKit = new SolaKit({
  model,
  toolSetFactories: [
    tokenTools,
    nftTools,
    onChainTools,
    luloTools,
    aiProjectsTools,
  ],
});
```

## Selectively Enabling Toolsets

You can enable only specific toolsets for a query:

```typescript
const response = await solaKit.query({
  prompt: "What's the current price of Solana?",
  enabledToolSets: ['token'], // Only use the token toolset for this query
});
```

## Providing Context to Tools

Some tools may require additional context:

```typescript
const response = await solaKit.query({
  prompt: "What's in my wallet?",
  toolContext: {
    userWallet: '8ZLnhM4vVANttRVxbKiFbaitDQSgpSBoHu3SXRKyv1Hz',
  },
});
```

## Further Reading

- Read [Creating Custom Toolsets](./creating-toolsets.md) to learn how to build your own
- Check out [example applications](./examples.md) built with AI-Kit
- Explore [advanced configurations](./configuration.md)
