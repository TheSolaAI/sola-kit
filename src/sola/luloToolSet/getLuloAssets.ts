import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext } from '..';
import { AssetsParams, AssetsResponse } from '@/types/lulo.types';
import { ApiClient } from '../apiClient';

const getLuloAssetsParams = z.object({});

export const getLuloAssetsToolFactory = createToolFactory(
  {
    description:
      "Retrieves the user's assets, earnings, deposit, and stats from the Lulo platform. Use when the user wants to view their Lulo holdings.",
    parameters: getLuloAssetsParams,
  },
  async (_params, context: SolaKitToolContext) => {
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

    const assetsParams: AssetsParams = {
      owner: context.walletPublicKey,
    };

    try {
      const assets = await getAssetsLulo(
        assetsParams,
        context.authToken,
        context.apiClient
      );

      if (!assets) {
        return {
          success: false,
          error: 'Failed to retrieve assets from Lulo platform',
          data: undefined,
        };
      }

      return {
        success: true,
        data: {
          type: 'lulo_assets',
          details: {
            depositValue: assets.depositValue,
            interestEarned: assets.interestEarned,
            owner: context.walletPublicKey,
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
        error: 'Unable to retrieve Lulo assets',
        data: undefined,
      };
    }
  }
);

async function getAssetsLulo(
  params: AssetsParams,
  authToken: string,
  apiClient: ApiClient
): Promise<AssetsResponse | null> {
  const response = await apiClient.get<AssetsResponse>(
    `${API_URLS.WALLET.LULO.ASSETS}?owner=${params.owner}`,
    undefined,
    'wallet',
    authToken
  );

  if (ApiClient.isApiError(response)) {
    console.error('Error during getAssetsLulo:', response.errors);
    return null;
  }

  return response.data;
}
