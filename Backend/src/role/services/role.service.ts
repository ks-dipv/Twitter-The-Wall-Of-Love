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
import { AssignedWithMeDto, WallDto } from 'src/wall/dtos/wall.dto';

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

    return accesses;
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
    const { access_type } = updateUserAccessDto;

    const requestingUser = await this.userRepository.getByEmail(user.email);

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
  }

  async getAssignedWithMe(user: ActiveUserData) {
    const userId = user.sub;

    const accesses = await this.wallAccessRepository.find({
      where: { 
        user: { id: userId },
       },
      relations: ['user', 'wall', 'assigned_by'],
      order: { created_at: 'ASC' },
    });

    return accesses;
  }
}
