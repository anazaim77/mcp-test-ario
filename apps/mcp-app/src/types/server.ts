import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Request, Response } from "express";

// Server configuration interface
export interface ServerConfig {
  port: number;
  name: string;
  version: string;
  enableDnsRebindingProtection?: boolean;
  allowedHosts?: string[];
  scraperBaseUrl: string;
}

// Transport management interface
export interface TransportManager {
  transports: { [sessionId: string]: StreamableHTTPServerTransport };
  addTransport: (
    sessionId: string,
    transport: StreamableHTTPServerTransport
  ) => void;
  removeTransport: (sessionId: string) => void;
  getTransport: (
    sessionId: string
  ) => StreamableHTTPServerTransport | undefined;
}

// Request handler types
export type RequestHandler = (req: Request, res: Response) => Promise<void>;
export type SessionRequestHandler = (
  req: Request,
  res: Response
) => Promise<void>;

// Server initialization options
export interface ServerInitOptions {
  config: ServerConfig;
  transportManager: TransportManager;
}
