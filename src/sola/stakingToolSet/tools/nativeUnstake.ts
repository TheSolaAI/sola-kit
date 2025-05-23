import { PublicKey, StakeProgram, Transaction } from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { NativeStakingResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

// Use the schema from types.ts
const nativeUnstakeParams = z.object({
  stakeAccount: stakingSchemas.publicKey,
});

export const nativeUnstakeToolFactory = createToolFactory(
  {
    description: `Unstake native SOL from a validator. 
        Note: It is recommended to verify or get the native stake account 
        using the **getValidators** tool before using this tool.`,
    parameters: nativeUnstakeParams,
  },
  async (params, context: SolaKitToolContext): Promise<NativeStakingResult> => {
    if (!context.authToken) {
      return stakingSchemas.nativeStakingResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
          details: {
            amount: 0, // Amount will be determined after deactivation
            validator: '', // Will be determined from stake account
            owner: context.walletPublicKey || '',
          },
        },
        error: 'No auth token provided',
        signAndSend: false,
      });
    }

    if (!context.walletPublicKey) {
      return stakingSchemas.nativeStakingResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
          details: {
            amount: 0,
            validator: '',
            owner: '',
          },
        },
        error: 'No wallet public key provided',
        signAndSend: false,
      });
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
        return stakingSchemas.nativeStakingResult.parse({
          success: false,
          data: {
            transaction: '',
            stakeAccount: params.stakeAccount,
            details: {
              amount: 0,
              validator: '',
              owner: context.walletPublicKey,
            },
          },
          error: 'Failed to get recent blockhash',
          signAndSend: false,
        });
      }

      transaction.recentBlockhash = blockhashResponse.data.blockhash;

      // Serialize the transaction
      const serializedTransaction = transaction.serialize().toString('base64');

      return stakingSchemas.nativeStakingResult.parse({
        success: true,
        data: {
          transaction: serializedTransaction,
          stakeAccount: params.stakeAccount,
          details: {
            amount: 0, // Amount will be determined after deactivation
            validator: '', // Will be determined from stake account
            owner: context.walletPublicKey,
          },
        },
        error: undefined,
        signAndSend: true,
      });
    } catch (error) {
      return stakingSchemas.nativeStakingResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
          details: {
            amount: 0,
            validator: '',
            owner: context.walletPublicKey || '',
          },
        },
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during unstaking',
        signAndSend: false,
      });
    }
  }
);
