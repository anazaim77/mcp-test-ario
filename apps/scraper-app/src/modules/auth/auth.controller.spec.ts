import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkAuthentication', () => {
    it('should return authenticated: true when session file exists', async () => {
      const sessionId = 'test-session-123';
      jest.spyOn(authService, 'isAuthenticated').mockResolvedValue(true);

      const result = await controller.checkAuthentication(sessionId);

      expect(authService.isAuthenticated).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual({ authenticated: true });
    });

    it('should return authenticated: false when session file does not exist', async () => {
      const sessionId = 'test-session-123';
      jest.spyOn(authService, 'isAuthenticated').mockResolvedValue(false);

      const result = await controller.checkAuthentication(sessionId);

      expect(authService.isAuthenticated).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual({ authenticated: false });
    });

    it('should return authenticated: false when sessionId is empty', async () => {
      const sessionId = '';
      jest.spyOn(authService, 'isAuthenticated').mockResolvedValue(false);

      const result = await controller.checkAuthentication(sessionId);

      expect(authService.isAuthenticated).toHaveBeenCalledWith(sessionId);
      expect(result).toEqual({ authenticated: false });
    });
  });
});
