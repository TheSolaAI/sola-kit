/**
 * Use this tool context if you are using the SolanaKitToolSet.
 *
 * Check the README.md for more detailed usage instructions.
 */

import { aiProjectsToolSetFactory } from './aiProjectsToolSet';
import { ApiClient } from './apiClient';
import { luloToolSetFactory } from './luloToolSet';
import { nftToolSetFactory } from './nftToolSet';
import { onChainToolSetFactory } from './onChainToolSet';
import { tokenToolSetFactory } from './tokenToolSet';

// Export individual toolset factories for direct imports
export { aiProjectsToolSetFactory } from './aiProjectsToolSet';
export { luloToolSetFactory } from './luloToolSet';
export { nftToolSetFactory } from './nftToolSet';
export { onChainToolSetFactory } from './onChainToolSet';
export { tokenToolSetFactory } from './tokenToolSet';
export { ApiClient } from './apiClient';

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
