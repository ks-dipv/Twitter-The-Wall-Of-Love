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
  ClassSerializerInterceptor,
  Get,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from './services/user.service';
import { SignInDto } from './dtos/signin.dto';
import { AuthType } from '../common/enum/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDto } from './dtos/update.dto';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { Auth } from '../common/decorator/auth.decorator';
import { UsePipes } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { SuccessDto } from 'src/common/dtos/success.dto';
import { User } from 'src/common/decorator/user.decorater';
@ApiTags('Users')
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'User signed up successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Auth(AuthType.None)
  @UseInterceptors(FileInterceptor('profile_pic'), ClassSerializerInterceptor)
  public entry(
    @Body() signupDto: SignUpDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    this.userService.signup(signupDto, profileImage);

    return new SuccessDto(
      'Signup successful. Please check your email to verify your account.',
    );
  }

  @Post('auth/verify-email/resend')
  @Auth(AuthType.None)
  async resendEmail(@Body('email') email: string) {
    this.userService.resendVerificationEmail(email);

    return new SuccessDto(
      'Verification email has been resent. Please check your inbox.',
    );
  }

  @Post('auth/verify-email/:token')
  @Auth(AuthType.None)
  @UseInterceptors(ClassSerializerInterceptor)
  async verifyEmail(@Param('token') token: string) {
    return this.userService.verifyEmail(token);
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

  @Get('user')
  @ApiOperation({ summary: 'fetch login user data' })
  @ApiResponse({ status: 200, description: 'get user data successfully' })
  @UseInterceptors(ClassSerializerInterceptor)
  public getUser(@User() user) {
    return this.userService.getUserById(user);
  }

  @Post('auth/logout')
  @ApiOperation({ summary: 'Logout the user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @Auth(AuthType.Bearer)
  public logout(@Response({ passthrough: true }) res) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Put('user/profile')
  @ApiOperation({ summary: 'Update user details' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Auth(AuthType.Bearer)
  @UseInterceptors(FileInterceptor('profileImage'), ClassSerializerInterceptor)
  @UsePipes(new ValidationPipe({ transform: true }))
  public update(
    @User() user,
    @Body() updateDto: UpdateDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.userService.update(user, updateDto, profileImage);
  }

  @Delete('user')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Delete user account' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Auth(AuthType.Bearer)
  public remove(@User() user) {
    this.userService.remove(user);

    return new SuccessDto('User Deleted Successfully');
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
    this.userService.resetPasswordRequest(email);

    return new SuccessDto('Reset Password Email Sent Successfully');
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
    this.userService.resetPassword(token, password);

    return new SuccessDto('Password Reset Successfully');
  }

  @Post('developer/api-token')
  @ApiOperation({ summary: 'Generate API token for developers' })
  @ApiResponse({ status: 200, description: 'API token generated successfully' })
  async apiKeyGenerate(@User() user) {
    return this.userService.apiKeyGenerate(user);
  }
}
