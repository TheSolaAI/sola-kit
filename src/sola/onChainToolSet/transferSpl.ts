import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext } from '..';
import { Transaction } from '@solana/web3.js';
import { ApiClient } from '../apiClient';

const transferSplParams = z.object({
  amount: z.number().describe('Amount of the token to send.'),
  token: z.string().describe('The token that the user wants to send.'),
  address: z.string().describe('Recipient wallet address or .sol domain.'),
  tokenTicker: z.string().describe('The ticker symbol of the token.'),
});

export const transferSplToolFactory = createToolFactory(
  {
    description:
      'Transfers SPL tokens (non-SOL) to an address or a .sol domain. Do not autocorrect or modify .sol domains, as they are arbitrary and may not have meaningful words.',
    parameters: transferSplParams,
  },
  async (params, context: SolaKitToolContext) => {
    const { amount, token, address, tokenTicker } = params;

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

    const transferParams = {
      senderAddress: context.walletPublicKey,
      recipientAddress: address,
      tokenMint: token,
      amount,
    };

    try {
      const prepareResponse = await context.apiClient.post<any>(
        '/api/wallet/prepareSplTransfer',
        transferParams,
        'wallet',
        context.authToken
      );

      if (ApiClient.isApiError(prepareResponse)) {
        return {
          success: false,
          error: `Failed to prepare SPL transfer`,
          data: undefined,
        };
      }

      if (!prepareResponse.data.serializedTransaction) {
        return {
          success: false,
          error: 'Unable to prepare transfer. Make sure you have enough funds.',
          data: undefined,
        };
      }

      try {
        const transactionBuffer = Buffer.from(
          prepareResponse.data.serializedTransaction,
          'base64'
        );
        const transaction = Transaction.from(transactionBuffer);

        return {
          success: true,
          data: {
            transaction: prepareResponse.data.serializedTransaction,
            details: {
              senderAddress: context.walletPublicKey,
              recipientAddress: address,
              tokenMint: token,
              amount,
              transaction,
              params: transferParams,
              tokenTicker: tokenTicker,
            },
          },
          error: undefined,
          signAndSend: true,
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
        error: `Unable to prepare transfer transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }
);
