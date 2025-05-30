import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { UploadService } from '../../common/services/upload.service';
import { UpdateDto } from '../dtos/update.dto';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entity/user.entity';
import { GoogleUser } from '../interfaces/google-user.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly uploadService: UploadService,
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
        google_id: googleId,
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


  public async getAssignedUsers(wallId: number, user) {
    try {
      const requestingUser = await this.userRepository.getByEmail(user.email);
      if (!requestingUser) {
        throw new NotFoundException('Requesting user not found');
      }

      const wall = await this.wallRepository.findOne({
        where: { id: wallId },
        relations: ['user'],
      });

      if (!wall) {
        throw new NotFoundException('Wall not found');
      }

      let hasAdminAccess = false;

      const wallAccess = await this.wallAccessRepository.findOne({
        where: {
          wall: { id: wallId },
          user: { id: requestingUser.id },
        },
      });

      if (wallAccess?.access_type === AccessType.ADMIN) {
        hasAdminAccess = true;
      }

      if (!(wall.user.id === requestingUser.id) && !hasAdminAccess) {
        throw new ForbiddenException(
          "You do not have permission to view this wall's assigned users.",
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
        userId: access.user.id,
      }));
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to get assigned user',
      );
    }
  }

  public async sentInvitation(email: string, wallId, accessType, user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);

      if (!existingUser) {
        throw new NotFoundException("User doesn't exist");
      }

      const baseUrl = this.configService.get('appConfig.baseUrl');
      const invitationUrl = `${baseUrl}/admin/walls/${wallId}`;

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
    user,
  ): Promise<void> {
    try {
      const requestingUser = await this.userRepository.getByEmail(user.email);
      if (!requestingUser) {
        throw new NotFoundException('Requesting user not found');
      }

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

      if (wall.user.id === requestingUser.id && targetUserId === user.id) {
        throw new BadRequestException('Wall owner cannot remove themselves.');
      }

      await this.wallAccessRepository.delete(access.id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error.message || 'Failed to Delete assigned user',
      );
    }
  }

  public async updateAssignedUserAccess(
    currentWallId: number,
    targetUserId: number,
    updateUserAccessDto: UpdateUserAccessDto,
    user,
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

      let hasAdminAccess = false;

      const wallAccess = await this.wallAccessRepository.findOne({
        where: {
          wall: { id: currentWallId },
          user: { id: requestingUser.id },
        },
      });

      if (wallAccess?.access_type === AccessType.ADMIN) {
        hasAdminAccess = true;
      }

      if (!(currentWall.user.id === requestingUser.id) && !hasAdminAccess) {
        throw new ForbiddenException(
          'You do not have permission to update user access for this wall.',
        );
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

  async getAssignedByme(user) {
    const userId = user.id || user.sub;

    const accesses = await this.wallAccessRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'wall', 'assigned_by'],
      order: { created_at: 'ASC' },
    });

    return accesses.map((access) => ({
      assigned_me: access.assigned_by.email,
      wall: {
        id: access.wall.id,
        name: access.wall.title,
        logo: access.wall.logo,
        description: access.wall.description,
        wall_visibility: access.wall.visibility,
        created_at: access.wall.created_at,
      },
      assigned_at: access.created_at,
      access_type: access.access_type,
    }));
  }
}
