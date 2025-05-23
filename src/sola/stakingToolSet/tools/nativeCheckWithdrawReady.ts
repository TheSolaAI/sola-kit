import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { WithdrawReadyResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

const nativeCheckWithdrawReadyParams = z.object({
  stakeAccount: stakingSchemas.publicKey,
});

export const nativeCheckWithdrawReadyToolFactory = createToolFactory(
  {
    description: `Check if a stake account is ready for withdrawal.
                        Note: It is recommended to verify or get the native stake account 
                        using the **getValidators** tool before using this tool.`,
    parameters: nativeCheckWithdrawReadyParams,
  },
  async (params, context: SolaKitToolContext): Promise<WithdrawReadyResult> => {
    if (!context.authToken) {
      return stakingSchemas.withdrawReadyResult.parse({
        success: false,
        data: {
          stakeAccount: params.stakeAccount,
          isReady: false,
          deactivationEpoch: null,
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
        return stakingSchemas.withdrawReadyResult.parse({
          success: false,
          data: {
            stakeAccount: params.stakeAccount,
            isReady: false,
            deactivationEpoch: null,
          },
          error: 'Failed to get stake account info',
        });
      }

      const { state, deactivationEpoch } = stakeAccountResponse.data;

      // A stake account is ready for withdrawal if it's in the "inactive" state
      // and has a deactivation epoch
      const isReady = state === 'inactive' && deactivationEpoch !== null;

      return stakingSchemas.withdrawReadyResult.parse({
        success: true,
        data: {
          stakeAccount: params.stakeAccount,
          isReady,
          deactivationEpoch,
        },
        error: undefined,
      });
    } catch (error) {
      return stakingSchemas.withdrawReadyResult.parse({
        success: false,
        data: {
          stakeAccount: params.stakeAccount,
          isReady: false,
          deactivationEpoch: null,
        },
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred while checking withdrawal readiness',
      });
    }
  }
);
