import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { API_URLS, SolaKitToolContext } from '..';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { ApiClient } from '../apiClient';

const transferSolParams = z.object({
  quantity: z
    .number()
    .describe(
      'Amount of SOL (Solana) to transfer. This value should be in SOL, not lamports.'
    ),
  address: z.string().describe('Recipient wallet address or a .sol domain.'),
});

export const transferSolToolFactory = createToolFactory(
  {
    description:
      'Transfers SOL (Solana) to a recipient using either a wallet address or a .sol domain. Do not modify or autocorrect .sol domains, as they are arbitrary and may not have meaningful words.',
    parameters: transferSolParams,
  },
  async (params, context: SolaKitToolContext) => {
    const { quantity, address } = params;

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

    try {
      // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = quantity * 1_000_000_000;

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(context.walletPublicKey),
          toPubkey: new PublicKey(address),
          lamports: lamports,
        })
      );

      // Get recent blockhash
      const blockhashResponse = await context.apiClient.get<any>(
        API_URLS.WALLET.BLOCKHASH,
        undefined,
        'wallet',
        context.authToken
      );

      if (ApiClient.isApiError(blockhashResponse)) {
        return {
          success: false,
          error: 'Failed to get recent blockhash',
          data: undefined,
        };
      }

      transaction.recentBlockhash = blockhashResponse.data.blockhash;
      transaction.feePayer = new PublicKey(context.walletPublicKey);

      // Serialize the transaction
      const serializedTransaction = Buffer.from(
        transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
      ).toString('base64');

      return {
        success: true,
        data: {
          transaction: serializedTransaction,
          details: {
            senderAddress: context.walletPublicKey,
            recipientAddress: address,
            amount: quantity,
            lamports: lamports,
            transactionObject: transaction,
          },
        },
        error: undefined,
        signAndSend: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Unable to prepare SOL transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: undefined,
      };
    }
  }
);
