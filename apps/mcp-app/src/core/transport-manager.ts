import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { TransportManager } from "../types/server";
import { logger } from "../utils/logger";

// Transport manager implementation
export class McpTransportManager implements TransportManager {
  public transports: { [sessionId: string]: StreamableHTTPServerTransport } =
    {};

  public addTransport(
    sessionId: string,
    transport: StreamableHTTPServerTransport
  ): void {
    this.transports[sessionId] = transport;
    logger.info("Transport added", { sessionId });
  }

  public removeTransport(sessionId: string): void {
    if (this.transports[sessionId]) {
      delete this.transports[sessionId];
      logger.info("Transport removed", { sessionId });
    }
  }

  public getTransport(
    sessionId: string
  ): StreamableHTTPServerTransport | undefined {
    return this.transports[sessionId];
  }

  public hasTransport(sessionId: string): boolean {
    return !!this.transports[sessionId];
  }

  public getActiveSessionCount(): number {
    return Object.keys(this.transports).length;
  }

  public cleanup(): void {
    const sessionCount = this.getActiveSessionCount();
    this.transports = {};
    logger.info("All transports cleaned up", { sessionCount });
  }
}

// Export singleton instance
export const transportManager = new McpTransportManager();
