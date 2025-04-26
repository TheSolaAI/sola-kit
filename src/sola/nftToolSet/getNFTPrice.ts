import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext } from '..';
import { ApiClient } from '../apiClient';
import { NFTCollection } from '@/types/nft.types';

const getNFTPriceParams = z.object({
  nft_name: z.string(),
});

export const getNFTPriceToolFactory = createToolFactory(
  {
    description:
      'Get floor price, volume, and marketplace data for NFT collections on Solana. Use this function when users ask about NFT prices, collection stats, floor prices, or trading activity for any Solana NFT collection.',
    parameters: getNFTPriceParams,
  },
  async (params, context: SolaKitToolContext) => {
    const { nft_name } = params;

    if (!context.authToken) {
      return {
        success: false,
        error: 'No auth token provided',
        data: undefined,
      };
    }

    try {
      const response = await context.apiClient.get<NFTCollection>(
        `${API_URLS.DATA.NFT.SYMBOL}?nft_symbol=${nft_name.toLowerCase()}`,
        undefined,
        'data',
        context.authToken
      );

      if (ApiClient.isApiError(response)) {
        return {
          success: false,
          error: 'Failed to fetch NFT collection data',
          data: undefined,
        };
      }

      const nftData = response.data;

      return {
        success: true,
        data: {
          type: 'nft_collection_data',
          details: {
            symbol: nftData.symbol,
            floor_price: nftData.floor_price,
            volume_all: nftData.volume_all,
            avg_price_24hr: nftData.avg_price_24hr,
            listed_count: nftData.listed_count,
          },
          response_id: 'temp',
          sender: 'system',
          timestamp: new Date().toISOString(),
        },
        error: undefined,
      };
    } catch (_error) {
      return {
        success: false,
        error: 'Unable to retrieve NFT collection data',
        data: undefined,
      };
    }
  }
);
