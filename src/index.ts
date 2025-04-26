import { generateText, streamText, LanguageModelV1, Tool, UIMessage } from 'ai';
import { BaseToolContext, ToolSet } from './types/tools.types';

// Re-export types
export * from './types/tools.types';

/**
 * Options to initialize a SolaKit instance.
 */
export interface SolaKitOptions {
  /**
   * System prompt to be used when initializing the tool picker LLM.
   */
  systemPrompt?: string;

  /**
   * List of factories that produce ToolSets when given a context.
   * Each factory should return a ToolSet with tools ready for the provided context.
   */
  toolSetFactories?: Array<(context: any) => ToolSet>;

  /**
   * Language Model instance used for generating responses.
   */
  model?: LanguageModelV1;
}

/**
 * Options for making a query to the SolaKit instance.
 */
export interface SolaKitQueryOptions<ToolContext> {
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
 * SolaKit provides a lightweight, dynamic way to manage toolsets and interact with a language model,
 * injecting runtime context into available tools.
 */
export class SolaKit {
  /**
   * SolaKit instance configuration options.
   */
  options: SolaKitOptions;

  /**
   * Creates a new instance of SolaKit.
   *
   * @param options Configuration options for the SolaKit instance.
   */
  constructor(options: SolaKitOptions) {
    this.options = options;
  }

  /**
   * Processes a user query by preparing the correct tools and executing the model interaction.
   *
   * @param options Query options including the prompt, history, toolset selection, and context.
   * @returns A Promise that resolves once the query has been processed.
   */
  async query<ToolContext extends BaseToolContext>(
    options: SolaKitQueryOptions<ToolContext>
  ) {
    // Get the tools from the toolsets with context applied
    const tools = this.getTools(
      options.toolsContext || ({} as ToolContext),
      options.toolSets
    );
    if (this.options.model === undefined) {
      throw new Error(
        'No model has been defined. Please define a model in the constructor of SolaKit'
      );
    }
    const result = generateText({
      model: this.options.model,
      messages: options.history || undefined,
      tools,
      toolChoice: 'auto',
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
    });
    return result;
  }

  /**
   * Processes a user query by preparing the correct tools and streaming the model's response.
   * This is particularly useful for UI applications that want to show text as it's generated.
   *
   * @param options Query options including the prompt, history, toolset selection, and context.
   * @returns A ReadableStream of text chunks that can be consumed incrementally.
   */
  streamText<ToolContext extends BaseToolContext>(
    options: SolaKitQueryOptions<ToolContext>
  ) {
    // Get the tools from the toolsets with context applied
    const tools = this.getTools(
      options.toolsContext || ({} as ToolContext),
      options.toolSets
    );

    if (this.options.model === undefined) {
      throw new Error(
        'No model has been defined. Please define a model in the constructor of SolaKit'
      );
    }

    // Using the latest prompt as the user message
    const userMessage = { role: 'user', content: options.prompt } as const;

    // Create a message array from history plus the current prompt
    const messages = options.history
      ? [...options.history, userMessage]
      : [userMessage];

    // Generate streaming text
    return streamText({
      model: this.options.model,
      messages,
      tools,
      toolChoice: 'auto',
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
    });
  }

  /**
   * Creates all available toolsets by injecting the given context into each toolset factory.
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
        'There are no toolset factories defined. Define toolset factories in the constructor of SolaKit'
      );
    }

    return this.options.toolSetFactories.map(toolSetFactory =>
      toolSetFactory(context)
    );
  }

  /**
   * Retrieves all available tools with the context injected into them.
   *
   * @param context The runtime context to inject into tools.
   * @param toolSetSlugs Optional array of toolset slugs to restrict which toolsets are included.
   * @returns A record of tool names mapped to their corresponding Tool objects.
   * @throws If the requested toolsets are not found.
   */
  getTools<ToolContext extends BaseToolContext>(
    context: ToolContext,
    toolSetSlugs?: string[]
  ): Record<string, Tool<any, any>> {
    const tools: Record<string, Tool<any, any>> = {};

    // Create all toolsets with context
    const allToolSets = this.createToolSets(context);

    // Filter toolsets if slugs are provided
    const filteredToolSets = toolSetSlugs
      ? allToolSets.filter(toolSet => toolSetSlugs.includes(toolSet.slug))
      : allToolSets;

    if (
      filteredToolSets.length === 0 &&
      toolSetSlugs &&
      toolSetSlugs.length > 0
    ) {
      throw new Error(
        `None of the requested toolsets (${toolSetSlugs.join(', ')}) were found`
      );
    }

    for (const toolSet of filteredToolSets) {
      Object.assign(tools, toolSet.tools);
    }

    return tools;
  }
}
