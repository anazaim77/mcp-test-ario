import { config, elements } from '@/constants';
import { convertRupiahToNumber } from '@/utils/format.utils';
import { Injectable, Logger } from '@nestjs/common';
import {
  Browser as PuppeteerBrowser,
  Page as PuppeteerPage,
  executablePath,
} from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeAmazon(keyword: string): Promise<any[]> {
    this.logger.log(`Scraping Amazon for keyword: ${keyword} using Puppeteer`);
    const browser: PuppeteerBrowser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || executablePath(),
      args: config.puppeteer_browser_config,
    });
    const page: PuppeteerPage = await browser.newPage();

    try {
      const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      await page.waitForSelector('.s-result-item', { timeout: 30000 });

      const products = await page.$$eval('.s-result-item', (elements) => {
        const topElements = Array.from(elements).slice(0, 5);
        return topElements.map((el) => {
          const titleElement = el.querySelector('h2 a span');
          const priceElement = el.querySelector('.a-price .a-offscreen');
          const imageElement = el.querySelector('.s-image');
          const linkElement = el.querySelector('h2 a');

          return {
            title: titleElement?.textContent?.trim() || 'No title',
            price: priceElement?.textContent?.trim() || 'No price',
            image: imageElement?.getAttribute('src') || 'No image',
            link: linkElement?.getAttribute('href')
              ? `https://www.amazon.com${linkElement.getAttribute('href')}`
              : 'No link',
          };
        });
      });

      this.logger.log(`Found ${products.length} products`);
      return products;
    } catch (error: any) {
      this.logger.error(`Error during scraping: ${error.message}`);
      return [];
    } finally {
      await browser.close();
    }
  }

  async scrapeTokopedia(keyword: string): Promise<any[]> {
    const url = `https://www.tokopedia.com/search?st=&q=${encodeURIComponent(
      keyword,
    )}`;

    this.logger.log(`Scraping Tokopedia for keyword: ${keyword}. URL: ${url}`);
    const browser: PuppeteerBrowser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(),
      args: config.puppeteer_browser_config,
    });

    const page: PuppeteerPage = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector(elements.tokopedia_product_container, {
      timeout: 30000,
    });
    await page.screenshot({ path: `screenshot-${Date.now()}.png` });

    const products = await page.evaluate(() => {
      const tokopedia_product_container =
        '[data-testid="divSRPContentProducts"]';
      const title_element = 'div > div:nth-child(2) > div > span';
      const price_element = 'div > div:nth-child(2) > div:nth-child(2) > div';
      const image_element = 'div > div > div > div > img';
      /**
       * Note: This method can only be used to find the store and store rating on Tokopedia.
       */
      function findValueByAltText(
        parentElement: Element,
        altText: string,
      ): string | null {
        const elementImage = parentElement.querySelector(
          `img[alt="${altText}"]`,
        );

        if (elementImage) {
          const parent1 = elementImage.parentElement;
          if (parent1) {
            const parent2 = parent1.parentElement;
            if (parent2) {
              const valueSpan = parent2.querySelector('span');
              if (valueSpan) {
                return valueSpan.textContent?.trim() || null;
              }
            }
          }
        }

        return null;
      }

      const productContainer = document.querySelector(
        tokopedia_product_container,
      );
      if (!productContainer) {
        return [];
      }
      const productLinks = productContainer.querySelectorAll(
        'div > div > div > a',
      );

      const top5Products = Array.from(productLinks).slice(0, 5);

      return top5Products.map((link) => {
        const titleElement = link.querySelector(title_element);
        const priceElement = link.querySelector(price_element);
        const imageElement = link.querySelector(image_element);

        const rating = findValueByAltText(link, 'rating');
        const store = findValueByAltText(link, 'shop badge');

        return {
          title: titleElement?.textContent?.trim() || 'No title',
          price: priceElement?.textContent?.trim() || 'No price',
          image: imageElement?.getAttribute('src') || 'No image',
          link: link.getAttribute('href') || 'No link',
          rating,
          store,
        };
      });
    });

    const processedProducts = products.map((product) => ({
      ...product,
      price: convertRupiahToNumber(product.price) || 'No price',
    }));

    // await page.screenshot({ path: `screenshot-${Date.now()}.png` });

    this.logger.log(`${products.length} products found`);

    await browser.close();

    return processedProducts;
  }
}
