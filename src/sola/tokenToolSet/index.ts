import { createToolSetFactory } from '@/tools';
import { getTokenDataToolFactory } from './getTokenData';
import { limitOrderToolFactory } from './limitOrder';
import { getLimitOrderToolFactory } from './getLimitOrder';
import { bubblemapToolFactory } from './bubblemaps';
import { tokenAddressToolFactory } from './tokenAddress';
import { topHoldersToolFactory } from './topHolders';

// Define the toolset using the factory pattern
export const tokenToolSetFactory = createToolSetFactory(
  {
    slug: 'token',
    name: 'Crypto Tokens',
    description: `Tools for providing information on crypto tokens inside the Solana 
      Block chain ecosystem (realtime token data, top holders, bubblemaps), for placing limitOrders and getting information
      on placed limitOrders`,
  },
  {
    getTokenData: getTokenDataToolFactory,
    createLimitOrder: limitOrderToolFactory,
    getLimitOrder: getLimitOrderToolFactory,
    bubblemap: bubblemapToolFactory,
    tokenAddress: tokenAddressToolFactory,
    topHolders: topHoldersToolFactory,
  }
);
