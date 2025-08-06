import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { RequestHandler } from "../types/server";
import { logger } from "../utils/logger";
import { ERROR_RESPONSES, sendJsonResponse } from "../utils/response";
import { transportManager } from "../core/transport-manager";
import { McpServerManager } from "../core/mcp-server";
import { CONFIG } from "../config";

// Main MCP request handler
export const handleMcpRequest: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  logger.debug("MCP request received", {
    method: req.method,
    sessionId: sessionId || "new",
    body: req.body,
  });

  if (sessionId && transportManager.hasTransport(sessionId)) {
    // Reuse existing transport
    transport = transportManager.getTransport(sessionId)!;
    logger.debug("Reusing existing transport", { sessionId });
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New initialization request
    transport = await createNewTransport();
    logger.info("New MCP session initialized", {
      sessionId: transport.sessionId,
    });
  } else {
    // Invalid request
    logger.warn("Invalid MCP request", { sessionId, hasBody: !!req.body });
    const errorResponse = ERROR_RESPONSES.BAD_REQUEST(req.body?.id || null);
    sendJsonResponse(res, 400, errorResponse);
    return;
  }

  // Handle the request
  try {
    await transport.handleRequest(req, res, req.body);
    logger.debug("MCP request handled successfully", {
      sessionId: transport.sessionId,
    });
  } catch (error) {
    logger.error("Error handling MCP request", {
      sessionId: transport.sessionId,
      error,
    });
    const errorResponse = ERROR_RESPONSES.INTERNAL_ERROR(
      req.body?.id || null,
      "Failed to handle request"
    );
    sendJsonResponse(res, 500, errorResponse);
  }
};

// Create new transport for new session
async function createNewTransport(): Promise<StreamableHTTPServerTransport> {
  const transportConfig: any = {
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId: string) => {
      transportManager.addTransport(sessionId, transport);
    },
  };

  if (CONFIG.SERVER.enableDnsRebindingProtection !== undefined) {
    transportConfig.enableDnsRebindingProtection =
      CONFIG.SERVER.enableDnsRebindingProtection;
  }

  if (CONFIG.SERVER.allowedHosts) {
    transportConfig.allowedHosts = CONFIG.SERVER.allowedHosts;
  }

  const transport = new StreamableHTTPServerTransport(transportConfig);

  // Clean up transport when closed
  transport.onclose = () => {
    if (transport.sessionId) {
      transportManager.removeTransport(transport.sessionId);
    }
  };

  // Create and connect MCP server
  const mcpServerManager = new McpServerManager(CONFIG.SERVER);
  await mcpServerManager.connect(transport);

  return transport;
}
