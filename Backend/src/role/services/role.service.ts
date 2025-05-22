import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/repositories/user.repository';
import { WallAccess } from '../entity/wall-access.entity';
import { Repository } from 'typeorm';
import { Invitation } from '../entity/invitation.entity';
import { MailService } from 'src/auth/services/mail.service';
import { WallRepository } from 'src/wall/repository/wall.repository';
import { UpdateUserAccessDto } from '../dtos/update-user-role.dto';
import { ActiveUserData } from 'src/common/interface/active-user.interface';
import { AssignedByMeResponseDto } from '../dtos/assigned-me-response.dto';
import { AssignedWallDto } from '../dtos/assigned-wall.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly wallRepository: WallRepository,

    @InjectRepository(WallAccess)
    private readonly wallAccessRepository: Repository<WallAccess>,

    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  public async sentInvitation(
    email: string,
    wallId,
    accessType,
    user: ActiveUserData,
  ) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);

      const wall = await this.wallRepository.findOne({
        where: { id: wallId },
        relations: ['user'],
      });

      if (!wall) {
        throw new NotFoundException('Wall not found');
      }

      const baseUrl = process.env.BACKEND_BASE_URL;
      const invitationUrl = `${baseUrl}/api/walls/${wallId}`;

      await this.mailService.sendInvitationEmail(invitationUrl, email);

      const invite = this.invitationRepository.create({
        email: email,
        access_type: accessType,
        user: existingUser,
      });

      await this.invitationRepository.save(invite);
    } catch (error) {
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }

  public async getAssignedUsers(wallId: number, user: ActiveUserData) {
    const requestingUser = await this.userRepository.getByEmail(user.email);

    const wall = await this.wallRepository.findOne({
      where: { id: wallId },
      relations: ['user'],
    });

    if (!wall) {
      throw new NotFoundException('Wall not found');
    }

    const accesses = await this.wallAccessRepository.find({
      where: { wall: { id: wallId } },
      relations: ['user'],
      order: { created_at: 'ASC' },
    });

    return accesses.map((access) => ({
      email: access.user.email,
      access_type: access.access_type,
      assigned_at: access.created_at,
    }));
  }

  public async deleteAssignedUser(
    wallId: number,
    targetUserId: number,
    user: ActiveUserData,
  ): Promise<void> {
    const requestingUser = await this.userRepository.getByEmail(user.email);

    const wall = await this.wallRepository.findOne({
      where: { id: wallId },
      relations: ['user'],
    });

    if (!wall) {
      throw new NotFoundException('Wall not found');
    }

    const wallAccess = await this.wallAccessRepository.findOne({
      where: {
        wall: { id: wallId },
        user: { id: requestingUser.id },
      },
    });

    if (!(wall.user.id === requestingUser.id) && !wallAccess) {
      throw new ForbiddenException(
        'You do not have permission to remove users from this wall.',
      );
    }

    const access = await this.wallAccessRepository.findOne({
      where: { wall: { id: wallId }, user: { id: targetUserId } },
    });

    await this.wallAccessRepository.delete(access.id);
  }

  public async updateAssignedUserAccess(
    currentWallId: number,
    targetUserId: number,
    updateUserAccessDto: UpdateUserAccessDto,
    user: ActiveUserData,
  ): Promise<void> {
    try {
      const { access_type } = updateUserAccessDto;

      const requestingUser = await this.userRepository.getByEmail(user.email);
      if (!requestingUser) {
        throw new NotFoundException('Requesting user not found');
      }

      const currentWall = await this.wallRepository.findOne({
        where: { id: currentWallId },
        relations: ['user'],
      });
      if (!currentWall) {
        throw new NotFoundException('Current wall not found');
      }

      if (
        currentWall.user.id === requestingUser.id &&
        targetUserId === requestingUser.id
      ) {
        throw new BadRequestException(
          'Wall owner cannot modify their own access.',
        );
      }

      const access = await this.wallAccessRepository.findOne({
        where: { wall: { id: currentWallId }, user: { id: targetUserId } },
      });

      if (!access) {
        throw new NotFoundException(
          'User does not have access to the current wall.',
        );
      }

      access.access_type = access_type;
      await this.wallAccessRepository.save(access);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to update assigned user',
      );
    }
  }

  async getAssignedWithMe(
    user: ActiveUserData,
  ): Promise<AssignedByMeResponseDto[]> {
    const userId = user.sub;

    const accesses = await this.wallAccessRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'wall', 'assigned_by'],
      order: { created_at: 'ASC' },
    });

    return accesses.map((access) => {
      const wallDto = new AssignedWallDto();
      wallDto.id = access.wall.id;
      wallDto.name = access.wall.title;
      wallDto.logo = access.wall.logo;
      wallDto.description = access.wall.description;
      wallDto.wall_visibility = access.wall.visibility;
      wallDto.created_at = access.wall.created_at;

      const responseDto = new AssignedByMeResponseDto();
      responseDto.assigned_me = access.assigned_by.email;
      responseDto.wall = wallDto;
      responseDto.assigned_at = access.created_at;
      responseDto.access_type = access.access_type;

      return responseDto;
    });
  }
}
