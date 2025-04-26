import { z } from 'zod';
import { VersionedTransaction } from '@solana/web3.js';
import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext, tokenList } from '..';
import { WithdrawParams, WithdrawResponse } from '@/types/lulo.types';
import { ApiClient } from '../apiClient';

// Parameters for the withdrawal function
const withdrawLuloParams = z.object({
  amount: z.number().positive(),
  token: z.enum(['USDT', 'USDS', 'USDC']),
});

export const withdrawLuloToolFactory = createToolFactory(
  {
    description:
      'Withdraws stable coins from Lulo Finance. Only use when the user explicitly requests to withdraw stable coins from Lulo. Ensure the user specifies the correct stable coin (USDS or USDC) and an amount.',
    parameters: withdrawLuloParams,
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

    const withdrawParams: WithdrawParams = {
      owner: context.walletPublicKey,
      withdrawAmount: amount,
      mintAddress: tokenList[token].MINT,
      withdrawAll: false,
    };

    try {
      const transactions = await withdrawLuloTx(
        withdrawParams,
        context.authToken,
        context.apiClient
      );

      if (!transactions) {
        return {
          success: false,
          error: 'Withdrawal failed. Unable to create transaction.',
          data: undefined,
        };
      }

      const txResults = [];

      for (const transaction of transactions) {
        // Get recent blockhash
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
          type: 'lulo_withdraw',
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
        error: 'Unable to prepare withdrawal transaction',
        data: undefined,
      };
    }
  }
);

// Helper function for creating withdrawal transactions
async function withdrawLuloTx(
  params: WithdrawParams,
  authToken: string,
  apiClient: ApiClient
): Promise<VersionedTransaction[] | null> {
  const response = await apiClient.post<WithdrawResponse>(
    API_URLS.WALLET.LULO.WITHDRAW,
    params,
    'wallet',
    authToken
  );

  if (ApiClient.isApiError(response)) {
    console.error('Error during withdrawal:', response.errors);
    return null;
  }

  const withdraw_transactions = response.data.transactions[0];

  if (!withdraw_transactions) {
    return null;
  }

  try {
    const transactions = [];
    for (const i in withdraw_transactions) {
      const transaction = withdraw_transactions[i].transaction;
      const transactionBuffer = Buffer.from(transaction, 'base64');
      const final_tx = VersionedTransaction.deserialize(transactionBuffer);
      transactions.push(final_tx);
    }
    return transactions;
  } catch (_error) {
    console.error('Error during withdrawal transaction processing:', _error);
    return null;
  }
}
