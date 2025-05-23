import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  StakeProgram,
  Transaction,
} from '@solana/web3.js';
import { z } from 'zod';
import { createToolFactory } from '@/tools';
import { SolaKitToolContext, API_URLS } from '../../index';
import { NativeStakingResult, stakingSchemas } from '../types';
import { ApiClient } from '../../apiClient';

// Use the schema from types.ts
const nativeStakeParams = z.object({
  amount: stakingSchemas.amount,
  validatorAddress: stakingSchemas.publicKey,
});

export const nativeStakeToolFactory = createToolFactory(
  {
    description: `Stake native SOL to a validator. 
        Note: It is recommended to verify or get the native validator address 
        using the **getValidators** tool before using this tool.`,
    parameters: nativeStakeParams,
  },
  async (params, context: SolaKitToolContext): Promise<NativeStakingResult> => {
    if (!context.authToken) {
      return stakingSchemas.nativeStakingResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: '',
          details: {
            amount: params.amount,
            validator: params.validatorAddress,
            owner: context.walletPublicKey || '',
          },
        },
        error: 'No auth token provided',
        signAndSend: false,
      });
    }

    if (!context.walletPublicKey) {
      return stakingSchemas.nativeStakingResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: '',
          details: {
            amount: params.amount,
            validator: params.validatorAddress,
            owner: '',
          },
        },
        error: 'No wallet public key provided',
        signAndSend: false,
      });
    }

    try {
      const walletPubkey = new PublicKey(context.walletPublicKey);
      const validatorPubkey = new PublicKey(params.validatorAddress);

      // Generate a new stake account keypair
      const stakeAccount = Keypair.generate();

      // Get rent exemption from API
      const rentResponse = await context.apiClient.get<any>(
        API_URLS.WALLET.RENT_EXEMPTION,
        { space: StakeProgram.space },
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(rentResponse)) {
        return stakingSchemas.nativeStakingResult.parse({
          success: false,
          data: {
            transaction: '',
            stakeAccount: '',
            details: {
              amount: params.amount,
              validator: params.validatorAddress,
              owner: context.walletPublicKey,
            },
          },
          error: 'Failed to get rent exemption',
          signAndSend: false,
        });
      }

      const rentExemption = rentResponse.data.rentExemption;
      const lamports = rentExemption + params.amount * LAMPORTS_PER_SOL;

      // Create instructions
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: walletPubkey,
        newAccountPubkey: stakeAccount.publicKey,
        lamports,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      });

      const initStakeIx = StakeProgram.initialize({
        stakePubkey: stakeAccount.publicKey,
        authorized: {
          staker: walletPubkey,
          withdrawer: walletPubkey,
        },
      });

      const delegateIx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: walletPubkey,
        votePubkey: validatorPubkey,
      });

      // Create transaction
      const transaction = new Transaction().add(
        createAccountIx,
        initStakeIx,
        delegateIx
      );
      transaction.feePayer = walletPubkey;

      // Get recent blockhash from API
      const blockhashResponse = await context.apiClient.get<any>(
        API_URLS.WALLET.BLOCKHASH,
        undefined,
        'nextjs',
        context.authToken
      );

      if (ApiClient.isApiError(blockhashResponse)) {
        return stakingSchemas.nativeStakingResult.parse({
          success: false,
          data: {
            transaction: '',
            stakeAccount: '',
            details: {
              amount: params.amount,
              validator: params.validatorAddress,
              owner: context.walletPublicKey,
            },
          },
          error: 'Failed to get recent blockhash',
          signAndSend: false,
        });
      }

      transaction.recentBlockhash = blockhashResponse.data.blockhash;

      // Partial sign with stake account (since it's being created)
      transaction.partialSign(stakeAccount);

      // Serialize the transaction
      const serializedTransaction = transaction.serialize().toString('base64');

      return stakingSchemas.nativeStakingResult.parse({
        success: true,
        data: {
          transaction: serializedTransaction,
          stakeAccount: stakeAccount.publicKey.toBase58(),
          details: {
            amount: params.amount,
            validator: params.validatorAddress,
            owner: context.walletPublicKey,
          },
        },
        error: undefined,
        signAndSend: true,
      });
    } catch (error) {
      return stakingSchemas.nativeStakingResult.parse({
        success: false,
        data: {
          transaction: '',
          stakeAccount: '',
          details: {
            amount: params.amount,
            validator: params.validatorAddress,
            owner: context.walletPublicKey || '',
          },
        },
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred during staking',
        signAndSend: false,
      });
    }
  }
);
