import { Tool as AITool } from 'ai';

export type Tool =
  | AITool<any, any>
  | {
      mayDependOn?: string[];
    };
export interface BaseToolContext {
  [key: string]: any;
}

export interface ToolSetDescription {
  slug: string;
  name: string;
  description: string;
}

export interface ToolSet extends ToolSetDescription {
  tools: Record<string, Tool>;
}

export interface BaseToolResult {
  [key: string]: any;
}
