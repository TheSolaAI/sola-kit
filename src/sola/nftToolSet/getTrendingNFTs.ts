import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext } from '..';
import { ApiClient } from '../apiClient';
import { TrendingNFT } from '@/types/nft.types';

const getTrendingNFTsParams = z.object({});

export const getTrendingNFTsToolFactory = createToolFactory(
  {
    description:
      'Retrieves the currently trending NFT collections on Solana. Use when the user wants to know what NFTs are currently popular or trending.',
    parameters: getTrendingNFTsParams,
  },
  async (_params, context: SolaKitToolContext) => {
    if (!context.authToken) {
      return {
        success: false,
        error: 'No auth token provided',
        data: undefined,
      };
    }

    try {
      const response = await context.apiClient.get<TrendingNFT[]>(
        API_URLS.DATA.NFT.TOP_NFT,
        undefined,
        'data',
        context.authToken
      );

      if (ApiClient.isApiError(response)) {
        return {
          success: false,
          error: 'Failed to fetch trending NFT collections',
          data: undefined,
        };
      }

      const trendingNFTs = response.data;

      return {
        success: true,
        data: {
          type: 'get_trending_nfts',
          details: {
            collections: trendingNFTs.map((nft: TrendingNFT) => ({
              name: nft.name,
              symbol: nft.image,
              floor_price: nft.floor_price,
              volume_24hr: nft.volume_24hr,
            })),
          },
          response_id: 'temp',
          sender: 'system',
          timestamp: new Date().toISOString(),
        },
        error: undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Unable to retrieve trending NFT collections',
        data: undefined,
      };
    }
  }
);
