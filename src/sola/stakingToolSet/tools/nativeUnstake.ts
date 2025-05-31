import { PublicKey, StakeProgram, Transaction } from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { NativeUnstakingStakingResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

// Use the schema from types.ts
const nativeUnstakeParams = z.object({
  stakeAccount: stakingSchemas.publicKey,
});

export const nativeUnstakeToolFactory = createToolFactory(
  {
    description: `Unstake native SOL from a validator. 
                  Call **nativeStakeStatus** tool before using this tool to check
                  if the user positions can be unstaked.`,
    parameters: nativeUnstakeParams,
  },
  async (
    params,
    context: SolaKitToolContext
  ): Promise<NativeUnstakingStakingResult> => {
    if (!context.authToken) {
      return {
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
        },
        error: 'No auth token provided',
        signAndSend: false,
      };
    }

    if (!context.walletPublicKey) {
      return {
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
        },
        error: 'No wallet public key provided',
        signAndSend: false,
      };
    }

    try {
      const walletPubkey = new PublicKey(context.walletPublicKey);
      const stakeAccountPubkey = new PublicKey(params.stakeAccount);

      // Create deactivate instruction
      const deactivateIx = StakeProgram.deactivate({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: walletPubkey,
      });

      // Create transaction
      const transaction = new Transaction().add(deactivateIx);
      transaction.feePayer = walletPubkey;

      // Get recent blockhash from API
      const blockhashResponse = await context.apiClient.get<any>(
        API_URLS.WALLET.BLOCKHASH,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(blockhashResponse)) {
        return {
          success: false,
          data: {
            transaction: '',
            stakeAccount: params.stakeAccount,
          },
          error: 'Failed to get recent blockhash',
          signAndSend: false,
        };
      }

      transaction.recentBlockhash = blockhashResponse.data.blockhash;

      // Serialize the transaction
      const serializedTransaction = transaction
        .serialize({ requireAllSignatures: false })
        .toString('base64');
      console.log(
        'Transaction instructions count:',
        transaction.instructions.length
      );
      console.log('Transaction fee payer:', transaction.feePayer?.toBase58());
      console.log('Transaction recent blockhash:', transaction.recentBlockhash);
      return {
        success: true,
        data: {
          transaction: serializedTransaction,
          stakeAccount: params.stakeAccount,
        },
        error: undefined,
        signAndSend: true,
      };
    } catch (error) {
      return {
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
        },
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during unstaking',
        signAndSend: false,
      };
    }
  }
);
