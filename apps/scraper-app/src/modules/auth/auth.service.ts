import { Injectable, Logger } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { LoginCredentialsDto } from './auth.controller';
import {
  Browser as PuppeteerBrowser,
  Page as PuppeteerPage,
  executablePath,
} from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { config } from '@/constants';

puppeteer.use(StealthPlugin());

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(sessionId: string, loginDto: LoginCredentialsDto) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Execute Tokopedia login scraping immediately
    const loginResult = await this.scrapeTokopediaLogin(
      loginDto.email,
      loginDto.password,
    );

    return {
      success: true,
      message: 'Login and Tokopedia scraping completed',
      data: {
        sessionId: sessionId,
        email: loginDto.email,
        authenticated: true,
        tokopediaLogin: loginResult,
      },
    };
  }

  async scrapeTokopediaLogin(email: string, password: string): Promise<any> {
    this.logger.log(`Scraping Tokopedia login for email: ${email}`);

    const browser: PuppeteerBrowser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(),
      args: config.puppeteer_browser_config,
    });

    const page: PuppeteerPage = await browser.newPage();

    try {
      // Navigate to Tokopedia login page
      await page.goto('https://www.tokopedia.com/login', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      this.logger.log('Navigated to Tokopedia login page');

      // Find and fill email input
      await page.waitForSelector(
        '#input > div.css-1jm5afr > div.css-vyote > input[type=text]',
        {
          timeout: 10000,
        },
      );
      await page.type(
        '#input > div.css-1jm5afr > div.css-vyote > input[type=text]',
        email,
      );
      this.logger.log('Filled email');

      // Find and click first submit button
      await page.waitForSelector(
        '#__skipper > div > div > div > div > main > form > div.css-mhh4ym > button',
        {
          timeout: 10000,
        },
      );
      await page.click(
        '#__skipper > div > div > div > div > main > form > div.css-mhh4ym > button',
      );
      this.logger.log('Clicked first submit button');

      // Wait for the page to transition and password field to appear
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Try multiple selectors for password field since it might be dynamically loaded
      let passwordSelector: string | null = null;
      const possiblePasswordSelectors = [
        'input[type="password"][autocomplete="current-password"][data-n-input=""]',
        '#password > div > div.css-vyote > input[type=password]',
        'input[type="password"]',
        '[data-testid="password-input"]',
        'input[autocomplete="current-password"]',
      ];

      for (const selector of possiblePasswordSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          passwordSelector = selector;
          this.logger.log(`Found password field with selector: ${selector}`);
          break;
        } catch (error) {
          this.logger.log(`Password selector not found: ${selector}`);
          continue;
        }
      }

      if (!passwordSelector) {
        throw new Error('Password field not found after email submission');
      }

      // Fill password input
      await page.type(passwordSelector, password);
      this.logger.log('Filled password');

      // Find and click second submit button
      await page.waitForSelector(
        '#__skipper > div > div > div > div > main > form > div.css-mhh4ym > button',
        {
          timeout: 10000,
        },
      );
      await page.click(
        '#__skipper > div > div > div > div > main > form > div.css-mhh4ym > button',
      );
      this.logger.log('Clicked second submit button');

      // Wait for page to load after login
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Take screenshot for debugging
      await page.screenshot({ path: `tokopedia-login-${Date.now()}.png` });

      return {
        success: true,
        message: 'Tokopedia login completed',
        data: {
          email: email,
          loggedIn: true,
          screenshot: `tokopedia-login-${Date.now()}.png`,
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Error during Tokopedia login scraping: ${error.message}`,
      );
      await page.screenshot({ path: `error-${Date.now()}.png` });
      throw error;
    } finally {
      await browser.close();
    }
  }

  async getLoginCredentials(
    sessionId: string,
  ): Promise<{ email: string; password: string } | null> {
    if (!sessionId) return null;

    try {
      const sessionFilePath = join(process.cwd(), `${sessionId}-auth.json`);
      if (!existsSync(sessionFilePath)) {
        return null;
      }

      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(sessionFilePath, 'utf-8');
      const authData = JSON.parse(fileContent);

      if (authData.email && authData.password) {
        return {
          email: authData.email,
          password: authData.password,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async isAuthenticated(sessionId: string): Promise<boolean> {
    if (!sessionId) return false;

    try {
      const sessionFilePath = join(process.cwd(), `${sessionId}-auth.json`);
      return existsSync(sessionFilePath);
    } catch (error) {
      return false;
    }
  }

  async createAuthFile(sessionId: string, data: any = {}): Promise<void> {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    const sessionFilePath = join(process.cwd(), `${sessionId}-auth.json`);
    const fs = await import('fs/promises');
    await fs.writeFile(sessionFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
