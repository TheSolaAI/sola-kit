# Staking ToolSet - Runtime Validation

This document explains how to use the exported schemas for runtime validation of staking tool results in your client applications.

## Available Schemas

The staking toolset exports several schemas that you can use for runtime validation:

### Result Schemas

- `getValidatorsResultSchema` - Validates results from the getValidators tool
- `nativeStakingResultSchema` - Validates results from native staking operations
- `nativeUnstakingResultSchema` - Validates results from native unstaking operations
- `withdrawalResultSchema` - Validates results from withdrawal operations
- `withdrawableAmountResultSchema` - Validates withdrawable amount queries
- `withdrawReadyResultSchema` - Validates withdraw readiness checks
- `stakeStatusResultSchema` - Validates stake status queries

### Convenience Objects

- `stakingSchemas` - Contains all schemas organized by category
- `stakingResultSchemas` - Contains all result schemas for easy access

## Usage Examples

### Basic Import and Usage

```typescript
import {
  stakingResultSchemas,
  GetValidatorsResult,
  NativeStakingResult,
} from '@sola-labs/ai-kit';

// Validate getValidators result
function validateGetValidatorsResult(data: unknown): GetValidatorsResult {
  return stakingResultSchemas.getValidators.parse(data);
}

// Validate native staking result
function validateNativeStakingResult(data: unknown): NativeStakingResult {
  return stakingResultSchemas.nativeStaking.parse(data);
}
```

### Safe Validation with Error Handling

```typescript
import { stakingResultSchemas } from '@sola-labs/ai-kit';

// Safe validation that doesn't throw
function safeValidate<T>(
  data: unknown,
  schemaKey: keyof typeof stakingResultSchemas
) {
  const result = stakingResultSchemas[schemaKey].safeParse(data);

  if (result.success) {
    return { success: true, data: result.data as T };
  } else {
    return { success: false, error: result.error.message };
  }
}

// Usage
const validationResult = safeValidate(toolResult, 'getValidators');
if (validationResult.success) {
  console.log('Valid data:', validationResult.data);
} else {
  console.error('Validation failed:', validationResult.error);
}
```

### Runtime Type Checking in Tool Execution

```typescript
import {
  stakingToolSetFactory,
  stakingResultSchemas,
  SolaKitToolContext,
} from '@sola-labs/ai-kit';

async function executeStakingToolWithValidation(
  context: SolaKitToolContext,
  toolName: string,
  params: any
) {
  // Create the toolset
  const stakingTools = stakingToolSetFactory(context);

  // Execute the tool
  const result = await stakingTools.tools[toolName].execute(params);

  // Validate the result based on tool name
  let validatedResult;
  switch (toolName) {
    case 'getValidators':
      validatedResult = stakingResultSchemas.getValidators.parse(result);
      break;
    case 'nativeStake':
      validatedResult = stakingResultSchemas.nativeStaking.parse(result);
      break;
    case 'nativeUnstake':
      validatedResult = stakingResultSchemas.nativeUnstaking.parse(result);
      break;
    // Add other cases as needed
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }

  return validatedResult;
}
```

### Creating Reusable Validators

```typescript
import { stakingResultSchemas, GetValidatorsResult } from '@sola-labs/ai-kit';

// Create type-safe validator functions
export const validators = {
  getValidators: (data: unknown): GetValidatorsResult =>
    stakingResultSchemas.getValidators.parse(data),

  nativeStaking: (data: unknown): NativeStakingResult =>
    stakingResultSchemas.nativeStaking.parse(data),

  // Add more as needed...
};

// Usage
try {
  const validatedResult = validators.getValidators(someData);
  // Use validatedResult with full type safety
} catch (error) {
  console.error('Validation failed:', error);
}
```

### Integration with Error Boundaries

```typescript
import { stakingResultSchemas } from '@sola-labs/ai-kit';

class StakingResultValidator {
  static validate<K extends keyof typeof stakingResultSchemas>(
    data: unknown,
    schemaKey: K
  ) {
    try {
      return {
        success: true as const,
        data: stakingResultSchemas[schemaKey].parse(data),
      };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Usage in your application
const result = await stakingTool.execute(params);
const validation = StakingResultValidator.validate(result, 'getValidators');

if (validation.success) {
  // TypeScript knows validation.data is the correct type
  console.log('Validators:', validation.data.validators);
} else {
  console.error('Validation error:', validation.error);
}
```

## Benefits of Runtime Validation

1. **Type Safety**: Ensures data conforms to expected structure at runtime
2. **Error Detection**: Catches malformed responses early
3. **Development Aid**: Provides clear error messages when data doesn't match schema
4. **Production Safety**: Prevents runtime errors from unexpected data shapes
5. **API Contract Enforcement**: Ensures tools return data in the expected format

## Schema Structure

All result schemas follow a consistent pattern:

```typescript
{
  success: boolean;
  data?: T;           // Present when success is true
  error?: string;     // Present when success is false
  // Additional fields specific to each tool
}
```

This consistent structure makes it easy to handle results uniformly across all staking tools.
