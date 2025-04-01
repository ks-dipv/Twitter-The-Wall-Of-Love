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
import { ConfigService } from '@nestjs/config';
import { User } from '../entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokenProvider: GenerateTokenProvider,
    private readonly uploadService: UploadService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  public async signup(
    signupDto: SignUpDto,
    profileImage?: Express.Multer.File,
  ): Promise<void> {
    try {
      const existUser = await this.userRepository.getByEmail(signupDto.email);
      if (existUser)
        throw new BadRequestException('User already exists, enter a new email');

      let profilePicUrl: string | null = null;
      if (profileImage) {
        if (!profileImage.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
          throw new BadRequestException(
            'Invalid file format. Allowed: JPG, JPEG, PNG',
          );
        }
        profilePicUrl = await this.uploadService.uploadImage(profileImage);
      }

      const newUser = this.userRepository.create({
        ...signupDto,
        password: await this.hashingProvider.hashPassword(signupDto.password),
        profile_pic: profilePicUrl,
        is_email_verified: false,
      });

      newUser.email_verification_token =
        await this.generateTokenProvider.generateVarificationToken(newUser);
      const verificationToken = newUser.email_verification_token;

      await this.userRepository.save(newUser);

      // Send Verification Email
      const baseUrl = this.configService.get('appConfig.baseUrl');
      const verificationUrl = `${baseUrl}/verify-email/${verificationToken}`;
      await this.mailService.sendVerificationEmail(
        verificationUrl,
        signupDto.email,
      );
    } catch (error) {
      console.log(error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Signup failed');
    }
  }

  public async resendVerificationEmail(email: string): Promise<void> {
    try {
      // Find the user by email
      const user = await this.userRepository.getByEmail(email);

      // Check if user exists
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if the email is already verified
      if (user.is_email_verified) {
        throw new BadRequestException('Email is already verified');
      }

      // Generate a new verification token
      user.email_verification_token =
        await this.generateTokenProvider.generateVarificationToken(user);
      const verificationToken = user.email_verification_token;

      // Save the updated user with new token
      await this.userRepository.save(user);

      // Send the verification email
      const baseUrl = this.configService.get('appConfig.baseUrl');
      const verificationUrl = `${baseUrl}/verify-email/${verificationToken}`;
      await this.mailService.sendVerificationEmail(verificationUrl, email);
    } catch (error) {
      console.log(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException(
        'Failed to resend verification email',
      );
    }
  }

  public async verifyEmail(token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email_verification_token: token },
    });
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.is_email_verified = true;
    user.email_verification_token = null;
    await this.userRepository.save(user);

    return user;
  }

  public async signIn(signInDto: SignInDto, res): Promise<object> {
    try {
      const user = await this.userRepository.getByEmail(signInDto.email);
      if (!user) throw new NotFoundException('User not found');

      if (!user.is_email_verified) {
        throw new UnauthorizedException(
          'Email is not verified. Please check your email.',
        );
      }

      const isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
      if (!isEqual) throw new UnauthorizedException('Incorrect Password');

      const token = await this.generateTokenProvider.generateTokens(user);
      res.cookie('access_token', token, { httpOnly: true });

      return {
        token,
      };
    } catch (error) {
      console.log(error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      )
        throw error;
      throw new InternalServerErrorException('Sign-in failed');
    }
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

  public async resetPasswordRequest(email: string): Promise<void> {
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

      const baseUrl = this.configService.get('appConfig.baseUrl');
      const url = `${baseUrl}/reset-password/${token}`;
      const arrayToken = token.split('.');
      const tokenPayload = JSON.parse(atob(arrayToken[1]));
      const userEmail = tokenPayload.email;

      await this.mailService.sendResetPassword(url, userEmail);
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to send reset password email',
      );
    }
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    try {
      const user = await this.userRepository.getResetPasswordToken(token);
      if (!user) throw new NotFoundException('Invalid or expired token');

      user.password = await this.hashingProvider.hashPassword(password);
      user.reset_password_token = null;

      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  public async apiKeyGenerate(user) {
    try {
      const existingUser = await this.userRepository.getByEmail(user.email);
      if (!existingUser) throw new NotFoundException("User doesn't exist");

      if (existingUser.api_token) return existingUser.api_token;

      const token =
        await this.generateTokenProvider.generateApiToken(existingUser);
      existingUser.api_token = token;

      await this.userRepository.save(existingUser);
      return {
        token,
      };
    } catch (error) {
      console.log(error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Failed to generate API key');
    }
  }
}
