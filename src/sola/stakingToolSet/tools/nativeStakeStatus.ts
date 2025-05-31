import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { StakeStatusResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

const nativeStakeStatusParams = z.object({
  stakeAccount: stakingSchemas.publicKey.describe(
    'The stake account to check status and available actions for'
  ),
});

export const nativeStakeStatusToolFactory = createToolFactory(
  {
    description: `Get comprehensive status information about a stake account, including:
                  - Current state (active, activating, deactivating, inactive)
                  - Available amounts for unstaking/withdrawal
                  - Timing information for state changes
                  - Available actions based on current state
                  This tool provides a unified interface for checking stake account status and available actions.`,
    parameters: nativeStakeStatusParams,
  },
  async (params, context: SolaKitToolContext): Promise<StakeStatusResult> => {
    if (!context.authToken) {
      return {
        success: false,
        data: {
          stakeAccount: params.stakeAccount,
          state: 'inactive',
          totalAmount: 0,
          withdrawableAmount: 0,
          isReadyForWithdrawal: false,
          activationEpoch: null,
          deactivationEpoch: null,
          currentEpoch: 0,
          availableActions: [],
        },
        error: 'No auth token provided',
      };
    }

    try {
      // Get stake account info from API
      const stakeAccountResponse = await context.apiClient.get<any>(
        `${API_URLS.WALLET.STAKE_ACCOUNT}/${params.stakeAccount}`,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(stakeAccountResponse)) {
        return {
          success: false,
          data: {
            stakeAccount: params.stakeAccount,
            state: 'inactive',
            totalAmount: 0,
            withdrawableAmount: 0,
            isReadyForWithdrawal: false,
            activationEpoch: null,
            deactivationEpoch: null,
            currentEpoch: 0,
            availableActions: [],
          },
          error: 'Failed to get stake account info',
        };
      }

      const account = stakeAccountResponse.data.data;
      const totalAmount = account.lamports / LAMPORTS_PER_SOL;

      // Determine available actions based on state
      const availableActions: string[] = [];
      let withdrawableAmount = 0;
      let isReadyForWithdrawal = false;

      switch (account.state) {
        case 'active':
          withdrawableAmount = totalAmount;
          availableActions.push('unstake');
          break;
        case 'activating':
          availableActions.push('wait_for_activation');
          break;
        case 'deactivating':
          availableActions.push('wait_for_deactivation');
          break;
        case 'inactive':
          isReadyForWithdrawal = true;
          withdrawableAmount = totalAmount;
          availableActions.push('withdraw');
          break;
      }

      return {
        success: true,
        data: {
          stakeAccount: params.stakeAccount,
          state: account.state,
          totalAmount,
          withdrawableAmount,
          isReadyForWithdrawal,
          activationEpoch: account.activationEpoch,
          deactivationEpoch: account.deactivationEpoch,
          currentEpoch: account.currentEpoch,
          epochsUntilActive: account.epochsUntilActive,
          epochsUntilInactive: account.epochsUntilInactive,
          estimatedTimeUntilActive: account.estimatedTimeUntilActive,
          estimatedTimeUntilInactive: account.estimatedTimeUntilInactive,
          availableActions,
        },
        error: undefined,
      };
    } catch (error) {
      return {
        success: false,
        data: {
          stakeAccount: params.stakeAccount,
          state: 'inactive',
          totalAmount: 0,
          withdrawableAmount: 0,
          isReadyForWithdrawal: false,
          activationEpoch: null,
          deactivationEpoch: null,
          currentEpoch: 0,
          availableActions: [],
        },
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred while checking stake status',
      };
    }
  }
);
