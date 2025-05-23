import { createToolSetFactory } from '@/tools';
import { nativeStakeToolFactory } from './tools/nativeStake';
import { nativeUnstakeToolFactory } from './tools/nativeUnstake';
import { nativeViewStakesToolFactory } from './tools/nativeViewStakes';
import { getValidatorsToolFactory } from './tools/getValidators';
import { nativeWithdrawToolFactory } from './tools/nativeWithdraw';
import { nativeCheckWithdrawableToolFactory } from './tools/nativeCheckWithdrawable';
import { nativeCheckWithdrawReadyToolFactory } from './tools/nativeCheckWithdrawReady';

// Define the toolset using the factory pattern
export const stakingToolSetFactory = createToolSetFactory(
  {
    slug: 'staking',
    name: 'Staking',
    description:
      'Tools for staking operations on Solana. Includes native SOL staking, unstaking, withdrawal, and validator information.',
  },
  {
    nativeStake: nativeStakeToolFactory,
    nativeUnstake: nativeUnstakeToolFactory,
    nativeViewStakes: nativeViewStakesToolFactory,
    getValidators: getValidatorsToolFactory,
    nativeWithdraw: nativeWithdrawToolFactory,
    nativeCheckWithdrawable: nativeCheckWithdrawableToolFactory,
    nativeCheckWithdrawReady: nativeCheckWithdrawReadyToolFactory,
  }
);

export * from './types';
export * from './tools/getValidators';
export { validators } from './data/validators';
