import { createToolSetFactory } from '@/tools';
import { nativeStakeToolFactory } from './tools/nativeStake';
import { nativeUnstakeToolFactory } from './tools/nativeUnstake';
import { nativeViewStakesToolFactory } from './tools/nativeViewStakes';
import { nativeWithdrawToolFactory } from './tools/nativeWithdraw';
import { nativeStakeStatusToolFactory } from './tools/nativeStakeStatus';
import { nativeGetValidatorsToolFactory } from './tools/nativeGetValidators';
import {
  nativeStakingResultSchema,
  nativeUnstakingResultSchema,
  withdrawalResultSchema,
  withdrawableAmountResultSchema,
  withdrawReadyResultSchema,
  stakeStatusResultSchema,
  validatorListResultSchema,
  stakingSchemas,
  // Import all the schemas (runtime values)
  publicKeySchema,
  amountSchema,
  timestampSchema,
  stakingDetailsSchema,
  stakingResultDataSchema,
  unstakingResultDataSchema,
  stakeStatusDataSchema,
  nativeStakeInfoSchema,
  nativeStakingViewDataSchema,
  nativeStakingViewResultSchema,
  validatorInfoSchema,
} from './types';

// Define the toolset using the factory pattern
export const stakingToolSetFactory = createToolSetFactory(
  {
    slug: 'staking',
    name: 'Staking',
    description: `Tools for staking operations on Solana. Includes native SOL staking balances, staking, unstaking, 
      withdrawal, status, and validator information.`,
  },
  {
    nativeStake: nativeStakeToolFactory,
    nativeUnstake: nativeUnstakeToolFactory,
    nativeViewStakes: nativeViewStakesToolFactory,
    nativeWithdraw: nativeWithdrawToolFactory,
    nativeStakeStatus: nativeStakeStatusToolFactory,
    nativeGetValidators: nativeGetValidatorsToolFactory,
  }
);

// Export only schemas (runtime values), NOT types
export {
  stakingSchemas,
  nativeStakingResultSchema,
  nativeUnstakingResultSchema,
  withdrawalResultSchema,
  withdrawableAmountResultSchema,
  withdrawReadyResultSchema,
  stakeStatusResultSchema,
  validatorListResultSchema,
  // Export all schemas individually
  publicKeySchema,
  amountSchema,
  timestampSchema,
  stakingDetailsSchema,
  stakingResultDataSchema,
  unstakingResultDataSchema,
  stakeStatusDataSchema,
  nativeStakeInfoSchema,
  nativeStakingViewDataSchema,
  nativeStakingViewResultSchema,
  validatorInfoSchema,
};

// Export a convenience object with all result schemas for easy runtime validation
export const stakingResultSchemas = {
  nativeStaking: nativeStakingResultSchema,
  nativeUnstaking: nativeUnstakingResultSchema,
  withdrawal: withdrawalResultSchema,
  withdrawableAmount: withdrawableAmountResultSchema,
  withdrawReady: withdrawReadyResultSchema,
  stakeStatus: stakeStatusResultSchema,
  getValidators: validatorListResultSchema,
} as const;
