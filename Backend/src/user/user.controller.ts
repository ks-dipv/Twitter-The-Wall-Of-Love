import {
  Body,
  Controller,
  Delete,
  Put,
  UploadedFile,
  Get,
  UseInterceptors,
  Post,
  Param,
} from '@nestjs/common';
import { UserService } from './services/user.service';
import { AuthType } from '../common/enum/auth-type.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateDto } from './dtos/update.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Auth } from '../common/decorator/auth.decorator';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { SuccessDto } from 'src/common/dtos/success.dto';
import { User } from 'src/common/decorator/user.decorator';
import { CommonApiDecorators } from 'src/common/decorator/common-api.decorator';
import { AssignUserRoleDto } from './dtos/assign-user-role.dto';

@ApiTags('Users')
@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user')
  @CommonApiDecorators({
    summary: 'Fetch login user data',
    successDescription: 'Get user data successfully',
  })
  public getUser(@User() user) {
    return this.userService.getUserById(user);
  }

  @Put('user/profile')
  @CommonApiDecorators({
    summary: 'Update user details',
    successDescription: 'User updated successfully',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateDto })
  @Auth(AuthType.Bearer)
  @UseInterceptors(FileInterceptor('profile_pic'))
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

  @Post('/role/assign/invitation')
  @ApiBody({ type: AssignUserRoleDto })
  @CommonApiDecorators({
    summary: 'Send invitation mail to assign role',
    successDescription: 'Successfully invitation mail to assign role',
    errorStatus: 403,
    errorDescription: 'User does not have admin access',
  })
  public invitationMail(
    @Body() assignUserRoleDto: AssignUserRoleDto,
    @User() user,
  ) {
    const { email, roleId } = assignUserRoleDto;
    this.userService.sentInvitationLink(roleId, email, user);
    return new SuccessDto('Successfuly invitation mail to assign role');
  }

  @Post('/invitation/:token')
  @CommonApiDecorators({
    summary: 'Validate invitation token and store role info',
    successDescription: 'Successfully validated invitation and assigned role',
    errorStatus: 400,
    errorDescription: 'Invalid or expired invitation token',
  })
  public async validateInvitationToken(
    @Param('token') token: string,
    @User() user,
  ) {
    return this.userService.assignRoleToUser(token, user);
  }

  @Get('/assigned-users')
  @CommonApiDecorators({
    summary: 'Get users assigned by admin',
    successDescription: 'Successfully retrieved list of assigned users',
    errorStatus: 403,
    errorDescription: 'User does not have admin access',
  })
  public async getAssignedUsers(@User() user) {
    return this.userService.getAssignedUsers(user.id);
  }
}
