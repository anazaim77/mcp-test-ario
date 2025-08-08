import { Controller, Get, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
