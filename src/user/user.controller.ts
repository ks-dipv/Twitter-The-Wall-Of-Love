import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Response,
  Request,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from './services/user.service';
import { SignInDto } from './dtos/signin.dto';
import { Auth } from './decorator/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDto } from './dtos/update.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('auth/signup')
  @Auth(AuthType.None)
  @UseInterceptors(FileInterceptor('profileImage'))
  public entry(
    @Body() signupDto: SignUpDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.userService.signup(signupDto, profileImage);
  }

  @Post('auth/signin')
  @Auth(AuthType.None)
  public signin(
    @Body() signInDto: SignInDto,
    @Response({ passthrough: true }) res,
  ) {
    return this.userService.signIn(signInDto, res);
  }

  @Post('auth/logout')
  @Auth(AuthType.Bearer)
  public logout(@Response({ passthrough: true }) res) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Put('update')
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
  public remove(@Request() req) {
    return this.userService.remove(req);
  }

  @Post('auth/reset-password/request')
  @Auth(AuthType.None)
  public resetPasswordRequest(@Body() resetPassword: UpdateDto) {
    const { email } = resetPassword;
    return this.userService.resetPasswordRequest(email);
  }

  @Post('auth/reset-password/:token')
  @Auth(AuthType.None)
  public resetPassword(
    @Param('token') token: string,
    @Body() updatePassword: UpdateDto,
  ) {
    const { password } = updatePassword;
    return this.userService.resetPassword(token, password);
  }

  @Get('auth/twitter')
  @Auth(AuthType.None)
  @UseGuards(AuthGuard('twitter'))
  async twitterLogin() {
    return { message: 'Redirecting to Twitter for authentication' };
  }

  @Get('auth/twitter/callback')
  @Auth(AuthType.None)
  @UseGuards(AuthGuard('twitter'))
  async twitterAuthCallback(@Req() req) {
    const response = await this.userService.validateOrCreateUser(req.user);
    return response;
  }
}
