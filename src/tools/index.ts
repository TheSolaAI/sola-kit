import {
  BaseToolContext,
  BaseToolResult,
  ToolSet,
  ToolSetDescription,
} from '@/types/tools.types';
import { Tool } from 'ai';
import z from 'zod';

// Re-export types specifically needed for tool creation
export type {
  BaseToolContext,
  BaseToolResult,
  ToolSet,
  ToolSetDescription,
} from '@/types/tools.types';

/**
 * Creates a wrapper around a Tool definition that automatically injects a runtime context
 * when the tool is executed.
 *
 * @template ToolParams - A Zod schema representing the tool's parameters.
 * @template ToolContext - The context type injected into the tool during execution.
 * @template ToolResult - The result type returned by the tool after execution.
 *
 * @param toolDef The tool's static definition (excluding the execute method).
 * @param executeWithContext The execution logic that takes both parameters and context.
 * @returns A function that, when given a context, returns a fully functional Tool object.
 */
export function createToolFactory<
  ToolParams extends z.ZodType,
  ToolContext extends BaseToolContext,
  ToolResult extends BaseToolResult,
>(
  toolDef: Omit<Tool<ToolParams, ToolResult>, 'execute'>,
  executeWithContext: (
    params: z.infer<ToolParams>,
    context: ToolContext
  ) => PromiseLike<ToolResult>
) {
  return (context: ToolContext): Tool<ToolParams, ToolResult> => {
    return {
      ...(toolDef as Tool<ToolParams, ToolResult>),
      execute: (params: z.infer<ToolParams>) =>
        executeWithContext(params, context),
    };
  };
}

/**
 * Creates a factory function that generates a ToolSet with all tools bound to a specific runtime context.
 *
 * @template ToolContext - The context type injected into all tools.
 *
 * @param toolSetDescription A static description of the ToolSet (slug, description, etc).
 * @param toolFactories A record of tool factory functions that require context to instantiate tools.
 * @returns A factory function that, when given a context, returns a complete ToolSet.
 */
export function createToolSetFactory<ToolContext extends BaseToolContext>(
  toolSetDescription: ToolSetDescription,
  toolFactories: Record<string, (context: ToolContext) => Tool<any, any>>
) {
  return (context: ToolContext): ToolSet => {
    const tools: Record<string, Tool<any, any>> = {};
    for (const [toolName, toolFactory] of Object.entries(toolFactories)) {
      tools[toolName] = toolFactory(context);
    }
    return {
      ...toolSetDescription,
      tools,
    };
  };
}
