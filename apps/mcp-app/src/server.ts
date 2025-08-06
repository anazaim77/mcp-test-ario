import express from "express";
import { CONFIG } from "./config";
import { logger } from "./utils/logger";
import { handleMcpRequest, handleSessionRequest } from "./handlers";

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// Request logging middleware (if enabled)
if (CONFIG.LOGGING.ENABLE_REQUEST_LOGGING) {
  app.use((req, res, next) => {
    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
    next();
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    server: CONFIG.SERVER.name,
    version: CONFIG.SERVER.version,
    timestamp: new Date().toISOString(),
  });
});

// MCP endpoints
app.post("/mcp", handleMcpRequest);
app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

// 404 handler
app.use((req, res) => {
  logger.warn("Route not found", { method: req.method, url: req.url });
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("Unhandled error", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
);

// Start server
export const startServer = (): void => {
  const server = app.listen(CONFIG.SERVER.port, () => {
    logger.info("MCP Server started", {
      name: CONFIG.SERVER.name,
      version: CONFIG.SERVER.version,
      port: CONFIG.SERVER.port,
      environment: process.env.NODE_ENV || "development",
    });
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    server.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });
};

// Export app for testing
export { app };
