import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFile,
  Response,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from './services/user.service';
import { SignInDto } from './dtos/signin.dto';
import { AuthType } from '../common/enum/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDto } from './dtos/update.dto';
import { ApiTags, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { Auth } from '../common/decorator/auth.decorator';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SuccessDto } from 'src/common/dtos/success.dto';
import { User } from 'src/common/decorator/user.decorater';
import { CommonApiDecorators } from 'src/common/decorator/common-api.decorator';

@ApiTags('Users')
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    this.userService.signup(signupDto, profileImage);
    return new SuccessDto(
      'Signup successful. Please check your email to verify your account.',
    );
  }

  @Post('auth/verify-email/resend')
  @CommonApiDecorators({ summary: 'Resend verification email' })
  @Auth(AuthType.None)
  async resendEmail(@Body('email') email: string) {
    this.userService.resendVerificationEmail(email);
    return new SuccessDto(
      'Verification email has been resent. Please check your inbox.',
    );
  }

  @Post('auth/verify-email/:token')
  @CommonApiDecorators({ summary: 'Verify email with token' })
  @Auth(AuthType.None)
  async verifyEmail(@Param('token') token: string) {
    return this.userService.verifyEmail(token);
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
    return this.userService.signIn(signInDto, res);
  }

  @Get('user')
  @CommonApiDecorators({
    summary: 'Fetch login user data',
    successDescription: 'Get user data successfully',
  })
  public getUser(@User() user) {
    return this.userService.getUserById(user);
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

  @Put('user/profile')
  @CommonApiDecorators({
    summary: 'Update user details',
    successDescription: 'User updated successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateDto })
  @Auth(AuthType.Bearer)
  @UseInterceptors(FileInterceptor('profileImage'))
  @UsePipes(new ValidationPipe({ transform: true }))
  public update(
    @User() user,
    @Body() updateDto: UpdateDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.userService.update(user, updateDto, profileImage);
  }

  @Delete('user')
  @CommonApiDecorators({
    summary: 'Delete user account',
    successDescription: 'User deleted successfully',
    errorStatus: 404,
    errorDescription: 'User not found',
  })
  @Auth(AuthType.Bearer)
  public remove(@User() user) {
    this.userService.remove(user);
    return new SuccessDto('User Deleted Successfully');
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
    this.userService.resetPasswordRequest(email);
    return new SuccessDto('Reset Password Email Sent Successfully');
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
    this.userService.resetPassword(token, password);
    return new SuccessDto('Password Reset Successfully');
  }

  @Post('developer/api-token')
  @CommonApiDecorators({
    summary: 'Generate API token for developers',
    successDescription: 'API token generated successfully',
  })
  async apiKeyGenerate(@User() user) {
    return this.userService.apiKeyGenerate(user);
  }
}
