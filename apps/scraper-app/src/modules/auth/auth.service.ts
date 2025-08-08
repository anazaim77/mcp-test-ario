import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class AuthService {
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
