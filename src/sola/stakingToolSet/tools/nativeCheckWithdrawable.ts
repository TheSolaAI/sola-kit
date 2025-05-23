import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { WithdrawableAmountResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

const nativeCheckWithdrawableParams = z.object({
  stakeAccount: stakingSchemas.publicKey,
});

export const nativeCheckWithdrawableToolFactory = createToolFactory(
  {
    description: `Check the withdrawable amount (in SOL) from the given stake account. 
                        Note: It is recommended to verify or get the native stake account 
                        using the **getValidators** tool before using this tool.`,
    parameters: nativeCheckWithdrawableParams,
  },
  async (
    params,
    context: SolaKitToolContext
  ): Promise<WithdrawableAmountResult> => {
    if (!context.authToken) {
      return stakingSchemas.withdrawableAmountResult.parse({
        success: false,
        data: {
          stakeAccount: params.stakeAccount,
          withdrawableAmount: 0,
        },
        error: 'No auth token provided',
      });
    }

    try {
      const stakeAccountPubkey = new PublicKey(params.stakeAccount);

      // Get stake account info from API
      const stakeAccountResponse = await context.apiClient.get<any>(
        `${API_URLS.WALLET.STAKE_ACCOUNT}?address=${stakeAccountPubkey.toBase58()}`,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(stakeAccountResponse)) {
        return stakingSchemas.withdrawableAmountResult.parse({
          success: false,
          data: {
            stakeAccount: params.stakeAccount,
            withdrawableAmount: 0,
          },
          error: 'Failed to get stake account info',
        });
      }

      const lamports = stakeAccountResponse.data.lamports;

      return stakingSchemas.withdrawableAmountResult.parse({
        success: true,
        data: {
          stakeAccount: params.stakeAccount,
          withdrawableAmount: lamports / LAMPORTS_PER_SOL,
        },
        error: undefined,
      });
    } catch (error) {
      return stakingSchemas.withdrawableAmountResult.parse({
        success: false,
        data: {
          stakeAccount: params.stakeAccount,
          withdrawableAmount: 0,
        },
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred while checking withdrawable amount',
      });
    }
  }
);
