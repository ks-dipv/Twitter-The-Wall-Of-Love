import {
  Body,
  Controller,
  Delete,
  Put,
  UploadedFile,
  Get,
  UseInterceptors,
  Post,
  Patch,
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
import { UpdateUserAccessDto } from './dtos/update-user-role.dto';
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

  @Get('wall/:wallId/assigned-users')
  @CommonApiDecorators({
    summary: 'Get list of assigned users',
    successDescription: 'List of assigned users retrieved',
  })
  @Auth(AuthType.Bearer)
  async getAssignedUsers(@Param('wallId') wallId: number, @User() user: any) {
    return await this.userService.getAssignedUsers(wallId, user);
  }

  @Post('user/wall/invitation')
  @CommonApiDecorators({
    summary: 'Invitation mail send to assigned user',
    successDescription: 'Invitation mail sent successfully',
    errorStatus: 404,
    errorDescription: 'User not found',
  })
  public sentInvitation(
    @Body() assignUserRoleDto: AssignUserRoleDto,
    @User() user,
  ) {
    const { email, wallId, accessType } = assignUserRoleDto;
    this.userService.sentInvitation(email, wallId, accessType, user);
    return new SuccessDto('Successfuly invitation mail to assign role of wall');
  }

  @Delete('wall/:wallId/assigned-user/:userId')
  @CommonApiDecorators({
    summary: 'Delete assigned user',
    successDescription: 'Assigned user Deleted successfully',
    errorStatus: 404,
    errorDescription: 'User not found',
  })
  async deleteAssignedUser(
    @Param('wallId') wallId: number,
    @Param('userId') userId: number,
    @User() user,
  ) {
    await this.userService.deleteAssignedUser(wallId, userId, user);
    return new SuccessDto('User successfully removed from wall');
  }

  @Patch('wall/:wallId/assigned-user/:userId')
  @CommonApiDecorators({
    summary: 'Update assigned user access type',
    successDescription: 'User access type updated successfully',
  })
  public async updateAssignedUserAccess(
    @Param('wallId') wallId: number,
    @Param('userId') userId: number,
    @Body() updateUserAccessDto: UpdateUserAccessDto,
    @User() user,
  ) {
    await this.userService.updateAssignedUserAccess(
      wallId,
      userId,
      updateUserAccessDto,
      user,
    );
    return new SuccessDto('User access type updated successfully');
  }

  @Get('wall/assigned-me')
  @CommonApiDecorators({
    summary: 'Get list of my wall assignments',
    successDescription:
      'List of wall assignments for the authenticated user retrieved',
  })
  @Auth(AuthType.Bearer)
  async getMyAssignments(@User() user: any) {
    return await this.userService.getAssignedByme(user);
  }
}
