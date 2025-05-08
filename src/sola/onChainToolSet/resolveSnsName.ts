import { z } from 'zod';
import { createToolFactory } from '@/tools';

const resolveSnsNameParams = z.object({
  domain: z
    .string()
    .describe('The .sol domain name to resolve (e.g., "example.sol").'),
});

export const resolveSnsNameToolFactory = createToolFactory(
  {
    description:
      'Resolve a Solana Name Service (SNS) domain (like "example.sol") to a wallet address. Use this when the user provides a .sol domain instead of a wallet address.',
    parameters: resolveSnsNameParams,
  },
  async params => {
    try {
      // Validate domain input
      const domain = params.domain.trim().toLowerCase();

      // Basic client-side validation
      if (!domain.endsWith('.sol') || domain.length < 5) {
        return {
          success: false,
          error: `"${domain}" is not a valid .sol domain name. It should be in the format "name.sol"`,
          data: undefined,
        };
      }

      // Call our server-side API to resolve the domain
      const response = await fetch(
        `/api/wallet/resolve-domain?domain=${encodeURIComponent(domain)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resolve domain');
      }
      const ownerAddress = data.address;

      return {
        success: true,
        data: {
          domain,
          walletAddress: ownerAddress,
          source: 'Solana Name Service',
        },
        error: undefined,
      };
    } catch (error) {
      console.error('Error resolving SNS domain:', error);

      // Handle error
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const isNotFound =
        errorMessage.includes('not found') ||
        errorMessage.includes('not registered');

      return {
        success: false,
        error: isNotFound
          ? `The domain "${params.domain}" does not exist or is not registered.`
          : `Failed to resolve domain: ${errorMessage}`,
        data: undefined,
      };
    }
  }
);
