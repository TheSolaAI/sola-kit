import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { NativeStakingViewResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

const nativeViewStakesParams = z.object({
  wallet: stakingSchemas.publicKey,
});

export const nativeViewStakesToolFactory = createToolFactory(
  {
    description: 'View native SOL staking details for a wallet',
    parameters: nativeViewStakesParams,
  },
  async (
    params,
    context: SolaKitToolContext
  ): Promise<NativeStakingViewResult> => {
    if (!context.authToken) {
      return {
        stakes: [],
        totalStaked: 0,
      };
    }

    try {
      const walletPubkey = new PublicKey(params.wallet);

      // Get stake accounts from API
      const response = await context.apiClient.get<any>(
        `${API_URLS.WALLET.STAKE_ACCOUNTS}?address=${walletPubkey.toBase58()}`,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(response)) {
        return {
          stakes: [],
          totalStaked: 0,
        };
      }

      const accounts = response.data.accounts;
      const stakes = accounts.map((acc: any) => ({
        stakeAccount: new PublicKey(acc.pubkey),
        amount: acc.lamports / LAMPORTS_PER_SOL,
        validator: new PublicKey(acc.validator || ''),
        status: acc.state || 'unknown',
        epoch: acc.epoch || 0,
      }));

      const totalStaked = stakes.reduce(
        (sum: number, stake: any) => sum + stake.amount,
        0
      );

      return {
        stakes,
        totalStaked,
      };
    } catch (error) {
      console.error('Error fetching stake accounts:', error);
      return {
        stakes: [],
        totalStaked: 0,
      };
    }
  }
);
