import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ServerConfig } from "../types/server";
import { logger } from "../utils/logger";
import { calculatorTool } from "../tools/calculator";

// MCP Server manager
export class McpServerManager {
  private server: McpServer;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });

    this.registerTools();
    logger.info("MCP Server manager initialized", {
      name: config.name,
      version: config.version,
    });
  }

  private registerTools(): void {
    // Register calculator tool
    this.server.tool(
      calculatorTool.name,
      calculatorTool.description,
      calculatorTool.inputSchema,
      calculatorTool.handler
    );

    logger.info("Tools registered", {
      tools: [calculatorTool.name],
    });
  }

  public async connect(
    transport: StreamableHTTPServerTransport
  ): Promise<void> {
    try {
      await this.server.connect(transport);
      logger.info("MCP Server connected to transport");
    } catch (error) {
      logger.error("Failed to connect MCP server to transport", { error });
      throw error;
    }
  }

  public getServer(): McpServer {
    return this.server;
  }

  public getConfig(): ServerConfig {
    return this.config;
  }
}
