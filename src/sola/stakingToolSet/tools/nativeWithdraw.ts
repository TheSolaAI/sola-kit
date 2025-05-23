import {
  PublicKey,
  StakeProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { WithdrawalResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

const nativeWithdrawParams = z.object({
  stakeAccount: stakingSchemas.publicKey,
});

export const nativeWithdrawToolFactory = createToolFactory(
  {
    description: `Withdraw unstaked SOL from a deactivated stake account. 
        Note: It is recommended to verify or get the native stake account 
        using the **getValidators** tool before using this tool.`,
    parameters: nativeWithdrawParams,
  },
  async (params, context: SolaKitToolContext): Promise<WithdrawalResult> => {
    if (!context.authToken) {
      return stakingSchemas.withdrawalResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
          withdrawnAmount: 0,
        },
        error: 'No auth token provided',
        signAndSend: false,
      });
    }

    if (!context.walletPublicKey) {
      return stakingSchemas.withdrawalResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
          withdrawnAmount: 0,
        },
        error: 'No wallet public key provided',
        signAndSend: false,
      });
    }

    try {
      const walletPubkey = new PublicKey(context.walletPublicKey);
      const stakeAccountPubkey = new PublicKey(params.stakeAccount);

      // Get stake account info from API
      const stakeAccountResponse = await context.apiClient.get<any>(
        `${API_URLS.WALLET.STAKE_ACCOUNT}?address=${stakeAccountPubkey.toBase58()}`,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(stakeAccountResponse)) {
        return stakingSchemas.withdrawalResult.parse({
          success: false,
          data: {
            transaction: '',
            stakeAccount: params.stakeAccount,
            withdrawnAmount: 0,
          },
          error: 'Failed to get stake account info',
          signAndSend: false,
        });
      }

      const lamports = stakeAccountResponse.data.lamports;
      if (lamports === 0) {
        return stakingSchemas.withdrawalResult.parse({
          success: false,
          data: {
            transaction: '',
            stakeAccount: params.stakeAccount,
            withdrawnAmount: 0,
          },
          error: 'No SOL available to withdraw',
          signAndSend: false,
        });
      }

      // Create withdraw instruction
      const withdrawIx = StakeProgram.withdraw({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: walletPubkey,
        toPubkey: walletPubkey,
        lamports,
      });

      // Create transaction
      const transaction = new Transaction().add(withdrawIx);
      transaction.feePayer = walletPubkey;

      // Get recent blockhash from API
      const blockhashResponse = await context.apiClient.get<any>(
        API_URLS.WALLET.BLOCKHASH,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(blockhashResponse)) {
        return stakingSchemas.withdrawalResult.parse({
          success: false,
          data: {
            transaction: '',
            stakeAccount: params.stakeAccount,
            withdrawnAmount: 0,
          },
          error: 'Failed to get recent blockhash',
          signAndSend: false,
        });
      }

      transaction.recentBlockhash = blockhashResponse.data.blockhash;

      // Serialize the transaction
      const serializedTransaction = transaction.serialize().toString('base64');

      return stakingSchemas.withdrawalResult.parse({
        success: true,
        data: {
          transaction: serializedTransaction,
          stakeAccount: params.stakeAccount,
          withdrawnAmount: lamports / LAMPORTS_PER_SOL,
        },
        error: undefined,
        signAndSend: true,
      });
    } catch (error) {
      return stakingSchemas.withdrawalResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: params.stakeAccount,
          withdrawnAmount: 0,
        },
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during withdrawal',
        signAndSend: false,
      });
    }
  }
);
