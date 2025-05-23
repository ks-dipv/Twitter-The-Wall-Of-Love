import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommonApiDecorators } from 'src/common/decorator/common-api.decorator';
import { User } from 'src/common/decorator/user.decorator';
import { AssignUserRoleDto } from './dtos/req-user-role.dto';
import { SuccessDto } from 'src/common/dtos/success.dto';
import { RoleService } from './services/role.service';
import { UpdateUserAccessDto } from './dtos/update-user-role.dto';
import { ActiveUserData } from 'src/common/interface/active-user.interface';
import { AssignedWithMeDto , GetAssignedUserDto} from 'src/wall/dtos/wall.dto';
@Controller('api')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('wall/:wallId/invitation')
  @CommonApiDecorators({
    summary: 'Invitation mail send to assigned user',
    successDescription: 'Invitation mail sent successfully',
    errorStatus: 404,
    errorDescription: 'User not found',
  })
  public sentInvitation(
    @Body() assignUserRoleDto: AssignUserRoleDto,
    @User() user: ActiveUserData,
  ) {
    const { email, wallId, accessType } = assignUserRoleDto;
    this.roleService.sentInvitation(email, wallId, accessType, user);
    return new SuccessDto(
      `Successfully sent an invitation email to "${user.email}" to the wall`,
    );
  }

  @Get('wall/:wallId/assignees')
  @CommonApiDecorators({
    summary: 'Get list of assigned users',
    successDescription: 'List of assigned users retrieved',
  })
  async getAssignedUsers(
    @Param('wallId') wallId: number,
    @User() user: ActiveUserData,
  ) {
    const accesses = await this.roleService.getAssignedUsers(wallId, user);
    return accesses.map((access) => GetAssignedUserDto.toDto(access));
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
    @User() user: ActiveUserData,
  ) {
    await this.roleService.deleteAssignedUser(wallId, userId, user);
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
    @User() user: ActiveUserData,
  ) {
    await this.roleService.updateAssignedUserAccess(
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
  async getMyAssignments(@User() user: ActiveUserData) {
    const accesses = await this.roleService.getAssignedWithMe(user);
    return accesses.map((access) => AssignedWithMeDto.toDto(access));
  }
}
