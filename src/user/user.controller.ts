import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SignUpDto } from './dtos/signup.dto';
import { UserService } from './services/user.service';
import { SignInDto } from './dtos/signin.dto';
import { Auth } from './decorator/auth.decorator';
import { AuthType } from './enum/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDto } from './dtos/update.dto';

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

  @Put('update/:id')
  @Auth(AuthType.Bearer)
  @UseInterceptors(FileInterceptor('profileImage'))
  public update(
    @Param('id') id: number,
    @Body() updateDto: UpdateDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.userService.update(id, updateDto, profileImage);
  }

  @Delete('delete/:id')
  public remove(@Param('id') id: number) {
    return this.userService.remove(id);
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
}
