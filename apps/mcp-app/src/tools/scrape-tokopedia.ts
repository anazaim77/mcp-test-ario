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

// Scrape Tokopedia tool handler
export const scrapeTokopediaHandler = async (
  args: ScrapeTokopediaInput
): Promise<CallToolResult> => {
  const { keyword } = args;

  logger.debug("Scrape Tokopedia tool called", { keyword });

  try {
    // Encode the keyword for URL
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `${CONFIG.SERVER.scraperBaseUrl}/scraper/tokopedia?keyword=${encodedKeyword}`;

    logger.info("Making request to scraper service", { url });

    // Make HTTP request to the scraper service
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as APIScrapeResponse;

    logger.info(`Data: ${JSON.stringify(data)}`);

    // Transform the response to match our expected format
    const products: Product[] = Array.isArray(data.results) ? data.results : [];

    logger.info(`Products: ${JSON.stringify(products)}`);

    const result: ScrapeTokopediaResult = {
      products,
      keyword,
      totalFound: products.length,
    };

    logger.info("Scrape Tokopedia completed", {
      keyword,
      totalFound: products.length,
    });

    // Format the response for the user
    let responseText = `Found ${products.length} products for keyword "${keyword}":\n\n`;

    if (products.length === 0) {
      responseText += "No products found for this keyword.";
    } else {
      products.forEach((product, index) => {
        responseText += `${index + 1}. **${product.title}**\n`;
        responseText += `   💰 Price: ${product.price}\n`;
        if (product.rating) {
          responseText += `   ⭐ Rating: ${product.rating}\n`;
        }
        if (product.store) {
          responseText += `   🏪 Store: ${product.store}\n`;
        }
        responseText += `   🔗 Link: ${product.link}\n`;
        responseText += `   🖼️ Image: ${product.image}\n\n`;
      });
    }

    return {
      content: [
        {
          type: "text",
          text: responseText,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error in scrape Tokopedia tool", {
      error: errorMessage,
      keyword,
    });

    return {
      content: [
        {
          type: "text",
          text: `Error scraping Tokopedia for keyword "${keyword}": ${errorMessage}`,
        },
      ],
    };
  }
};

// Scrape Tokopedia tool configuration
export const scrapeTokopediaTool = {
  name: "scrape_tokopedia",
  description:
    "Scrape product listings from Tokopedia based on a keyword search. Returns a list of products with titles, prices, images, links, ratings, and store information.",
  inputSchema: {
    keyword: z.string().min(1, "Keyword is required"),
  },
  handler: scrapeTokopediaHandler,
};
