import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';

// Base schemas for reuse
export const publicKeySchema = z.string().min(32).max(44);
export const amountSchema = z.number().positive();
export const timestampSchema = z.string().datetime();

// Staking details schema
export const stakingDetailsSchema = z.object({
  amount: amountSchema,
  validator: publicKeySchema,
  owner: publicKeySchema,
});

// Staking result data schema
export const stakingResultDataSchema = z.object({
  transaction: z.string().min(1),
  stakeAccount: publicKeySchema,
  details: stakingDetailsSchema,
});

// Native staking result schema
export const nativeStakingResultSchema = z.object({
  success: z.boolean(),
  data: stakingResultDataSchema,
  error: z.string().optional(),
  signAndSend: z.boolean(),
});

// Validator types
export const validatorTypeSchema = z.enum(['native', 'liquid']);
export const validatorInfoSchema = z.object({
  name: z.string(),
  address: z.string(),
  type: validatorTypeSchema,
});

export const getValidatorsParamsSchema = z.object({
  type: validatorTypeSchema,
});

export const getValidatorsResultSchema = z.object({
  success: z.boolean(),
  validators: z.array(validatorInfoSchema),
  error: z.string().optional(),
});

// Withdrawal result schema
export const withdrawalResultSchema = z.object({
  success: z.boolean(),
  data: z.object({
    transaction: z.string().min(1),
    stakeAccount: publicKeySchema,
    withdrawnAmount: amountSchema,
  }),
  error: z.string().optional(),
  signAndSend: z.boolean(),
});

// Withdrawable amount result schema
export const withdrawableAmountResultSchema = z.object({
  success: z.boolean(),
  data: z.object({
    stakeAccount: publicKeySchema,
    withdrawableAmount: amountSchema,
  }),
  error: z.string().optional(),
});

// Withdraw ready result schema
export const withdrawReadyResultSchema = z.object({
  success: z.boolean(),
  data: z.object({
    stakeAccount: publicKeySchema,
    isReady: z.boolean(),
    deactivationEpoch: z.number().nullable(),
  }),
  error: z.string().optional(),
});

// Type exports
export type StakingDetails = z.infer<typeof stakingDetailsSchema>;
export type StakingResultData = z.infer<typeof stakingResultDataSchema>;
export type NativeStakingResult = z.infer<typeof nativeStakingResultSchema>;
export type ValidatorType = z.infer<typeof validatorTypeSchema>;
export type ValidatorInfo = z.infer<typeof validatorInfoSchema>;
export type GetValidatorsParams = z.infer<typeof getValidatorsParamsSchema>;
export type GetValidatorsResult = z.infer<typeof getValidatorsResultSchema>;
export type WithdrawalResult = z.infer<typeof withdrawalResultSchema>;
export type WithdrawableAmountResult = z.infer<
  typeof withdrawableAmountResultSchema
>;
export type WithdrawReadyResult = z.infer<typeof withdrawReadyResultSchema>;

// Legacy types (keeping for backward compatibility)
export interface NativeStakeInfo {
  stakeAccount: PublicKey;
  amount: number;
  validator: PublicKey;
  status: 'active' | 'inactive' | 'pending';
  epoch: number;
}

export interface NativeStakingParams {
  amount: number;
  validatorAddress: PublicKey;
}

export interface NativeUnstakingParams {
  stakeAccount: PublicKey;
}

export interface NativeStakingViewResult {
  stakes: NativeStakeInfo[];
  totalStaked: number;
}

// Export all schemas
export const stakingSchemas = {
  publicKey: publicKeySchema,
  amount: amountSchema,
  timestamp: timestampSchema,
  details: stakingDetailsSchema,
  resultData: stakingResultDataSchema,
  nativeStakingResult: nativeStakingResultSchema,
  validatorType: validatorTypeSchema,
  validatorInfo: validatorInfoSchema,
  getValidatorsParams: getValidatorsParamsSchema,
  getValidatorsResult: getValidatorsResultSchema,
  withdrawalResult: withdrawalResultSchema,
  withdrawableAmountResult: withdrawableAmountResultSchema,
  withdrawReadyResult: withdrawReadyResultSchema,
} as const;
