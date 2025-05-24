import { createToolFactory } from '@/tools';
import { SolaKitToolContext } from '../../index';
import {
  GetValidatorsParams,
  GetValidatorsResult,
  stakingSchemas,
} from '../types';
import { validators } from '../data/validators';

export const getValidatorsToolFactory = createToolFactory(
  {
    description:
      'Get available validators for a specific staking type (native or liquid)',
    parameters: stakingSchemas.getValidatorsParams,
  },
  async (
    params: GetValidatorsParams,
    context: SolaKitToolContext
  ): Promise<GetValidatorsResult> => {
    console.log(context);
    try {
      // Filter validators based on the requested type
      const filteredValidators = validators.filter(
        validator => validator.type === params.type
      );

      return stakingSchemas.getValidatorsResult.parse({
        success: true,
        validators: filteredValidators,
      });
    } catch (error) {
      return stakingSchemas.getValidatorsResult.parse({
        success: false,
        validators: [],
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }
);
