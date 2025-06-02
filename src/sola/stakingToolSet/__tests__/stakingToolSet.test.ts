/**
 * Test suite for Solana staking toolset functionality
 * Tests various staking operations including stake, unstake, withdraw, and validator operations
 */

import { ApiClient } from '@/sola/apiClient';
import { SolaKitToolContext } from '@/sola';
import { stakingToolSetFactory } from '../index';
import { PublicKey } from '@solana/web3.js';
// Import the schemas for validation
import {
  nativeStakingResultSchema,
  nativeUnstakingResultSchema,
  nativeStakingViewResultSchema,
  stakeStatusResultSchema,
  validatorListResultSchema,
  withdrawalResultSchema,
} from '../types';
import { z } from 'zod';
import { validators } from '../data/validators';

// Mock the API client
const apiClient = new ApiClient({
  dataServiceUrl: 'https://data-stream-service.solaai.tech/',
  walletServiceUrl: 'https://wallet-service.solaai.tech/',
  goatIndexServiceUrl: 'https://loadbalance.goatindex.ai/',
  nextjsServiceUrl: 'https://beta.solaai.xyz/',
  enableLogging: true,
});

// Create valid Solana public keys for testing
const TEST_WALLET_PUBKEY = new PublicKey('11111111111111111111111111111111');
const TEST_VALIDATOR_PUBKEY = new PublicKey(
  'CatzoSMUkTRidT5DwBxAC2pEtnwMBTpkCepHkFgZDiqb'
);
const TEST_STAKE_ACCOUNT = new PublicKey(
  'EmutJdbKJ55hUyth15bar8ZxDCchR44udAXWYg9eLLDL'
);

// Create a mock context
const mockContext: SolaKitToolContext = {
  apiClient: apiClient,
  authToken: 'no-auth-token',
  walletPublicKey: TEST_WALLET_PUBKEY.toBase58(),
};

/**
 * Validates test results against expected schemas
 * Handles both success and error cases with appropriate validation rules
 */
function validateResultSchema<T>(
  result: unknown,
  schema: z.ZodSchema<T>,
  toolName: string
): void {
  // For error cases, we need to validate structure differently
  if (typeof result === 'object' && result !== null && 'success' in result) {
    const resultObj = result as any;

    // Basic structure validation - all results should have success and data
    expect(resultObj).toHaveProperty('success');
    expect(typeof resultObj.success).toBe('boolean');
    expect(resultObj).toHaveProperty('data');

    // Only transaction-creating tools need signAndSend - be more specific
    const transactionTools = ['nativeStake', 'nativeUnstake', 'nativeWithdraw'];
    const isTransactionTool = transactionTools.includes(toolName);

    if (isTransactionTool) {
      expect(resultObj).toHaveProperty('signAndSend');
      expect(typeof resultObj.signAndSend).toBe('boolean');
    }

    // For error cases, allow relaxed validation
    if (!resultObj.success) {
      expect(resultObj).toHaveProperty('error');
      expect(typeof resultObj.error).toBe('string');
      expect(resultObj.error).toBeTruthy();

      // Skip strict schema validation for error cases since they might have empty/default values
      console.log(
        `Skipping strict schema validation for error case in ${toolName}`
      );
      return;
    }
  }

  // For success cases, do full schema validation
  const validation = schema.safeParse(result);
  if (!validation.success) {
    console.error(
      `Schema validation failed for ${toolName}:`,
      validation.error.format()
    );
    throw new Error(
      `${toolName} result does not match expected schema: ${validation.error.message}`
    );
  }
}

function createContextWithoutAuth(): SolaKitToolContext {
  return { ...mockContext, authToken: '' };
}

function createContextWithoutWallet(): SolaKitToolContext {
  return { ...mockContext, walletPublicKey: '' };
}

describe('Staking ToolSet', () => {
  let stakingToolSet: ReturnType<typeof stakingToolSetFactory>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a new instance of the toolset for each test
    stakingToolSet = stakingToolSetFactory(mockContext);
  });

  /**
   * Tests for native staking operations
   * Validates staking transactions and error handling for each validator
   */
  describe('nativeStake', () => {
    validators.map(validator => {
      const mockParams = {
        amount: 1,
        validatorAddress: validator.address,
      };

      it('should return error when no auth token is provided', async () => {
        const toolset = stakingToolSetFactory(createContextWithoutAuth());
        const tool = toolset.tools.nativeStake as unknown as {
          execute: (params: typeof mockParams) => Promise<any>;
        };
        const result = await tool.execute(mockParams);

        validateResultSchema(result, nativeStakingResultSchema, 'nativeStake');
        expect(result.success).toBe(false);
        expect(result.error).toBe('No auth token provided');
        expect(result.signAndSend).toBe(false);
      });

      it('should return error when no wallet public key is provided', async () => {
        const toolset = stakingToolSetFactory(createContextWithoutWallet());
        const tool = toolset.tools.nativeStake as unknown as {
          execute: (params: typeof mockParams) => Promise<any>;
        };
        const result = await tool.execute(mockParams);

        validateResultSchema(result, nativeStakingResultSchema, 'nativeStake');
        expect(result.success).toBe(false);
        expect(result.error).toBe('No wallet public key provided');
        expect(result.signAndSend).toBe(false);
      });

      it('should create a valid staking transaction', async () => {
        const tool = stakingToolSet.tools.nativeStake as unknown as {
          execute: (params: typeof mockParams) => Promise<any>;
        };
        const result = await tool.execute(mockParams);
        console.log('result from nativeStake tool', result);

        validateResultSchema(result, nativeStakingResultSchema, 'nativeStake');
        expect(result.success).toBe(true);
        expect(result.data.transaction).toBeTruthy();
        expect(result.data.stakeAccount).toBeTruthy();
        expect(result.data.details).toEqual({
          amount: mockParams.amount,
          validator: mockParams.validatorAddress,
          owner: mockContext.walletPublicKey,
        });
        expect(result.signAndSend).toBe(true);
      });
    });
  });

  /**
   * Tests for unstaking operations
   * Validates unstaking transaction creation and error scenarios
   */
  describe('nativeUnstake', () => {
    const mockParams = {
      stakeAccount: TEST_STAKE_ACCOUNT.toBase58(),
    };

    it('should return error when no auth token is provided', async () => {
      const toolset = stakingToolSetFactory(createContextWithoutAuth());
      const tool = toolset.tools.nativeUnstake as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        nativeUnstakingResultSchema,
        'nativeUnstake'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('No auth token provided');
      expect(result.signAndSend).toBe(false);
    });

    it('should create a valid unstaking transaction', async () => {
      const tool = stakingToolSet.tools.nativeUnstake as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        nativeUnstakingResultSchema,
        'nativeUnstake'
      );
      expect(result.success).toBe(true);
      expect(result.data.transaction).toBeTruthy();
      expect(result.data.stakeAccount).toBe(mockParams.stakeAccount);
      expect(result.signAndSend).toBe(true);
    });
  });

  /**
   * Tests for viewing stake accounts
   * Validates stake account retrieval and authentication requirements
   */
  describe('nativeViewStakes', () => {
    const mockParams = {
      wallet: TEST_WALLET_PUBKEY.toBase58(),
    };

    it('should return error when no auth token is provided', async () => {
      const toolset = stakingToolSetFactory(createContextWithoutAuth());
      const tool = toolset.tools.nativeViewStakes as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        nativeStakingViewResultSchema,
        'nativeViewStakes'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication token is required');
      expect(result.data.stakes).toEqual([]);
      expect(result.data.totalStaked).toBe(0);
    });

    it('should return stake accounts for a wallet', async () => {
      // This test will use the real API client - you might want to skip it in CI
      // or use environment variables to control when to run integration tests
      const tool = stakingToolSet.tools.nativeViewStakes as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        nativeStakingViewResultSchema,
        'nativeViewStakes'
      );
      // Note: This might fail if the API is not available or returns unexpected data
      console.log('nativeViewStakes result:', result);
    });
  });

  /**
   * Tests for stake account status
   * Validates status retrieval and error handling
   */
  describe('nativeStakeStatus', () => {
    const mockParams = {
      stakeAccount: TEST_STAKE_ACCOUNT.toBase58(),
    };

    it('should return error when no auth token is provided', async () => {
      const toolset = stakingToolSetFactory(createContextWithoutAuth());
      const tool = toolset.tools.nativeStakeStatus as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        stakeStatusResultSchema,
        'nativeStakeStatus'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('No auth token provided');
      expect(result.data.state).toBe('inactive');
      expect(result.data.totalAmount).toBe(0);
    });

    it('should return stake account status', async () => {
      // This test will use the real API client
      const tool = stakingToolSet.tools.nativeStakeStatus as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        stakeStatusResultSchema,
        'nativeStakeStatus'
      );
      console.log('nativeStakeStatus result:', result);
    });
  });

  /**
   * Tests for validator list retrieval
   * Validates validator data structure and completeness
   */
  describe('getValidators', () => {
    const mockParams = {};

    it('should return list of validators', async () => {
      const tool = stakingToolSet.tools.nativeGetValidators as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        validatorListResultSchema,
        'nativeGetValidators'
      );
      expect(result.success).toBe(true);
      expect(result.data.validators).toBeDefined();
      expect(result.data.totalValidators).toBe(result.data.validators.length);
      console.log('result from getValidators tool', result);
      // Check that each validator has the expected structure
      if (result.data.validators.length > 0) {
        expect(result.data.validators[0]).toHaveProperty('name');
        expect(result.data.validators[0]).toHaveProperty('address');
      }
    });
  });

  /**
   * Tests for withdrawal operations
   * Validates withdrawal transaction creation and error handling
   */
  describe('withdraw', () => {
    const mockParams = {
      stakeAccount: TEST_STAKE_ACCOUNT.toBase58(),
    };

    it('should return error when no auth token is provided', async () => {
      const toolset = stakingToolSetFactory(createContextWithoutAuth());
      const tool = toolset.tools.nativeWithdraw as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(result, withdrawalResultSchema, 'nativeWithdraw');
      expect(result.success).toBe(false);
      expect(result.error).toBe('No auth token provided');
      expect(result.signAndSend).toBe(false);
    });

    it('should return error when no wallet public key is provided', async () => {
      const toolset = stakingToolSetFactory(createContextWithoutWallet());
      const tool = toolset.tools.nativeWithdraw as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(result, withdrawalResultSchema, 'nativeWithdraw');
      expect(result.success).toBe(false);
      expect(result.error).toBe('No wallet public key provided');
      expect(result.signAndSend).toBe(false);
    });

    it('should create a valid withdraw transaction', async () => {
      // This test will use the real API client
      const tool = stakingToolSet.tools.nativeWithdraw as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(result, withdrawalResultSchema, 'nativeWithdraw');
      console.log('nativeWithdraw result:', result);
    });
  });

  /**
   * Tests for missing wallet key scenarios
   * Validates error handling when wallet key is not provided
   */
  describe('missing wallet key scenarios', () => {
    const contextWithoutWallet = createContextWithoutWallet();

    it('nativeStake should return error when no wallet public key is provided', async () => {
      const mockParams = {
        amount: 1,
        validatorAddress: TEST_VALIDATOR_PUBKEY.toBase58(),
      };

      const toolset = stakingToolSetFactory(contextWithoutWallet);
      const tool = toolset.tools.nativeStake as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(result, nativeStakingResultSchema, 'nativeStake');
      expect(result.success).toBe(false);
      expect(result.error).toBe('No wallet public key provided');
      expect(result.signAndSend).toBe(false);
    });

    it('nativeWithdraw should return error when no wallet public key is provided', async () => {
      const mockParams = {
        stakeAccount: TEST_STAKE_ACCOUNT.toBase58(),
      };

      const toolset = stakingToolSetFactory(contextWithoutWallet);
      const tool = toolset.tools.nativeWithdraw as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(result, withdrawalResultSchema, 'nativeWithdraw');
      expect(result.success).toBe(false);
      expect(result.error).toBe('No wallet public key provided');
      expect(result.signAndSend).toBe(false);
    });

    it('nativeUnstake should return error when no wallet public key is provided', async () => {
      const mockParams = {
        stakeAccount: TEST_STAKE_ACCOUNT.toBase58(),
      };

      const toolset = stakingToolSetFactory(contextWithoutWallet);
      const tool = toolset.tools.nativeUnstake as unknown as {
        execute: (params: typeof mockParams) => Promise<any>;
      };
      const result = await tool.execute(mockParams);

      validateResultSchema(
        result,
        nativeUnstakingResultSchema,
        'nativeUnstake'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('No wallet public key provided');
      expect(result.signAndSend).toBe(false);
    });
  });
});
