import { Injectable, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';
import puppeteer from 'puppeteer-extra';
import {
  Browser as PuppeteerBrowser,
  Page as PuppeteerPage,
  executablePath,
} from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { convertRupiahToNumber } from '@/utils/format.utils';

puppeteer.use(StealthPlugin());

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeAmazon(keyword: string): Promise<any[]> {
    this.logger.log(`Scraping Amazon for keyword: ${keyword} using Playwright`);
    const browser: Browser = await chromium.launch({ headless: true });
    const page: Page = await browser.newPage();

    try {
      const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      await page.waitForSelector('.s-result-item');

      const products = await page.$$eval('.s-result-item', (elements) => {
        const topElements = elements.slice(0, 5);
        return topElements.map((el) => {
          const titleElement = el.querySelector('h2 a span');
          const priceElement = el.querySelector('.a-price .a-offscreen');
          const imageElement = el.querySelector('.s-image');
          const linkElement = el.querySelector('h2 a');

          return {
            title: titleElement?.textContent?.trim() || 'No title',
            price: priceElement?.textContent?.trim() || 'No price',
            image: imageElement?.getAttribute('src') || 'No image',
            link: linkElement?.getAttribute('href') || 'No link',
          };
        });
      });

      this.logger.log(`Found ${products.length} products`);
      return products;
    } catch (error) {
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

    this.logger.log(
      `Scraping Tokopedia for keyword: ${keyword} using Puppeteer`,
    );
    const browser: PuppeteerBrowser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-background-networking',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-ipc-flooding-protection',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--safebrowsing-disable-auto-update',
        '--metrics-recording-only',
        '--ignore-certificate-errors-spki-list',
      ],
    });
    const page: PuppeteerPage = await browser.newPage();
    await page.goto(url);

    await page.waitForSelector('[data-testid="divSRPContentProducts"]', {
      timeout: 15000,
    });

    const products = await page.evaluate(() => {
      const productContainer = document.querySelector(
        '[data-testid="divSRPContentProducts"]',
      );
      if (!productContainer) {
        return [];
      }
      const productLinks = productContainer.querySelectorAll(
        'div > div > div > a',
      );

      const top5Products = Array.from(productLinks).slice(0, 5);

      return top5Products.map((link) => {
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
        const titleElement = link.querySelector(
          'div > div:nth-child(2) > div > span',
        );
        const priceElement = link.querySelector(
          'div > div:nth-child(2) > div:nth-child(2) > div',
        );
        const imageElement = link.querySelector('div > div > div > div > img');

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

    await page.screenshot({ path: `screenshot-${Date.now()}.png` });

    this.logger.log(`${products.length} products found`);

    await browser.close();

    return processedProducts;
  }

  // async scrapeTokopedia(keyword: string): Promise<any[]> {
  //   this.logger.log(
  //     `Scraping Tokopedia for keyword: ${keyword} using Playwright`,
  //   );
  //   const browser: Browser = await chromium.launch({ headless: true });
  //   const page: Page = await browser.newPage();

  //   try {
  //     //   const url = `https://www.tokopedia.com/search?stproduct=&q=${encodeURIComponent(keyword)}`;
  //     //   const url = `https://www.tokopedia.com/search?st=&q=playstation%205`;
  //     const url = `https://bot.sannysoft.com/`;
  //     await page.goto(url, { waitUntil: 'domcontentloaded' });

  //     // Tokopedia memuat konten secara dinamis, jadi tunggu selector yang relevan
  //     //   await page.waitForSelector('[data-testid="product-card"]', {
  //     //     timeout: 10000,
  //     //   });

  //     //   const products = await page.$$eval(
  //     //     '[data-testid="product-card"]',
  //     //     (elements) => {
  //     //       const topElements = elements.slice(0, 5);
  //     //       return topElements.map((el) => {
  //     //         const titleElement = el.querySelector(
  //     //           '[data-testid="product-card-title"]',
  //     //         );
  //     //         const priceElement = el.querySelector(
  //     //           '[data-testid="product-card-price"]',
  //     //         );
  //     //         const imageElement = el.querySelector('img');
  //     //         const linkElement = el.querySelector('a');

  //     //         return {
  //     //           title: titleElement?.textContent?.trim() || 'No title',
  //     //           price: priceElement?.textContent?.trim() || 'No price',
  //     //           image: imageElement?.getAttribute('src') || 'No image',
  //     //           link: linkElement?.href || 'No link',
  //     //         };
  //     //       });
  //     //     },
  //     //   );

  //     //   this.logger.log(`Found ${products.length} products`);
  //     //   return products;
  //     return [];
  //   } catch (error) {
  //     this.logger.error(`Error during scraping Tokopedia: ${error.message}`);
  //     return [];
  //   } finally {
  //     await browser.close();
  //   }
  // }
}
