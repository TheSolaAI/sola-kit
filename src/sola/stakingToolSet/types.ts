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

export const unstakingResultDataSchema = z.object({
  transaction: z.string().min(1),
  stakeAccount: publicKeySchema,
});

// Native staking result schema
export const nativeStakingResultSchema = z.object({
  success: z.boolean(),
  data: stakingResultDataSchema,
  error: z.string().optional(),
  signAndSend: z.boolean(),
});

export const nativeUnstakingResultSchema = z.object({
  success: z.boolean(),
  data: unstakingResultDataSchema,
  error: z.string().optional(),
  signAndSend: z.boolean(),
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

// Stake status result schema
export const stakeStatusDataSchema = z.object({
  stakeAccount: publicKeySchema,
  state: z.enum(['active', 'activating', 'deactivating', 'inactive']),
  totalAmount: amountSchema,
  withdrawableAmount: amountSchema,
  isReadyForWithdrawal: z.boolean(),
  activationEpoch: z.number().nullable(),
  deactivationEpoch: z.number().nullable(),
  currentEpoch: z.number(),
  epochsUntilActive: z.number().optional(),
  epochsUntilInactive: z.number().optional(),
  estimatedTimeUntilActive: z.number().optional(),
  estimatedTimeUntilInactive: z.number().optional(),
  availableActions: z.array(z.string()),
});

export const stakeStatusResultSchema = z.object({
  success: z.boolean(),
  data: stakeStatusDataSchema,
  error: z.string().optional(),
});

// Native stake info schema
export const nativeStakeInfoSchema = z.object({
  stakeAccount: publicKeySchema,
  amount: amountSchema,
  validator: publicKeySchema,
  status: z.string(),
  epoch: z.number(),
});

// Native staking view data schema
export const nativeStakingViewDataSchema = z.object({
  stakes: z.array(nativeStakeInfoSchema),
  totalStaked: amountSchema,
});

// Native staking view result schema
export const nativeStakingViewResultSchema = z.object({
  success: z.boolean(),
  data: nativeStakingViewDataSchema,
  error: z.string().optional(),
});

// Validator info schema
export const validatorInfoSchema = z.object({
  address: publicKeySchema,
  name: z.string(),
});

// Validator list result schema
export const validatorListResultSchema = z.object({
  success: z.boolean(),
  data: z.object({
    validators: z.array(validatorInfoSchema),
    totalValidators: z.number(),
  }),
  error: z.string().optional(),
});

// Type exports
export type StakingResultData = z.infer<typeof stakingResultDataSchema>;
export type NativeStakingResult = z.infer<typeof nativeStakingResultSchema>;
export type NativeUnstakingStakingResult = z.infer<
  typeof nativeUnstakingResultSchema
>;
export type WithdrawalResult = z.infer<typeof withdrawalResultSchema>;
export type WithdrawableAmountResult = z.infer<
  typeof withdrawableAmountResultSchema
>;
export type WithdrawReadyResult = z.infer<typeof withdrawReadyResultSchema>;
export type StakeStatusData = z.infer<typeof stakeStatusDataSchema>;
export type StakeStatusResult = z.infer<typeof stakeStatusResultSchema>;
export type NativeStakeInfo = z.infer<typeof nativeStakeInfoSchema>;
export type NativeStakingViewData = z.infer<typeof nativeStakingViewDataSchema>;
export type NativeStakingViewResult = z.infer<
  typeof nativeStakingViewResultSchema
>;
export type ValidatorInfo = z.infer<typeof validatorInfoSchema>;
export type ValidatorListResult = z.infer<typeof validatorListResultSchema>;

// Export all schemas
export const stakingSchemas = {
  publicKey: publicKeySchema,
  amount: amountSchema,
  timestamp: timestampSchema,
  details: stakingDetailsSchema,
  resultData: stakingResultDataSchema,
  nativeStakingResult: nativeStakingResultSchema,
  withdrawalResult: withdrawalResultSchema,
  withdrawableAmountResult: withdrawableAmountResultSchema,
  withdrawReadyResult: withdrawReadyResultSchema,
  stakeStatusData: stakeStatusDataSchema,
  stakeStatusResult: stakeStatusResultSchema,
  nativeStakingView: nativeStakingViewResultSchema,
  validatorInfo: validatorInfoSchema,
  validatorListResult: validatorListResultSchema,
} as const;
