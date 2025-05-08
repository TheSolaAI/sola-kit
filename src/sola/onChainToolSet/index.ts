import { createToolSetFactory } from '@/tools';
import { resolveSnsNameToolFactory } from './resolveSnsName';
import { swapTokensToolFactory } from './swapTokens';
import { transferSolToolFactory } from './transferSolTx';
import { transferSplToolFactory } from './transferSpl';
import { walletTokenBalanceToolFactory } from './walletTokenBalance';

// Define the toolset using the factory pattern
export const onChainToolSetFactory = createToolSetFactory(
  {
    slug: 'onChain',
    name: 'OnChain',
    description:
      'Tools for on-chain actions. Includes swapping tokens, transferring tokens etc.',
  },
  {
    swapTokens: swapTokensToolFactory,
    transferSol: transferSolToolFactory,
    transferSpl: transferSplToolFactory,
    resolveSnsName: resolveSnsNameToolFactory,
    walletTokenBalance: walletTokenBalanceToolFactory,
  }
);
