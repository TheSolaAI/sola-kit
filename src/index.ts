import {
  generateText,
  streamText,
  LanguageModelV1,
  Tool,
  UIMessage,
  generateObject,
} from 'ai';
import { BaseToolContext, ToolSet } from './types/tools.types';
import z from 'zod';
// Re-export types
export * from './types/tools.types';

export const ORCHESTRATION_DEFAULT_SYSTEM_PROMPT = `
Based on the toolsets and their tools provided, determine the best toolset to use for the given prompt.
Only determine the ToolSets based on the tools inside them. Do not determine the individual tools to use.
If you are unsure a toolset is required, include it just in case.

If for a response you do not require a toolset then set needsTools to false, indicating a simple text response will suffice.
The toolsets and their tools are as follows:

`;

const orchestrationResponseSchema = z.object({
  toolSets: z.array(z.string()),
  needsTools: z.boolean(),
});

// Special return value to indicate no tools are needed
const NO_TOOLS_NEEDED = Symbol('NO_TOOLS_NEEDED');
type OrchestrationResult =
  | Record<string, Tool<any, any>>
  | typeof NO_TOOLS_NEEDED;

/**
 * Options to initialize a AIKit instance.
 */
export interface AIKitOptions {
  /**
   * System prompt to be used when initializing the tool picker LLM.
   */
  systemPrompt: string;

  /**
   * List of factories that produce ToolSets when given a context.
   * Each factory should return a ToolSet with tools ready for the provided context.
   */
  toolSetFactories?: Array<(context: any) => ToolSet>;

  /**
   * Language Model instance used for generating responses.
   */
  model: LanguageModelV1;

  /**
   * Whether AiKit should automatically append a JSON definition of the toolSets and their tools to the system prompt.
   * This is useful when your model is having trouble calling multiple tools in successive steps. For even better context
   * include the mayDependOn property in tools that may require many tools to be called before they can be called.
   * Defaults to true if not provided.
   */
  appendToolSetDefinition?: boolean;

  /**
   * Enabled Orchestration mode for the model. In this mode, if no toolset is passed in, the model will first attempt to determine the toolset to use
   * based on the prompt. If a toolset is found, another call is made to the model to then determine the actual tool to use. This mode is the default
   * enabled mode if no toolset is passed in during query or streamText. Disabling this mode when no toolset is passed in will result the model having to
   * choose the toolset and tool in a single call. This is not recommended as it can lead to less accurate results and halucinations.
   */
  orchestrationMode?: {
    enabled: boolean;
    systemPrompt?: string;
    appendToolSetDefinition?: boolean; // Defaults to true if not provided
    model?: LanguageModelV1;
  };
  /**
   * Max recursion depth for tool calls.
   */
  maxRecursionDepth?: number;
}

/**
 * Options for making a query to the AIKit instance.
 */
export interface AIKitQueryOptions<ToolContext> {
  /**
   * The user's input or prompt to process.
   */
  prompt: string;

  /**
   * Optional conversation history (for context or memory purposes).
   */
  history?: UIMessage[];

  /**
   * Optional list of toolset slugs to restrict available tools during the query.
   */
  toolSets?: string[];

  /**
   * Context object passed into toolset factories to customize tool behavior.
   */
  toolsContext?: ToolContext;
}

/**
 * AIKit provides a lightweight, dynamic way to manage toolsets and interact with a language model,
 * injecting runtime context into available tools.
 */
export class AIKit {
  /**
   * AIKit instance configuration options.
   */
  options: AIKitOptions;

  /**
   * Creates a new instance of AIKit.
   *
   * @param options Configuration options for the AIKit instance.
   */
  constructor(options: AIKitOptions) {
    this.options = options;
  }

  /**
   * Prepares the system prompt with toolset definitions if required.
   *
   * @returns The prepared system prompt.
   */
  private prepareSystemPrompt(): string {
    let systemPrompt = this.options.systemPrompt;
    if (this.options.appendToolSetDefinition !== false) {
      const toolSetsJson = this.getToolSetsJson();
      systemPrompt = `${systemPrompt}\n\nAvailable toolsets and their tools:\n${toolSetsJson}`;
    }
    return systemPrompt;
  }

  /**
   * Prepares messages from history and prompt.
   *
   * @param prompt User's prompt
   * @param history Optional message history
   * @returns Array of UIMessages
   */
  private prepareMessages(prompt: string, history?: UIMessage[]): UIMessage[] {
    return history
      ? [...history, { role: 'user', content: prompt } as UIMessage]
      : [{ role: 'user', content: prompt } as UIMessage];
  }

  /**
   * Processes a user query by preparing the correct tools and executing the model interaction.
   *
   * @param options Query options including the prompt, history, toolset selection, and context.
   * @returns A Promise that resolves once the query has been processed.
   */
  async query<ToolContext extends BaseToolContext>(
    options: AIKitQueryOptions<ToolContext>
  ) {
    const systemPrompt = this.prepareSystemPrompt();
    const messages = this.prepareMessages(options.prompt, options.history);

    // Get the tools from the toolsets with context applied
    const tools = await this.getTools(
      options.toolsContext || ({} as ToolContext),
      messages,
      options.toolSets
    );

    // If NO_TOOLS_NEEDED symbol is returned, generate a simple text response without tools
    if (tools === NO_TOOLS_NEEDED) {
      return generateText({
        system: systemPrompt,
        model: this.options.model,
        messages,
        experimental_telemetry: {
          isEnabled: true,
        },
      });
    }

    return generateText({
      system: systemPrompt,
      model: this.options.model,
      toolChoice: 'auto',
      messages,
      tools,
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
    });
  }

  /**
   * Processes a user query by preparing the correct tools and streaming the model's response.
   * This is particularly useful for UI applications that want to show text as it's generated.
   *
   * @param options Query options including the prompt, history, toolset selection, and context.
   * @returns A ReadableStream of text chunks that can be consumed incrementally.
   */
  async streamText<ToolContext extends BaseToolContext>(
    options: AIKitQueryOptions<ToolContext>
  ) {
    const systemPrompt = this.prepareSystemPrompt();
    const messages = this.prepareMessages(options.prompt, options.history);

    // Get the tools from the toolsets with context applied.
    const tools = await this.getTools(
      options.toolsContext || ({} as ToolContext),
      messages,
      options.toolSets
    );

    // If NO_TOOLS_NEEDED symbol is returned, stream a simple text response without tools
    if (tools === NO_TOOLS_NEEDED) {
      return streamText({
        system: systemPrompt,
        model: this.options.model,
        messages,
        experimental_telemetry: {
          isEnabled: true,
        },
      });
    }

    return streamText({
      system: systemPrompt,
      model: this.options.model,
      toolChoice: 'auto',
      messages,
      tools,
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
    });
  }

  /**
   * Creates all available ToolSets by injecting the given context into each toolset factory.
   *
   * @param context The runtime context to inject into toolsets.
   * @returns An array of ToolSets with context applied.
   * @throws If no toolset factories are defined.
   */
  createToolSets<ToolContext extends BaseToolContext>(
    context: ToolContext
  ): ToolSet[] {
    if (
      !this.options.toolSetFactories ||
      this.options.toolSetFactories.length === 0
    ) {
      throw new Error(
        'There are no toolset factories defined. Define toolset factories in the constructor of AIKit'
      );
    }

    return this.options.toolSetFactories.map(toolSetFactory =>
      toolSetFactory(context)
    );
  }

  /**
   * Retrieves tools from the available toolsets based on context and optional toolset restrictions.
   *
   * @param context The runtime context to inject into toolsets.
   * @param messages The conversation messages to consider.
   * @param toolSetSlugs Optional list of toolset slugs to restrict available tools.
   * @returns Either a record of tools, or the NO_TOOLS_NEEDED symbol if orchestration determined no tools are required.
   */
  async getTools<ToolContext extends BaseToolContext>(
    context: ToolContext,
    messages: UIMessage[],
    toolSetSlugs?: string[]
  ): Promise<Record<string, Tool<any, any>> | typeof NO_TOOLS_NEEDED> {
    if (toolSetSlugs === undefined && this.options.orchestrationMode?.enabled) {
      return await this.getOrchestratedTools(context, messages);
    }
    // Standard non-orchestration flow
    const allToolSets = this.createToolSets(context);
    const filteredToolSets = this.filterToolSets(allToolSets, toolSetSlugs);

    if (
      toolSetSlugs &&
      toolSetSlugs.length > 0 &&
      filteredToolSets.length === 0
    ) {
      throw new Error(
        `None of the requested toolsets (${toolSetSlugs.join(', ')}) were found`
      );
    }

    const tools: Record<string, Tool<any, any>> = {};
    for (const toolSet of filteredToolSets) {
      Object.assign(tools, toolSet.tools);
    }

    return tools;
  }

  private filterToolSets(
    allToolSets: ToolSet[],
    toolSetSlugs?: string[]
  ): ToolSet[] {
    return toolSetSlugs
      ? allToolSets.filter(toolSet => toolSetSlugs.includes(toolSet.slug))
      : allToolSets;
  }

  /**
   * Determines which toolsets are needed for the given messages using the orchestration LLM.
   *
   * @param context The runtime context to inject into toolsets.
   * @param messages The conversation messages to consider.
   * @returns Either a record of tools, or the NO_TOOLS_NEEDED symbol if orchestration determined no tools are required.
   */
  private async getOrchestratedTools<ToolContext extends BaseToolContext>(
    context: ToolContext,
    messages: UIMessage[]
  ): Promise<OrchestrationResult> {
    let systemPrompt =
      this.options.orchestrationMode?.systemPrompt ||
      ORCHESTRATION_DEFAULT_SYSTEM_PROMPT;

    if (this.options.orchestrationMode?.appendToolSetDefinition !== false) {
      const toolSetsJson = this.getToolSetsJson();
      systemPrompt = `${systemPrompt}\n\nAvailable toolsets and their tools:\n${toolSetsJson}`;
    }

    const result = await generateObject({
      model: this.options.orchestrationMode?.model || this.options.model,
      system: systemPrompt,
      schema: orchestrationResponseSchema,
      messages: messages,
    });

    console.log('Orchestration result:', result.object);

    const parsedResult = orchestrationResponseSchema.safeParse(result.object);
    if (!parsedResult.success) {
      throw new Error(
        `Orchestration response validation failed: ${parsedResult.error}`
      );
    }

    const { toolSets, needsTools } = parsedResult.data;

    // If the orchestration decided no tools are needed, return the special symbol
    if (!needsTools || toolSets.length === 0) {
      return NO_TOOLS_NEEDED;
    }

    const allToolSets = this.createToolSets(context);
    const filteredToolSets = allToolSets.filter(toolSet =>
      toolSets.includes(toolSet.slug)
    );

    if (filteredToolSets.length === 0) {
      throw new Error(
        `None of the requested toolsets (${toolSets.join(', ')}) were found`
      );
    }

    let tools: Record<string, Tool<any, any>> = {};
    for (const toolSet of filteredToolSets) {
      Object.assign(tools, toolSet.tools);
    }
    return tools;
  }

  /**
   * Generates a JSON representation of all available toolsets and their tools.
   * Includes the mayDependOn property from the custom Tool type.
   *
   * @returns A JSON string representing all available toolsets and their tools
   */
  getToolSetsJson(): string {
    // Create all toolsets with an empty context
    const allToolSets = this.createToolSets({} as BaseToolContext);

    // Create a representation that includes the mayDependOn property
    const toolSetsWithDependencies = allToolSets.map(toolSet => {
      const toolsWithDeps: Record<string, any> = {};

      for (const [toolName, tool] of Object.entries(toolSet.tools)) {
        // Extract standard tool properties
        const { name, description, parameters } = tool as any;

        // Create a clean representation of the tool
        toolsWithDeps[toolName] = {
          name: name || toolName,
          description,
          parameters,
        };

        // Add mayDependOn if it exists
        if ('mayDependOn' in tool) {
          toolsWithDeps[toolName].mayDependOn = (tool as any).mayDependOn;
        }
      }

      return {
        slug: toolSet.slug,
        name: toolSet.name,
        description: toolSet.description,
        tools: toolsWithDeps,
      };
    });

    return JSON.stringify(toolSetsWithDependencies, null, 2);
  }
}
