import { createToolFactory } from '@/tools';
import { SolaKitToolContext } from '../../index';
import { ValidatorListResult, validatorListResultSchema } from '../types';
import { validators } from '../data/validators';
import { z } from 'zod';

// Empty parameters schema since no input is needed
const emptyParamsSchema = z.object({});

export const nativeGetValidatorsToolFactory = createToolFactory(
  {
    description:
      'Get a list of available validators for native staking on Solana',
    parameters: emptyParamsSchema,
  },
  async (_, _context: SolaKitToolContext): Promise<ValidatorListResult> => {
    try {
      // The validators data already matches our schema structure
      const result: ValidatorListResult = {
        success: true,
        data: {
          validators,
          totalValidators: validators.length,
        },
      };

      // Validate the result
      const validatedResult = validatorListResultSchema.safeParse(result);
      if (!validatedResult.success) {
        console.error('Invalid result structure:', validatedResult.error);
        return {
          success: false,
          data: {
            validators: [],
            totalValidators: 0,
          },
          error: 'Failed to validate result structure',
        };
      }

      return validatedResult.data;
    } catch (error) {
      console.error('Error fetching validators:', error);
      return {
        success: false,
        data: {
          validators: [],
          totalValidators: 0,
        },
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
);
