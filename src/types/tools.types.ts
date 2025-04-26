import { Tool } from 'ai';

export interface BaseToolContext {
  [key: string]: any;
}

export interface ToolSetDescription {
  slug: string;
  name: string;
  description: string;
}

export interface ToolSet extends ToolSetDescription {
  tools: Record<string, Tool<any, any>>;
}

export interface BaseToolResult {
  [key: string]: any;
}
