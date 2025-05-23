/**
 * Use this tool context if you are using the SolanaKitToolSet.
 *
 * Check the README.md for more detailed usage instructions.
 */

import { aiProjectsToolSetFactory } from './aiProjectsToolSet';
import { ApiClient, createApiClient } from './apiClient';
import { luloToolSetFactory } from './luloToolSet';
import { nftToolSetFactory } from './nftToolSet';
import { onChainToolSetFactory } from './onChainToolSet';
import { stakingToolSetFactory } from './stakingToolSet';
import { tokenToolSetFactory } from './tokenToolSet';

// Tool Set Exports
export { aiProjectsToolSetFactory } from './aiProjectsToolSet';
export { luloToolSetFactory } from './luloToolSet';
export { nftToolSetFactory } from './nftToolSet';
export { onChainToolSetFactory } from './onChainToolSet';
export { stakingToolSetFactory } from './stakingToolSet';
export { tokenToolSetFactory } from './tokenToolSet';

// API Client Exports
export { ApiClient, createApiClient } from './apiClient';
export type { ApiResponse, ApiError } from '@/types/api.types';

// Re-export the options type for easier access
export type ApiClientOptions = {
  dataServiceUrl?: string;
  walletServiceUrl?: string;
  goatIndexServiceUrl?: string;
  enableLogging?: boolean;
};

/**
 * Example usage:
 *
 * ```typescript
 * import { createApiClient } from '';
 *
 * // Initialize the API client
 * const apiClient = createApiClient({
 *   dataServiceUrl: 'https://api.example.com/data',
 *   walletServiceUrl: 'https://api.example.com/wallet',
 *   goatIndexServiceUrl: 'https://api.example.com/goat-index',
 *   enableLogging: true
 * });
 *
 * // Use in your application context
 * const context = {
 *   tools: {
 *     apiClient,
 *     // ... other tools
 *   }
 * };
 * ```
 */

/**
 * Context type specifically designed for SolanaKit tools.
 *
 * Contains the user's wallet public key and authentication token.
 */
export interface SolaKitToolContext {
  /**
   * The public key of the user's wallet, used for Solana interactions.
   */
  walletPublicKey: string;

  /**
   * An authentication token to authorize operations on behalf of the user.
   */
  authToken: string;

  /**
   * The Sola API client instance for making API calls
   */
  apiClient: ApiClient;
}

/**
 * All Sola Kit toolset factories combined in a single array for convenience
 */
export const SOLA_KIT_TOOLS = [
  aiProjectsToolSetFactory,
  luloToolSetFactory,
  nftToolSetFactory,
  onChainToolSetFactory,
  stakingToolSetFactory,
  tokenToolSetFactory,
];

export const API_URLS = {
  AUTH: {
    SETTINGS: {
      GET: 'auth/settings/',
      UPDATE: 'auth/settings/update/',
      UPDATE_CREDITS: 'auth/settings/charge_credits/',
    },
    WALLET: 'auth/wallet/',
  },
  CHAT_ROOMS: 'chatrooms/',
  SESSION: 'data/session/create',
  DATA: {
    NFT: {
      SYMBOL: 'data/nft/symbol',
      TOP_NFT: 'data/nft/top',
    },
  },
  WALLET: {
    LIMIT_ORDER: {
      CREATE: 'api/wallet/jup/limit-order/create',
      SHOW: 'api/wallet/jup/limit-order/show',
    },
    BLOCKHASH: 'api/wallet/blockhash',
    RENT_EXEMPTION: 'api/wallet/rent-exemption',
    STAKE_ACCOUNT: 'api/wallet/stake-account',
    STAKE_ACCOUNTS: 'api/wallet/stake-accounts',
    LULO: {
      ASSETS: 'api/wallet/lulo/assets',
      DEPOSIT: 'api/wallet/lulo/deposit',
      WITHDRAW: 'api/wallet/lulo/withdraw',
    },
    JUPITER: {
      SWAP: 'api/wallet/jup/swap',
    },
  },
};

export const GOAT_INDEX_API_URL = 'https://loadbalance.goatindex.ai/';

export const tokenList = {
  SOL: {
    MINT: 'So11111111111111111111111111111111111111112',
    DECIMALS: 9,
  },
  USDC: {
    MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    DECIMALS: 6,
  },
  SEND: {
    MINT: 'SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa',
    DECIMALS: 6,
  },
  JUP: {
    MINT: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    DECIMALS: 6,
  },
  USDS: {
    MINT: 'USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA',
    DECIMALS: 6,
  },
  USDT: {
    MINT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    DECIMALS: 6,
  },
  SOLA: {
    MINT: 'B5UsiUYcTD3PcQa8r2uXcVgRmDL8jUYuXPiYjrY7pump',
    DECIMALS: 6,
  },
  BONK: {
    MINT: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    DECIMALS: 6,
  },
  WIF: {
    MINT: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    DECIMALS: 6,
  },
};
