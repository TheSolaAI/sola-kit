import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext } from '..';
import { ApiClient } from '../apiClient';

interface TokenBalance {
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  symbol?: string;
  name?: string;
  logoURI?: string;
  uiAmount: number;
}

interface HeliusBalanceResponse {
  tokens: TokenBalance[];
  nativeBalance: number;
}

const walletTokenBalanceParams = z.object({
  walletAddress: z
    .string()
    .optional()
    .describe(
      'Solana wallet address to check token balances for. If not provided, uses the connected wallet.'
    ),
  includeNativeBalance: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to include the native SOL balance in the results'),
  minTokenAmount: z
    .number()
    .optional()
    .default(0)
    .describe('Minimum token amount to include in results (filters out dust)'),
});

export const walletTokenBalanceToolFactory = createToolFactory(
  {
    description:
      'Fetches token balances for a Solana wallet using Helius API. Returns a list of tokens owned by the wallet including amounts and metadata.',
    parameters: walletTokenBalanceParams,
  },
  async (params, context: SolaKitToolContext) => {
    try {
      const walletAddress = params.walletAddress || context.walletPublicKey;

      if (!walletAddress) {
        return {
          success: false,
          error: 'No wallet address provided and no wallet connected',
          data: undefined,
        };
      }

      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      const response = await context.apiClient.get<HeliusBalanceResponse>(
        `/api/wallet/token-balances?address=${walletAddress}`,
        undefined,
        'wallet',
        context.authToken
      );

      if (ApiClient.isApiError(response)) {
        return {
          success: false,
          error: `Failed to fetch token balances: ${response.errors[0]?.detail || 'Unknown error'}`,
          data: undefined,
        };
      }

      // Process the tokens, filter by minimum amount if specified
      const tokens = response.data.tokens.filter(
        token => token.uiAmount >= (params.minTokenAmount || 0)
      );

      const result = {
        walletAddress,
        tokens: tokens.map(token => ({
          mint: token.mint,
          symbol: token.symbol || 'Unknown',
          name: token.name || 'Unknown Token',
          amount: token.uiAmount,
          decimals: token.decimals,
          logoURI: token.logoURI,
        })),
      };

      // Add native SOL balance if requested
      if (
        params.includeNativeBalance !== false &&
        response.data.nativeBalance
      ) {
        result.tokens.unshift({
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          amount: response.data.nativeBalance / 1_000_000_000,
          decimals: 9,
          logoURI:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        });
      }

      return {
        success: true,
        data: result,
        error: undefined,
      };
    } catch (error) {
      console.error('Error fetching wallet token balances:', error);
      return {
        success: false,
        error: `Error fetching wallet token balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }
);
