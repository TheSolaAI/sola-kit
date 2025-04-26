import { createToolSetFactory } from '@/tools';
import { depositLuloToolFactory } from './depositLulo';
import { getLuloAssetsToolFactory } from './getLuloAssets';
import { withdrawLuloToolFactory } from './withdrawLulo';

// Define the toolset using the factory pattern
export const luloToolSetFactory = createToolSetFactory(
  {
    slug: 'lulo',
    name: 'Lulo',
    description:
      'Tools for providing information on Lulo, a decentralized exchange on Solana. Allows users to get their lulo assets, withdraw and deposit assets. Only used if an user specifies that they want to operate on their Lulo account.',
  },
  {
    depositLulo: depositLuloToolFactory,
    getLuloAssets: getLuloAssetsToolFactory,
    withdrawLulo: withdrawLuloToolFactory,
  }
);
