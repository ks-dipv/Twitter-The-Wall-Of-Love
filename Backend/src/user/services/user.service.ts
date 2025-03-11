import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { HashingProvider } from './hashing.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { SignInDto } from '../dtos/signin.dto';
import { UploadService } from '../../common/services/upload.service';
import { UpdateDto } from '../dtos/update.dto';
import { MailService } from './mail.service';
import { UserRepository } from '../repositories/user.repository';
import { REQUEST_USER_KEY } from '../../common/constants/auth.constant';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService,
  ) {}

  public async signup(
    signupDto: SignUpDto,
    profileImage?: Express.Multer.File,
  ) {
    try {
      const existUser = await this.userRepository.getByEmail(signupDto.email);
      if (existUser)
        throw new BadRequestException('User already exists, enter a new email');

      let profilePicUrl: string | null = null;
      if (profileImage) {
        profilePicUrl = await this.uploadService.uploadImage(profileImage);
      }

      const newUser = this.userRepository.create({
        ...signupDto,
        password: await this.hashingProvider.hashPassword(signupDto.password),
        profile_pic: profilePicUrl,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Signup failed');
    }
  }

  public async signIn(signInDto: SignInDto, res) {
    try {
      const user = await this.userRepository.getByEmail(signInDto.email);
      if (!user) throw new NotFoundException('User not found');

      const isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
      if (!isEqual) throw new UnauthorizedException('Incorrect Password');

      const token = await this.generateTokenProvider.generateTokens(user);
      res.cookie('access_token', token, { httpOnly: true });
      res.send(token);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      )
        throw error;
      throw new InternalServerErrorException('Sign-in failed');
    }
  }

  public async update(
    req: Request,
    updateDto: UpdateDto,
    profileImage?: Express.Multer.File,
  ) {
    try {
      const user = req[REQUEST_USER_KEY];
      if (!user) throw new UnauthorizedException('User not authenticated');

      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new NotFoundException("User doesn't exist");

      let profilePicUrl: string | null = existingUser.profile_pic;
      if (profileImage) {
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
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Update failed');
    }
  }

  public async remove(req: Request) {
    try {
      const user = req[REQUEST_USER_KEY];
      if (!user) throw new UnauthorizedException('User not authenticated');

      const existUser = await this.userRepository.getById(user.sub);
      if (!existUser) throw new NotFoundException("User doesn't exist");

      if (existUser.profile_pic) {
        const fileName = existUser.profile_pic.split('/').pop();
        if (fileName) await this.uploadService.deleteImage(fileName);
      }

      await this.userRepository.delete(user.sub);
      return { id: user.sub };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  public async resetPasswordRequest(email: string) {
    try {
      const user = await this.userRepository.getByEmail(email);
      if (!user) throw new NotFoundException("User doesn't exist");

      user.reset_password_token =
        await this.generateTokenProvider.generateResetPasswordToken(user);
      await this.userRepository.save(user);

      const token = user.reset_password_token;
      if (!token)
        throw new InternalServerErrorException(
          'Failed to generate reset password token',
        );

      const url = `http://localhost:5173/reset-password/${token}`;
      const arrayToken = token.split('.');
      const tokenPayload = JSON.parse(atob(arrayToken[1]));
      const userEmail = tokenPayload.email;

      await this.mailService.sendResetPassword(url, userEmail);
      return 'Email Sent Successfully';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to send reset password email',
      );
    }
  }

  public async resetPassword(token: string, password: string) {
    try {
      const user = await this.userRepository.getResetPasswordToken(token);
      if (!user) throw new NotFoundException('Invalid or expired token');

      user.password = await this.hashingProvider.hashPassword(password);
      user.reset_password_token = null;

      await this.userRepository.save(user);
      return 'Password Reset Successfully';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  public async apiKeyGenerate(req: Request) {
    try {
      const user = req[REQUEST_USER_KEY];
      if (!user) throw new UnauthorizedException('User not authenticated');

      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new NotFoundException("User doesn't exist");

      if (existingUser.api_token) return existingUser.api_token;

      const token =
        await this.generateTokenProvider.generateApiToken(existingUser);
      existingUser.api_token = token;

      await this.userRepository.save(existingUser);
      return token;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Failed to generate API key');
    }
  }
}
