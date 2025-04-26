import { API_URLS } from '..';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext } from '..';
import { z } from 'zod';
import { ApiClient } from '../apiClient';
import { ShowLimitOrderResponse } from '@/types/jupiter.types';

const getLimitOrderParams = z.object({});

export const getLimitOrderToolFactory = createToolFactory(
  {
    description: 'Get the active limit orders of the user.',
    parameters: getLimitOrderParams,
  },
  async (_params, context: SolaKitToolContext) => {
    if (!context.walletPublicKey) {
      return {
        success: false,
        error: 'No public key provided',
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

    try {
      const response = await context.apiClient.get<ShowLimitOrderResponse>(
        `${API_URLS.WALLET.LIMIT_ORDER.SHOW}?address=${context.walletPublicKey}`,
        undefined,
        'wallet',
        context.authToken
      );

      if (ApiClient.isApiError(response)) {
        return {
          success: false,
          error: `API error: ${response.errors[0]?.detail || 'Unknown error'}`,
          data: undefined,
        };
      }

      return {
        success: true,
        error: undefined,
        data: response.data,
      };
    } catch (err) {
      return {
        success: false,
        error: `Fetch error: ${String(err)}`,
        data: undefined,
      };
    }
  }
);
