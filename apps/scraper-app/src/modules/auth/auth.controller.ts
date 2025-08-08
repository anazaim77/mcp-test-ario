import {
  Controller,
  Get,
  Post,
  Headers,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

// DTO for login credentials
export class LoginCredentialsDto {
  email: string;
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email and password, then scrape Tokopedia login',
  })
  @ApiHeader({
    name: 'mcp-session-id',
    description: 'Session ID for authentication',
    required: true,
  })
  @ApiBody({
    type: LoginCredentialsDto,
    examples: {
      example1: {
        summary: 'Login Example',
        value: {
          email: 'user@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login and Tokopedia scraping completed',
    schema: {
      example: {
        success: true,
        message: 'Login and Tokopedia scraping completed',
        data: {
          sessionId: 'session_xyz789abc',
          email: 'user@example.com',
          authenticated: true,
          tokopediaLogin: {
            success: true,
            message: 'Tokopedia login successful',
            data: {
              email: 'user@example.com',
              loggedIn: true,
              screenshot: 'tokopedia-login-1234567890.png',
            },
          },
        },
      },
    },
  })
  async login(
    @Headers('mcp-session-id') sessionId: string,
    @Body() loginDto: LoginCredentialsDto,
  ) {
    return this.authService.login(sessionId, loginDto);
  }

  @Get('check-cookies')
  @ApiOperation({ summary: 'Check cookies availability' })
  @ApiHeader({
    name: 'mcp-session-id',
    description: 'Session ID for authentication check',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication status',
    schema: {
      type: 'object',
      properties: {
        authenticated: {
          type: 'boolean',
        },
      },
    },
  })
  async checkAuthentication(
    @Headers('mcp-session-id') sessionId: string,
  ): Promise<{ authenticated: boolean }> {
    const isAuthenticated = await this.authService.isAuthenticated(sessionId);
    return { authenticated: isAuthenticated };
  }
}
