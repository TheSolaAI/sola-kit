import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import {
  NativeStakingViewResult,
  NativeStakeInfo,
  stakingSchemas,
  nativeStakingViewResultSchema,
} from '../types';
import { ApiClient } from '../../apiClient';

// Define the API response type
const stakeAccountResponseSchema = z.object({
  accounts: z.array(
    z.object({
      pubkey: z.string(),
      lamports: z.number(),
      validator: z.string().nullable(),
      state: z.string(),
      epoch: z.number(),
    })
  ),
});

type StakeAccountResponse = z.infer<typeof stakeAccountResponseSchema>;

const nativeViewStakesParams = z.object({
  wallet: stakingSchemas.publicKey,
});

export const nativeViewStakesToolFactory = createToolFactory(
  {
    description:
      'View active SOL staking details for a given wallet address. Helpful when user wants to check is staking balance.',
    parameters: nativeViewStakesParams,
  },
  async (
    params,
    context: SolaKitToolContext
  ): Promise<NativeStakingViewResult> => {
    if (!context.authToken) {
      return {
        success: false,
        data: {
          stakes: [],
          totalStaked: 0,
        },
        error: 'Authentication token is required',
      };
    }

    try {
      const walletPubkey = new PublicKey(params.wallet);

      // Get stake accounts from API with proper typing
      const response = await context.apiClient.get<StakeAccountResponse>(
        `${API_URLS.WALLET.STAKE_ACCOUNT}?address=${walletPubkey.toBase58()}`,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(response)) {
        console.error('API error:', response.errors);
        return {
          success: false,
          data: {
            stakes: [],
            totalStaked: 0,
          },
          error: 'Failed to fetch stake accounts from API',
        };
      }

      // Validate the response data
      const validatedResponse = stakeAccountResponseSchema.safeParse(
        response.data
      );
      if (!validatedResponse.success) {
        console.error('Invalid API response:', validatedResponse.error);
        return {
          success: false,
          data: {
            stakes: [],
            totalStaked: 0,
          },
          error: 'Invalid response format from API',
        };
      }

      const { accounts } = validatedResponse.data;

      // Transform the data with proper typing
      const stakes: NativeStakeInfo[] = accounts.map(acc => ({
        stakeAccount: acc.pubkey,
        amount: acc.lamports / LAMPORTS_PER_SOL,
        validator: acc.validator || '',
        status: acc.state,
        epoch: acc.epoch,
      }));

      const totalStaked = stakes.reduce(
        (sum: number, stake: NativeStakeInfo) => sum + stake.amount,
        0
      );

      const result: NativeStakingViewResult = {
        success: true,
        data: {
          stakes,
          totalStaked,
        },
      };

      // Validate the final result
      const validatedResult = nativeStakingViewResultSchema.safeParse(result);
      if (!validatedResult.success) {
        console.error('Invalid result structure:', validatedResult.error);
        return {
          success: false,
          data: {
            stakes: [],
            totalStaked: 0,
          },
          error: 'Failed to validate result structure',
        };
      }

      return validatedResult.data;
    } catch (error) {
      console.error('Error fetching stake accounts:', error);
      return {
        success: false,
        data: {
          stakes: [],
          totalStaked: 0,
        },
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);
