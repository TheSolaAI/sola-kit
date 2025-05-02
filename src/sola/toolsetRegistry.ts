import { tokenToolSetFactory } from './tokenToolSet';
import { nftToolSetFactory } from './nftToolSet';
import { luloToolSetFactory } from './luloToolSet';
import { onChainToolSetFactory } from './onChainToolSet';
import { aiProjectsToolSetFactory } from './aiProjectsToolSet';

export const allToolsetFactories = {
  token: tokenToolSetFactory,
  nftAnalyst: nftToolSetFactory,
  lulo: luloToolSetFactory,
  onChain: onChainToolSetFactory,
  aiProjects: aiProjectsToolSetFactory,
};

export const getToolsetSlugs = (): string[] => {
  return Object.keys(allToolsetFactories);
};
