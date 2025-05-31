import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext } from '..';
import { ApiClient } from '../apiClient';
import { TokenDataResponse } from '@/types/token.types';

const getTokenDataParams = z.object({
  token_address: z
    .string()
    .min(1)
    .max(100)
    .describe(
      'The exact token contract address, symbol, or name. For symbols provide the $ symbol (e.g., $SOL, $JUP, $BONK)'
    ),
});

export const getTokenDataToolFactory = createToolFactory(
  {
    description:
      'Get details such as the price, market cap, liquidity, price change, volume of buy and sell',
    parameters: getTokenDataParams,
  },
  async (params, context: SolaKitToolContext) => {
    const { token_address } = params;

    try {
      // Determine if input is an address or symbol
      const isAddress = token_address.length > 35;
      const url = isAddress
        ? `data/token/address?token_address=${token_address}`
        : `data/token/symbol?symbol=${token_address}`;

      // Fetch token data
      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      const response = await context.apiClient.get<TokenDataResponse>(
        url,
        undefined,
        'data',
        context.authToken
      );

      // Check if response is valid
      if (ApiClient.isApiResponse(response)) {
        return {
          success: true,
          data: response.data,
        };
      }

      // Handle invalid response
      return {
        success: false,
        error: response.errors[0].detail,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch token data',
        data: undefined,
      };
    }
  }
);
