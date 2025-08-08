import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  ScrapeTokopediaInput,
  ScrapeTokopediaResult,
  Product,
  APIScrapeResponse,
} from "../types/scrape-tokopedia";
import { logger } from "../utils/logger";
import { z } from "zod";
import { CONFIG } from "../config";

const scrapeTokopediaOrderListHandler = async (
  args: ScrapeTokopediaInput
): Promise<CallToolResult> => {
  const { keyword } = args;

  logger.info("Scrape Tokopedia Order List tool called", { keyword });

  const url = `${CONFIG.SERVER.scraperBaseUrl}/scraper/tokopedia/order-list?keyword=${keyword}`;

  return {
    result: "Not implemented",
    content: [
      {
        type: "text",
        text: "Not implemented",
      },
    ],
  };
};

export const scrapeTokopediaOrderListTool = {
  name: "scrape_tokopedia_order_list",
  description:
    "Scrape order list from Tokopedia based on a authenticated user. Returns a list of transaction history.",
  inputSchema: {},
  handler: scrapeTokopediaOrderListHandler,
};
