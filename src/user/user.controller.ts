import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  Response,
  Request,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from './services/user.service';
import { SignInDto } from './dtos/signin.dto';
import { AuthType } from './enum/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDto } from './dtos/update.dto';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { Auth } from 'src/common/decorator/auth.decorator';

@ApiTags('Users')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'User signed up successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Auth(AuthType.None)
  @UseInterceptors(FileInterceptor('profileImage'))
  public entry(
    @Body() signupDto: SignUpDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.userService.signup(signupDto, profileImage);
  }

  @Post('auth/signin')
  @ApiOperation({ summary: 'User sign-in' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Auth(AuthType.None)
  public signin(
    @Body() signInDto: SignInDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.userService.signIn(signInDto, res);
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout the user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @Auth(AuthType.Bearer)
  public logout(@Response({ passthrough: true }) res) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Put('update')
  @ApiOperation({ summary: 'Update user details' })
  @ApiBody({ type: UpdateDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Auth(AuthType.Bearer)
  @UseInterceptors(FileInterceptor('profileImage'))
  public update(
    @Request() req,
    @Body() updateDto: UpdateDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.userService.update(req, updateDto, profileImage);
  }

  @Delete('delete')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Auth(AuthType.Bearer)
  public remove(@Request() req) {
    return this.userService.remove(req);
  }

  @Post('auth/reset-password/request')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Auth(AuthType.None)
  public resetPasswordRequest(@Body() resetPassword: UpdateDto) {
    const { email } = resetPassword;
    return this.userService.resetPasswordRequest(email);
  }

  @Post('auth/reset-password/:token')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiParam({
    name: 'token',
    description: 'Password reset token',
    type: 'string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'newPassword123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid token or password' })
  @Auth(AuthType.None)
  public resetPassword(
    @Param('token') token: string,
    @Body() updatePassword: UpdateDto,
  ) {
    const { password } = updatePassword;
    return this.userService.resetPassword(token, password);
  }

  @Post('developer/api-token')
  @ApiOperation({ summary: 'Generate API token for developers' })
  @ApiResponse({ status: 200, description: 'API token generated successfully' })
  async apiKeyGenerate(@Request() req) {
    return this.userService.apiKeyGenerate(req);
  }
}
