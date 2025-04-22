import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadService } from 'src/common/services/upload.service';
import { UserRepository } from 'src/user/repositories/user.repository';
import { HashingProvider } from 'src/auth/services/hashing.provider';
import { MailService } from 'src/auth/services/mail.service';
import { SignInDto } from '../dtos/signin.dto';
import { User } from 'src/user/entity/user.entity';
import { SignUpDto } from '../dtos/signup.dto';
import { GenerateTokenProvider } from 'src/common/services/generate-token.provider';

@Injectable()
export class AuthService {
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

    // Check if user is already verified
    if (user.is_email_verified) {
      throw new BadRequestException('Email has already been verified');
    }

    user.is_email_verified = true;
    user.email_verification_token = null;
    await this.userRepository.save(user);

    return user;
  }

  // Add a new method to check if the token is valid
  public async checkVerificationToken(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email_verification_token: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Check if user is already verified
    if (user.is_email_verified) {
      throw new BadRequestException('Email has already been verified');
    }
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

      // Check if token exists on the user
      if (!user.reset_password_token) {
        throw new NotFoundException('This reset link has already been used');
      }

      user.password = await this.hashingProvider.hashPassword(password);
      user.reset_password_token = null;

      await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  public async verifyResetToken(token: string): Promise<void> {
    try {
      const user = await this.userRepository.getResetPasswordToken(token);
      if (!user) throw new NotFoundException('Invalid or expired token');

      // Check if token still exists on the user record
      if (!user.reset_password_token) {
        throw new NotFoundException('This reset link has already been used');
      }
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to verify token');
    }
  }
}
