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
import { GenerateTokenProvider } from 'src/common/services/generate-token.provider';
import { GoogleUser } from '../interfaces/google-user.interface';
import { MailService } from 'src/auth/services/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
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

  public async sentInvitationLink(roleId: number, email: string, user: User) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: user.email },
        relations: ['role'],
      });

      if (!existingUser || existingUser.role.id !== 1) {
        throw new NotFoundException(
          'User not found or user does not have admin access',
        );
      }

      const token = await this.generateTokenProvider.generateInvitationToken(
        roleId,
        user,
      );

      const baseUrl = 'http://localhost:3000';
      const invitationUrl = `${baseUrl}/invitation/${token}`;

      await this.mailService.sendInvitationEmail(invitationUrl, email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Failed to send invitation link',
        );
      }
    }
  }
}
