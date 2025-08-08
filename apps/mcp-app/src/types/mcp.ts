import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// MCP tool interface
export interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any, sessionId?: string) => Promise<CallToolResult>;
}

// MCP server interface
export interface McpServerInterface {
  name: string;
  version: string;
  tools: McpTool[];
}

// MCP response types
export interface McpSuccessResponse {
  jsonrpc: "2.0";
  id: number | string;
  result: any;
}

export interface McpErrorResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

export type McpResponse = McpSuccessResponse | McpErrorResponse;
