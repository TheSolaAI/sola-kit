import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext } from '..';
import { ApiClient } from '../apiClient';
import { LimitOrderParams, LimitOrderResponse } from '@/types/jupiter.types';

const limitOrderParams = z.object({
  action: z.enum(['BUY', 'SELL']),
  amount: z.number(),
  token: z.string(),
  limitPrice: z.number(),
});

export const limitOrderToolFactory = createToolFactory(
  {
    description:
      'Creates a limit order to buy or sell a specified token at a user-defined price in USD. Only use when the user explicitly requests a limit order and not for any other kind of token swap',
    parameters: limitOrderParams,
  },
  async (params, context: SolaKitToolContext) => {
    const { action, amount, token, limitPrice } = params;

    if (!context.authToken) {
      return {
        success: false,
        error: 'No auth token provided',
        data: undefined,
      };
    }

    const input_mint = token.length > 35 ? token : `$${token}`;

    if (!context.walletPublicKey) {
      return {
        success: false,
        error: 'No public key provided',
        data: undefined,
      };
    }

    const params_order: LimitOrderParams = {
      token_mint_a: input_mint,
      token_mint_b: '$USDC',
      public_key: context.walletPublicKey,
      amount,
      limit_price: limitPrice,
      action,
    };

    try {
      const resp = await context.apiClient.post<LimitOrderResponse>(
        API_URLS.WALLET.LIMIT_ORDER.CREATE,
        params_order,
        'wallet',
        context.authToken
      );

      if (ApiClient.isApiError(resp)) {
        return {
          success: false,
          error: 'Failed to create limit order',
          data: undefined,
        };
      }

      if (!resp.data.tx) {
        return {
          success: false,
          error:
            'Unable to place limit order. Make sure you have enough funds.',
          data: undefined,
        };
      }

      return {
        success: true,
        data: {
          type: 'create_limit_order',
          transaction: resp.data.tx,
          details: {
            amount,
            input_mint,
            output_mint: 'USDC',
            limit_price: limitPrice,
            action,
            priority_fee_needed: false,
            params_order,
          },
          response_id: 'temp',
          sender: 'system',
          timestamp: new Date().toISOString(),
        },
        error: undefined,
        signAndSend: true,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Unable to prepare limit order transaction',
        data: undefined,
      };
    }
  }
);
