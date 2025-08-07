import { z } from "zod";

// Scrape Tokopedia input schema
export const ScrapeTokopediaSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
});

// Scrape Tokopedia input type
export type ScrapeTokopediaInput = z.infer<typeof ScrapeTokopediaSchema>;

// Product interface
export interface Product {
  title: string;
  price: string | number;
  image: string;
  link: string;
  rating?: string | null;
  store?: string | null;
}

// Scrape Tokopedia result interface
export interface ScrapeTokopediaResult {
  products: Product[];
  keyword: string;
  totalFound: number;
}

export interface APIScrapeResponse {
  source: string;
  keyword: string;
  results: Product[];
}
