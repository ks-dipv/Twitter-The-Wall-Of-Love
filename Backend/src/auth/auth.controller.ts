import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Response,
  Get,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { CommonApiDecorators } from 'src/common/decorator/common-api.decorator';
import { ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { SignUpDto } from './dtos/signup.dto';
import { AuthType } from 'src/common/enum/auth-type.enum';
import { Auth } from 'src/common/decorator/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { SuccessDto } from 'src/common/dtos/success.dto';
import { SignInDto } from './dtos/signin.dto';
import { UpdateDto } from 'src/user/dtos/update.dto';
import { GoogleAuthenticationService } from './services/google-authentication.service';
import { GoogleTokenDto } from './dtos/google-token.dto';

@Controller('api')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post('auth/signup')
  @CommonApiDecorators({
    summary: 'User signup',
    successStatus: 201,
    successDescription: 'User signed up successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SignUpDto })
  @Auth(AuthType.None)
  @UseInterceptors(FileInterceptor('profile_pic'))
  public entry(
    @Body() signupDto: SignUpDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    this.authService.signup(signupDto, profileImage);
    return new SuccessDto(
      'Signup successful. Please check your email to verify your account.',
    );
  }

  @Post('auth/google-authentication')
  @Auth(AuthType.None)
  public authenticate(
    @Body() googleTokenDto: GoogleTokenDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.googleAuthenticationService.authentication(googleTokenDto, res);
  }

  @Post('auth/verify-email/resend')
  @CommonApiDecorators({ summary: 'Resend verification email' })
  @Auth(AuthType.None)
  async resendEmail(@Body('email') email: string) {
    this.authService.resendVerificationEmail(email);
    return new SuccessDto(
      'Verification email has been resent. Please check your inbox.',
    );
  }

  @Post('auth/verify-email/:token')
  @CommonApiDecorators({ summary: 'Verify email with token' })
  @Auth(AuthType.None)
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('auth/signin')
  @CommonApiDecorators({
    summary: 'User sign-in',
    successDescription: 'User signed in successfully',
    errorStatus: 401,
    errorDescription: 'Invalid credentials',
  })
  @ApiBody({ type: SignInDto })
  @Auth(AuthType.None)
  public signin(
    @Body() signInDto: SignInDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.authService.signIn(signInDto, res);
  }

  @Post('auth/reset-password/request')
  @CommonApiDecorators({
    summary: 'Request password reset',
    successDescription: 'Password reset email sent',
    errorStatus: 404,
    errorDescription: 'User not found',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', example: 'user@example.com' } },
    },
  })
  @Auth(AuthType.None)
  public resetPasswordRequest(@Body() resetPassword: UpdateDto) {
    const { email } = resetPassword;
    this.authService.resetPasswordRequest(email);
    return new SuccessDto('Reset Password Email Sent Successfully');
  }

  @Post('auth/logout')
  @CommonApiDecorators({
    summary: 'Logout the user',
    successDescription: 'Logged out successfully',
  })
  @Auth(AuthType.Bearer)
  public logout(@Response({ passthrough: true }) res) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Post('auth/reset-password/:token')
  @CommonApiDecorators({
    summary: 'Reset password using token',
    successDescription: 'Password reset successful',
  })
  @ApiParam({
    name: 'token',
    description: 'Password reset token',
    type: 'string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { password: { type: 'string', example: 'newPassword123' } },
    },
  })
  @Auth(AuthType.None)
  public resetPassword(
    @Param('token') token: string,
    @Body() updatePassword: UpdateDto,
  ) {
    const { password } = updatePassword;
    this.authService.resetPassword(token, password);
    return new SuccessDto('Password Reset Successfully');
  }

  @Get('auth/verify-reset-token/:token')
  @CommonApiDecorators({
    summary: 'Verify reset password token',
    successDescription: 'Token is valid',
  })
  @ApiParam({
    name: 'token',
    description: 'Password reset token',
    type: 'string',
  })
  @Auth(AuthType.None)
  public async verifyResetToken(@Param('token') token: string) {
    await this.authService.verifyResetToken(token);
    return new SuccessDto('Token is valid');
  }
}
