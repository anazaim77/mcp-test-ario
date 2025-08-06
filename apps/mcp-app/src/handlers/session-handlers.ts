import { Request, Response } from "express";
import { SessionRequestHandler } from "../types/server";
import { logger } from "../utils/logger";
import { transportManager } from "../core/transport-manager";

// Reusable handler for GET and DELETE requests
export const handleSessionRequest: SessionRequestHandler = async (
  req: Request,
  res: Response
) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  logger.debug("Session request received", {
    method: req.method,
    sessionId,
  });

  if (!sessionId || !transportManager.hasTransport(sessionId)) {
    logger.warn("Invalid or missing session ID", { sessionId });
    res.status(400).send("Invalid or missing session ID");
    return;
  }

  const transport = transportManager.getTransport(sessionId)!;

  try {
    await transport.handleRequest(req, res);
    logger.debug("Session request handled successfully", { sessionId });
  } catch (error) {
    logger.error("Error handling session request", { sessionId, error });
    res.status(500).send("Internal server error");
  }
};
