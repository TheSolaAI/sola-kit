<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/TheSolaAI/ai-kit">
    <img src="assets/logo.png" alt="Logo" width="150" height="150">
  </a>

  <h3 align="center">AI-Kit</h3>

  <p align="center">
Forge your own intelligent AI agents using the core tools and workflows that power Sola AI.
    <br />
    <a href="#documentation"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/TheSolaAI/ai-kit">View Demo</a>
    &middot;
    <a href="https://github.com/TheSolaAI/ai-kit/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>

  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#basic-usage">Basic Usage</a></li>
        <li><a href="#using-toolsets">Using Toolsets</a></li>
      </ul>
    </li>
    <li>
      <a href="#documentation">Documentation</a>
      <ul>
        <li><a href="#available-toolsets">Available Toolsets</a></li>
        <li><a href="#creating-custom-toolsets">Creating Custom Toolsets</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![AI-Kit][product-screenshot]](https://sola.xyz)

Through the development of Sola AI, our flagship voice assistant on the Solana blockchain, we've pioneered a suite of custom implementations and tooling that intricately weave AI LLM's with the crypto and blockchain landscape. Recognizing the broader utility of these solutions, we are now sharing this library with fellow developers. Our aim is to fuel the Solana AI ecosystem, enabling you to seamlessly integrate the very tools that empower Sola AI within your own innovative projects. This library represents the heart and hard-won efficiencies derived from numerous iterations, ensuring both precision and performance.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [TypeScript](https://www.typescriptlang.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Zod](https://zod.dev/)
- [Axios](https://axios-http.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

AI-Kit is available as an NPM package that can be easily integrated into your TypeScript or JavaScript projects.

### Prerequisites

AI-Kit is designed to work with Node.js projects. It relies on Vercel's AI SDK as a peer dependency, which is automatically installed alongside it.

- Node.js (v16 or higher)
- npm or yarn
- An OpenAI API key (for some toolsets)

### Installation

```bash
# Using npm
npm install @sola-labs/ai-kit

# Using yarn
yarn add @sola-labs/ai-kit

# Using pnpm
pnpm add @sola-labs/ai-kit
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Basic Usage

Below is a minimal example of how to use AI-Kit to create an AI agent:

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
  systemPrompt: 'You are a helpful assistant.',
  toolSetFactories: [], // Empty array for no toolsets initially
});

// Process a user query
async function processQuery(userInput: string) {
  const response = await solaKit.query({
    prompt: userInput,
  });

  console.log(response);
}

// Stream text responses (useful for UI applications)
async function streamResponse(userInput: string) {
  const stream = solaKit.streamText({
    prompt: userInput,
  });

  for await (const chunk of stream) {
    console.log(chunk); // Process each text chunk as it arrives
  }
}
```

### Using Toolsets

AI-Kit comes with several pre-built toolsets that you can use. Here's how to use them:

```typescript
import { SolaKit } from '@sola-labs/ai-kit';
import { OpenAILanguageModel } from '@ai-sdk/openai';
import { tokenToolSetFactory, nftToolSetFactory } from '@sola-labs/ai-kit/sola';

// Initialize the language model
const model = new OpenAILanguageModel({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a SolaKit instance with toolsets
const solaKit = new SolaKit({
  model,
  systemPrompt:
    'You are a helpful assistant with knowledge about Solana tokens and NFTs.',
  toolSetFactories: [tokenToolSetFactory, nftToolSetFactory],
});

// Process a query with specific toolsets
async function processTokenQuery(userInput: string) {
  const response = await solaKit.query({
    prompt: userInput,
    toolSets: ['token'], // Only use the token toolset for this query
    toolsContext: {
      authToken: 'your-auth-token', // Required by some tools
      walletPublicKey: 'your-wallet-public-key',
      apiClient: yourApiClientInstance, // Optional custom API client
    },
  });

  console.log(response);
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DOCUMENTATION -->

## Documentation

### Available Toolsets

AI-Kit includes the following toolsets:

1. **Token Toolset** (`tokenToolSetFactory`)

   - Features: Get token data, resolve token addresses, fetch top holders, get limit orders, etc.
   - Example: `getTokenData` tool returns detailed information about any token on Solana.

2. **NFT Toolset** (`nftToolSetFactory`)

   - Features: Get NFT prices, find trending NFT collections
   - Example: `getTrendingNFTs` tool returns a list of currently popular NFT collections.

3. **Lulo Toolset** (`luloToolSetFactory`)

   - Features: Get Lulo assets, deposit and withdraw from Lulo (a decentralized exchange on Solana)
   - Example: `getLuloAssets` tool returns user's assets and earnings on the Lulo platform.

4. **OnChain Toolset** (`onChainToolSetFactory`)

   - Features: Resolve SNS names, swap tokens, transfer SOL and SPL tokens
   - Example: `transferSolTx` tool allows creating and signing SOL transfer transactions.

5. **AI Projects Toolset** (`aiProjectsToolSetFactory`)
   - Features: Filter and find trending AI projects on Solana
   - Example: `filterTrendingAiProjectsTool` provides information about popular AI-related projects.

### Creating Custom Toolsets

You can create your own toolsets that integrate with AI-Kit:

```typescript
import {
  createToolSetFactory,
  createToolFactory,
} from '@sola-labs/ai-kit/tools';
import { z } from 'zod';

// Define a tool factory
const myCustomToolFactory = createToolFactory(
  {
    description: 'Description of what my custom tool does',
    parameters: z.object({
      param1: z.string().describe('Description of parameter 1'),
      param2: z.number().optional().describe('Optional numeric parameter'),
    }),
  },
  async (params, context) => {
    // Implement your tool logic here
    const result = await someAsyncOperation(params.param1, params.param2);

    return {
      success: true,
      data: result,
      error: undefined,
    };
  }
);

// Create a toolset factory that includes your tool
export const myCustomToolSetFactory = createToolSetFactory(
  {
    slug: 'custom',
    name: 'Custom Tools',
    description: 'A collection of custom tools for specific purposes.',
  },
  {
    myCustomTool: myCustomToolFactory,
  }
);

// Use your custom toolset in SolaKit
const solaKit = new SolaKit({
  model,
  systemPrompt: 'You are a helpful assistant.',
  toolSetFactories: [myCustomToolSetFactory],
});
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Add more documentation and examples
- [ ] Create plugin system for easy extension
- [ ] Improve error handling and debugging
- [ ] Add support for more language models
- [ ] Build a comprehensive test suite
- [ ] Create additional toolsets for DeFi applications

See the [open issues](https://github.com/TheSolaAI/ai-kit/issues) for a list of proposed features and known issues.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more details on our development workflow.

### Top contributors:

<a href="https://github.com/TheSolaAI/ai-kit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=TheSolaAI/ai-kit" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the GPL-3.0 License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Sola AI - [@SolaAI](https://twitter.com/SolaAI)

Project Link: [https://github.com/TheSolaAI/ai-kit](https://github.com/TheSolaAI/ai-kit)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Vercel AI SDK Team](https://github.com/vercel/ai)
- [Solana Foundation](https://solana.com/)
- [OpenAI](https://openai.com/)
- All contributors to this project

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/TheSolaAI/ai-kit.svg?style=for-the-badge
[contributors-url]: https://github.com/TheSolaAI/ai-kit/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/TheSolaAI/ai-kit.svg?style=for-the-badge
[forks-url]: https://github.com/TheSolaAI/ai-kit/network/members
[stars-shield]: https://img.shields.io/github/stars/TheSolaAI/ai-kit.svg?style=for-the-badge
[stars-url]: https://github.com/TheSolaAI/ai-kit/stargazers
[issues-shield]: https://img.shields.io/github/issues/TheSolaAI/ai-kit.svg?style=for-the-badge
[issues-url]: https://github.com/TheSolaAI/ai-kit/issues
[license-shield]: https://img.shields.io/github/license/TheSolaAI/ai-kit.svg?style=for-the-badge
[license-url]: https://github.com/TheSolaAI/ai-kit/blob/master/LICENSE.txt
[product-screenshot]: assets/app-screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
