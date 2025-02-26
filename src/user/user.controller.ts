import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from './services/user.service';
import { SignInDto } from './dtos/signin.dto';
import { Auth } from './decorator/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';

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
  public signin(@Body() signInDto: SignInDto) {
    return this.userService.signIn(signInDto);
  }
}
