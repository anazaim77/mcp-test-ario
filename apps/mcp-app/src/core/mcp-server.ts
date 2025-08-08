import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ServerConfig } from "../types/server";
import { logger } from "../utils/logger";
import { calculatorTool } from "../tools/calculator";
import { scrapeTokopediaTool } from "../tools/scrape-tokopedia";

// MCP Server manager
export class McpServerManager {
  private server: McpServer;
  private config: ServerConfig;
  private currentTransport: StreamableHTTPServerTransport | null = null;

  constructor(config: ServerConfig) {
    this.config = config;
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });

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

    // Register scrape Tokopedia tool with session context
    this.server.tool(
      scrapeTokopediaTool.name,
      scrapeTokopediaTool.description,
      scrapeTokopediaTool.inputSchema,
      async (args: any) => {
        // Pass session ID to the handler if available
        const sessionId = this.currentTransport?.sessionId;
        return scrapeTokopediaTool.handler(args, sessionId);
      }
    );

    logger.info("Tools registered", {
      tools: [calculatorTool.name, scrapeTokopediaTool.name],
    });
  }

  public async connect(
    transport: StreamableHTTPServerTransport
  ): Promise<void> {
    try {
      this.currentTransport = transport;
      this.registerTools();
      await this.server.connect(transport);
      logger.info("MCP Server connected to transport", {
        sessionId: transport.sessionId,
      });
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
