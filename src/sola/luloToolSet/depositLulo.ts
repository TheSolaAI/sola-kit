import { z } from 'zod';
import { VersionedTransaction } from '@solana/web3.js';
import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext, tokenList } from '..';
import { DepositParams, DepositResponse } from '@/types/lulo.types';
import { ApiClient } from '../apiClient';

const depositLuloParams = z.object({
  amount: z.number().positive(),
  token: z.enum(['USDT', 'USDS', 'USDC']),
});

// Create the tool using the factory pattern
export const depositLuloToolFactory = createToolFactory(
  {
    description:
      'Deposits stable coins into Lulo Finance. Only use when the user explicitly requests to deposit stable coins into Lulo.',
    parameters: depositLuloParams,
  },
  async (params, context: SolaKitToolContext) => {
    const { amount, token } = params;

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

    const depositParams: DepositParams = {
      owner: context.walletPublicKey,
      depositAmount: amount,
      mintAddress: tokenList[token].MINT,
    };

    try {
      const transactions = await depositLuloTx(
        depositParams,
        context.authToken,
        context.apiClient
      );

      if (!transactions) {
        return {
          success: false,
          error: 'Deposit failed. Unable to create transaction.',
          data: undefined,
        };
      }
      const txResults = [];

      for (const transaction of transactions) {
        const blockhashRes = await context.apiClient.get<any>(
          API_URLS.WALLET.BLOCKHASH,
          undefined,
          'wallet',
          context.authToken
        );

        if (ApiClient.isApiError(blockhashRes)) {
          return {
            success: false,
            error: 'Failed to get recent blockhash',
            data: undefined,
          };
        }

        const { blockhash } = blockhashRes.data;
        transaction.message.recentBlockhash = blockhash;

        // Since we can't directly sign transactions here, we'll return the transaction for signing
        const serializedTx = Buffer.from(transaction.serialize()).toString(
          'base64'
        );

        txResults.push({
          serializedTransaction: serializedTx,
          token,
          amount,
        });
      }

      return {
        success: true,
        data: {
          type: 'lulo_deposit',
          transactions: txResults,
          details: {
            amount,
            token,
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
        error: 'Unable to prepare deposit transaction',
        data: undefined,
      };
    }
  }
);

// Helper function for creating deposit transactions
async function depositLuloTx(
  params: DepositParams,
  authToken: string,
  apiClient: ApiClient
): Promise<VersionedTransaction[] | null> {
  const response = await apiClient.post<DepositResponse>(
    API_URLS.WALLET.LULO.DEPOSIT,
    params,
    'wallet',
    authToken
  );

  if (ApiClient.isApiError(response)) {
    console.error('Error during deposit:', response.errors);
    return null;
  }

  const deposit_transactions = response.data.transactions[0];

  try {
    const transactions = [];
    for (const i in deposit_transactions) {
      const transaction = deposit_transactions[i].transaction;
      const transactionBuffer = Buffer.from(transaction, 'base64');
      const final_tx = VersionedTransaction.deserialize(transactionBuffer);
      transactions.push(final_tx);
    }
    return transactions;
  } catch (_error) {
    console.error('Error during deposit transaction processing:', _error);
    return null;
  }
}
