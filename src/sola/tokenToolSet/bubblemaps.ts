import { z } from 'zod';
import { createToolFactory } from '@/tools';

const bubblemapParams = z.object({
  token_address: z
    .string()
    .describe(
      'The token address (contract address) to visualize in the Bubblemap. Must be a valid Solana SPL token address.'
    ),
});

export const bubblemapToolFactory = createToolFactory(
  {
    description:
      'Create a Bubblemap visualization for a specific token on the Solana blockchain. Bubblemaps show token ownership distribution, helping identify whale accounts, token concentration, and potential wash trading patterns.',
    parameters: bubblemapParams,
  },
  async params => {
    console.log('Bubblemap tool executed with params:', params);
    try {
      // Validate token address
      if (!params.token_address || params.token_address.trim().length < 32) {
        return {
          success: false,
          error:
            'Please provide a valid Solana token address for the Bubblemap visualization.',
          data: undefined,
        };
      }

      // Clean up the token address (remove any $ prefix if present)
      const tokenAddress = params.token_address.startsWith('$')
        ? params.token_address.substring(1)
        : params.token_address;

      return {
        success: true,
        data: {
          token: tokenAddress,
        },
        error: undefined,
      };
    } catch (error) {
      console.error('Error generating Bubblemap:', error);
      return {
        success: false,
        error:
          'Failed to create Bubblemap visualization. Please check the token address and try again.',
        data: undefined,
      };
    }
  }
);
