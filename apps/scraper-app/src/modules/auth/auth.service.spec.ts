import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { existsSync } from 'fs';
import { join } from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('path');

describe('AuthService', () => {
  let service: AuthService;
  const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
  const mockJoin = join as jest.MockedFunction<typeof join>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isAuthenticated', () => {
    it('should return false when sessionId is empty', async () => {
      const result = await service.isAuthenticated('');
      expect(result).toBe(false);
    });

    it('should return false when sessionId is null', async () => {
      const result = await service.isAuthenticated(null as any);
      expect(result).toBe(false);
    });

    it('should return true when session file exists', async () => {
      const sessionId = 'test-session-123';
      const expectedPath = '/test/path/test-session-123-auth.json';

      mockJoin.mockReturnValue(expectedPath);
      mockExistsSync.mockReturnValue(true);

      const result = await service.isAuthenticated(sessionId);

      expect(mockJoin).toHaveBeenCalledWith(
        process.cwd(),
        `${sessionId}-auth.json`,
      );
      expect(mockExistsSync).toHaveBeenCalledWith(expectedPath);
      expect(result).toBe(true);
    });

    it('should return false when session file does not exist', async () => {
      const sessionId = 'test-session-123';
      const expectedPath = '/test/path/test-session-123-auth.json';

      mockJoin.mockReturnValue(expectedPath);
      mockExistsSync.mockReturnValue(false);

      const result = await service.isAuthenticated(sessionId);

      expect(mockJoin).toHaveBeenCalledWith(
        process.cwd(),
        `${sessionId}-auth.json`,
      );
      expect(mockExistsSync).toHaveBeenCalledWith(expectedPath);
      expect(result).toBe(false);
    });

    it('should return false when file system error occurs', async () => {
      const sessionId = 'test-session-123';

      mockJoin.mockImplementation(() => {
        throw new Error('File system error');
      });

      const result = await service.isAuthenticated(sessionId);
      expect(result).toBe(false);
    });
  });
});
