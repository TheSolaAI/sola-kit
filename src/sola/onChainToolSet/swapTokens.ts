import { z } from 'zod';

import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext } from '..';
import { VersionedTransaction } from '@solana/web3.js';
import { ApiClient } from '../apiClient';
import { SwapParams, SwapResponse } from '@/types/jupiter.types';

const swapTokensParams = z.object({
  inputTokenAddress: z.string().describe('Token Address to swap from'),
  outputTokenAddress: z.string().describe('Token Address to swap to'),
  amount: z
    .number()
    .describe(
      'The amount for the swap. If swapType is EXACT_IN, this is the amount of tokenA. If swapType is EXACT_OUT, this is the amount of tokenB. If swapType is EXACT_DOLLAR, this is the dollar amount to swap. Must be greater than 0.'
    ),
  swapType: z
    .enum(['EXACT_IN', 'EXACT_OUT', 'EXACT_DOLLAR'])
    .optional()
    .default('EXACT_IN')
    .describe(
      'The type of swap: EXACT_IN specifies the amount of tokenA being swapped, EXACT_OUT specifies the amount of tokenB to receive, and EXACT_DOLLAR specifies the dollar amount to be swapped'
    ),
  inputTokenTicker: z.string().describe('Token Ticker to swap from'),
  outputTokenTicker: z.string().describe('Token Ticker to swap to'),
});

export const swapTokensToolFactory = createToolFactory(
  {
    description:
      'Swaps a specified amount of one token for another token using Jupiter. Use this for all token swap operations except limit orders.',
    parameters: swapTokensParams,
  },
  async (params, context: SolaKitToolContext) => {
    const {
      inputTokenAddress,
      outputTokenAddress,
      amount,
      swapType,
      inputTokenTicker,
      outputTokenTicker,
    } = params as any;

    if (!context.authToken) {
      return {
        success: false,
        error: 'No auth token provided',
        data: undefined,
      };
    }

    if (!context.walletPublicKey) {
      return {
        success: false,
        error: 'No public key provided',
        data: undefined,
      };
    }

    const swapParams: SwapParams = {
      input_mint: inputTokenAddress,
      output_mint: outputTokenAddress,
      amount,
      swap_mode: swapType,
      public_key: context.walletPublicKey,
      priority_fee_needed: false,
    };

    try {
      const response = await context.apiClient.post<SwapResponse>(
        API_URLS.WALLET.JUPITER.SWAP,
        swapParams,
        'wallet',
        context.authToken
      );

      if (ApiClient.isApiError(response)) {
        return {
          success: false,
          error: 'Failed to create swap transaction',
          data: undefined,
        };
      }

      if (!response.data.transaction) {
        return {
          success: false,
          error: 'Unable to prepare swap. Make sure you have enough funds.',
          data: undefined,
        };
      }

      try {
        const transactionBuffer = Buffer.from(
          response.data.transaction,
          'base64'
        );
        return {
          success: true,
          data: {
            transactionHash: transactionBuffer,
            details: {
              input_mint: inputTokenAddress,
              output_mint: outputTokenAddress,
              amount,
              outAmount: response.data.outAmount,
              priorityFee: response.data.priorityFee,
              versionedTransaction: transactionBuffer,
              inputParams: swapParams,
              tickers: {
                inputTokenTicker,
                outputTokenTicker,
              },
            },
          },
          error: undefined,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Error processing transaction data',
          data: undefined,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Unable to prepare swap transaction',
        data: undefined,
      };
    }
  }
);
