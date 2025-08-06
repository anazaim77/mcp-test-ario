import { Response } from "express";
import { McpErrorResponse, McpSuccessResponse } from "../types/mcp";

// Create success response
export const createSuccessResponse = (
  id: number | string,
  result: any
): McpSuccessResponse => ({
  jsonrpc: "2.0",
  id,
  result,
});

// Create error response
export const createErrorResponse = (
  id: number | string | null,
  code: number,
  message: string,
  data?: any
): McpErrorResponse => ({
  jsonrpc: "2.0",
  id,
  error: {
    code,
    message,
    ...(data && { data }),
  },
});

// Send JSON response
export const sendJsonResponse = (
  res: Response,
  statusCode: number,
  data: any
): void => {
  res.status(statusCode).json(data);
};

// Send MCP success response
export const sendMcpSuccess = (
  res: Response,
  id: number | string,
  result: any
): void => {
  const response = createSuccessResponse(id, result);
  sendJsonResponse(res, 200, response);
};

// Send MCP error response
export const sendMcpError = (
  res: Response,
  id: number | string | null,
  code: number,
  message: string,
  data?: any
): void => {
  const response = createErrorResponse(id, code, message, data);
  sendJsonResponse(res, 400, response);
};

// Common error responses
export const ERROR_RESPONSES = {
  BAD_REQUEST: (id: number | string | null) =>
    createErrorResponse(
      id,
      -32000,
      "Bad Request: No valid session ID provided"
    ),
  INVALID_TOOL: (id: number | string | null, toolName: string) =>
    createErrorResponse(id, -32601, `Unknown tool: ${toolName}`),
  INVALID_PARAMS: (id: number | string | null, message: string) =>
    createErrorResponse(id, -32602, `Invalid params: ${message}`),
  INTERNAL_ERROR: (id: number | string | null, message: string) =>
    createErrorResponse(id, -32603, `Internal error: ${message}`),
} as const;
