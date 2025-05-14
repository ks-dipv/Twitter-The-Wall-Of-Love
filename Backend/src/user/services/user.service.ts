import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { UploadService } from '../../common/services/upload.service';
import { UpdateDto } from '../dtos/update.dto';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entity/user.entity';
import { GenerateTokenProvider } from 'src/common/services/generate-token.provider';
import { GoogleUser } from '../interfaces/google-user.interface';
import { MailService } from 'src/auth/services/mail.service';
import { ConfigService } from '@nestjs/config';
import { AccessType } from '../enum/accesstype.enum';
import { WallRepository } from 'src/wall/repository/wall.repository';
import { WallAccess } from '../entity/wall-access.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserAccessDto } from '../dtos/update-user-role.dto';
import { Invitation } from '../entity/invitation.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,

    private readonly wallRepository: WallRepository,
    @InjectRepository(WallAccess)
    private wallAccessRepository: Repository<WallAccess>,

    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
  ) {}

  public async createGoogleUser(googleUser: GoogleUser) {
    try {
      const user = this.userRepository.create(googleUser);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Could not create a new user',
      });
    }
  }

  public async findOneByGoogleId(googleId: string) {
    return await this.userRepository.findOne({
      where: {
        googleId: googleId,
      },
    });
  }

  public async getUserById(user): Promise<User> {
    try {
      const existUser = await this.userRepository.getById(user.sub);
      if (!existUser) throw new NotFoundException("User doesn't exist");

      return existUser;
    } catch (error) {
      console.log(error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  public async update(
    user,
    updateDto: UpdateDto,
    profileImage?: Express.Multer.File,
  ): Promise<User> {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new NotFoundException("User doesn't exist");

      let profilePicUrl: string | null = existingUser.profile_pic;
      if (profileImage) {
        if (!profileImage.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          throw new BadRequestException(
            'Invalid file format. Allowed: JPG, JPEG, PNG',
          );
        }
        if (existingUser.profile_pic) {
          const fileName = existingUser.profile_pic.split('/').pop();
          if (fileName) await this.uploadService.deleteImage(fileName);
        }
        profilePicUrl = await this.uploadService.uploadImage(profileImage);
      }

      existingUser.email = updateDto.email ?? existingUser.email;
      existingUser.name = updateDto.name ?? existingUser.name;
      existingUser.profile_pic = profilePicUrl;

      return await this.userRepository.save(existingUser);
    } catch (error) {
      console.log(error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Update failed');
    }
  }

  public async remove(user): Promise<void> {
    try {
      const existUser = await this.userRepository.getById(user.sub);
      if (!existUser) throw new NotFoundException("User doesn't exist");

      if (existUser.profile_pic) {
        const fileName = existUser.profile_pic.split('/').pop();
        if (fileName) await this.uploadService.deleteImage(fileName);
      }

      await this.userRepository.delete(user.sub);
    } catch (error) {
      console.log(error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async getAssignedUsers(wallId: number, requestingUserId: number) {
    const wall = await this.wallRepository.findOne({
      where: { id: wallId },
      relations: ['user'],
    });

    if (!wall) {
      throw new NotFoundException('Wall not found');
    }

    const requestingUser = await this.userRepository.findOne({
      where: { id: requestingUserId },
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    const isOwner = wall.user.id === requestingUserId;
    const isAdmin = requestingUser.access_type === AccessType.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        "You do not have permission to view this wall's users.",
      );
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

  public async sentInvitation(email: string, wallId, accessType, user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);

      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      const baseUrl = 'http://localhost:3000';
      const invitationUrl = `${baseUrl}/api/walls/${wallId}`;

      await this.mailService.sendInvitationEmail(invitationUrl, email);

      const invite = this.invitationRepository.create({
        email: email,
        access_type: accessType,
        user: existingUser,
      });

      await this.invitationRepository.save(invite);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to send invitation email');
    }
  }

  public async deleteAssignedUser(
    wallId: number,
    targetUserId: number,
    requestingUserId: number,
  ): Promise<void> {
    const wall = await this.wallRepository.findOne({
      where: { id: wallId },
      relations: ['user'],
    });

    if (!wall) {
      throw new NotFoundException('Wall not found');
    }

    const requestingUser = await this.userRepository.findOne({
      where: { id: requestingUserId },
    });

    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    const isOwner = wall.user.id === requestingUserId;
    const isAdmin = requestingUser.access_type === AccessType.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to remove users from this wall.',
      );
    }

    const access = await this.wallAccessRepository.findOne({
      where: { wall: { id: wallId }, user: { id: targetUserId } },
    });

    if (!access) {
      throw new NotFoundException('user does not have access to this wall.');
    }

    if (isOwner && targetUserId === requestingUserId) {
      throw new BadRequestException('Wall owner cannot remove themselves.');
    }

    await this.wallAccessRepository.delete(access.id);
  }

  public async updateAssignedUserAccess(
    currentWallId: number,
    targetUserId: number,
    updateUserAccessDto: UpdateUserAccessDto,
    user,
  ): Promise<void> {
    if (!user || (!user.sub && !user.id)) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { access_type } = updateUserAccessDto;

    const requestingUser = await this.userRepository.getByEmail(user.email);
    if (!requestingUser) {
      throw new NotFoundException('Requesting user not found');
    }

    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const currentWall = await this.wallRepository.findOne({
      where: { id: currentWallId },
      relations: ['user'],
    });
    if (!currentWall) {
      throw new NotFoundException('Current wall not found');
    }

    const isOwner = currentWall.user.id === user.id;
    const isAdmin = requestingUser.access_type === AccessType.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update user access for this wall.',
      );
    }

    if (isOwner && targetUserId === user.id) {
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
}
