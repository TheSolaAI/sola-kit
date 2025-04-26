import { trendingAiProjectsToolFactory } from './filterTrendingAiProjectsTool';
import { createToolSetFactory } from '@/tools';

// Define the toolset using the factory pattern
export const aiProjectsToolSetFactory = createToolSetFactory(
  {
    slug: 'aiProjects',
    name: 'AI Projects',
    description:
      'Tools for providing information on the top AI projects and any AI project in general in the Solana Block chain ecosystem',
  },
  {
    trendingAiProjects: trendingAiProjectsToolFactory,
  }
);
