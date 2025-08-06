import { ServerConfig } from "../types/server";

// Default server configuration
export const defaultServerConfig: ServerConfig = {
  port: 3000,
  name: "test-ario-mcp-server",
  version: "1.0.0",
  enableDnsRebindingProtection: false, // Disabled for local development
  allowedHosts: ["127.0.0.1", "localhost"],
};

// Environment-based configuration
export const getServerConfig = (): ServerConfig => {
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
  const envName = process.env.SERVER_NAME;
  const envVersion = process.env.SERVER_VERSION;

  return {
    ...defaultServerConfig,
    ...(envPort && { port: envPort }),
    ...(envName && { name: envName }),
    ...(envVersion && { version: envVersion }),
  };
};

// Export configuration constants
export const CONFIG = {
  SERVER: getServerConfig(),
  MCP: {
    PROTOCOL_VERSION: "2024-11-05",
    DEFAULT_TIMEOUT: 30000,
  },
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || "info",
    ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING === "true",
  },
} as const;
