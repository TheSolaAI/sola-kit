import { BaseToolResult } from '@/types/tools.types';
import { z } from 'zod';
import { createToolFactory } from '../../tools';

// Define the parameter schema
const trendingAiProjectsParams = z.object({
  category: z
    .enum(['mindShare', 'ranking'])
    .default('mindShare')
    .describe('The category to fetch the AI Projects by'),
});

// Create the tool using the factory pattern
export const trendingAiProjectsToolFactory = createToolFactory(
  {
    description:
      'Search and filter for various trending AI projects in Solana blockchain based on mindshare or ranking',
    parameters: trendingAiProjectsParams,
  },
  async (params): Promise<BaseToolResult> => {
    try {
      const response = await fetch(
        'https://loadbalance.goatindex.ai/api/agent/overview?dataSource=AI_INDEX'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch AI projects');
      }

      const data = await response.json();

      if (
        params.category === 'mindShare' &&
        data.data.topTokensOrderByMindShareIn6h
      ) {
        return {
          success: true,
          data: {
            category: 'mindShare',
            projects: data.data.topTokensOrderByMindShareIn6h.slice(0, 6),
          },
        };
      } else if (
        params.category === 'ranking' &&
        data.data.topTokensOrderByMindShareIn6h
      ) {
        return {
          success: true,
          data: {
            category: 'ranking',
            projects: data.data.topTokensOrderByMindShareIn6h.slice(0, 6),
          },
        };
      } else {
        throw new Error('No data available for the specified category');
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch AI projects',
      };
    }
  }
);
