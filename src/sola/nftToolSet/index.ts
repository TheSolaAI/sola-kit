import { createToolSetFactory } from '@/tools';
import { getNFTPriceToolFactory } from './getNFTPrice';
import { getTrendingNFTsToolFactory } from './getTrendingNFTs';

// Define the toolset using the factory pattern
export const nftToolSetFactory = createToolSetFactory(
  {
    slug: 'nftAnalyst',
    name: 'NFT Analyst',
    description:
      'Tools for analyzing NFTs, including getting a NFTs data and the trending NFTs.',
  },
  {
    getNFTPrice: getNFTPriceToolFactory,
    getTrendingNFTs: getTrendingNFTsToolFactory,
  }
);
