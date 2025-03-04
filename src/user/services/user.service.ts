import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from '../dtos/signup.dto';
import { HashingProvider } from './hashing.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { SignInDto } from '../dtos/signin.dto';
import { UploadService } from './upload.service';
import { UpdateDto } from '../dtos/update.dto';
import { MailService } from './mail.service';
import { UserRepository } from '../repositories/user.repository';
import { REQUEST_USER_KEY } from '../constants/auth.constant';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,

    private readonly hashingProvider: HashingProvider,

    /**
     * generate token provider
     */
    private readonly generateTokenProvider: GenerateTokenProvider,

    private readonly uploadService: UploadService,

    private readonly mailService: MailService,
  ) {}

  public async signup(
    signupDto: SignUpDto,
    profileImage?: Express.Multer.File,
  ) {
    const existUser = await this.userRepository.getByEmail(signupDto.email);

    if (existUser) {
      throw new BadRequestException('user already exist, enter a new email');
    }

    let profilePicUrl: string | null = null;

    // Upload profile image to MinIO if provided
    if (profileImage) {
      profilePicUrl = await this.uploadService.uploadImage(profileImage);
    }

    const newUser = this.userRepository.create({
      ...signupDto,
      password: await this.hashingProvider.hashPassword(signupDto.password),
      profile_pic: profilePicUrl,
    });
    return await this.userRepository.save(newUser);
  }

  public async signIn(signInDto: SignInDto, res) {
    //find the user using email ID
    // throw an exception user not password
    const user = await this.userRepository.getByEmail(signInDto.email);

    //compare password to the hash
    let isEqual: boolean = false;

    try {
      isEqual = await this.hashingProvider.comparePassword(
        signInDto.password,
        user.password,
      );
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: 'Could not compare the password',
      });
    }

    if (!isEqual) {
      throw new UnauthorizedException('Incorrect Password');
    }

    const token = await this.generateTokenProvider.generateTokens(user);

    res.cookie('access_token', token, {
      httpOnly: true,
    });

    res.send('Login Successful!');
  }

  public async update(
    req: Request,
    updateDto: UpdateDto,
    profileImage?: Express.Multer.File,
  ) {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);

    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    let profilePicUrl: string | null = existingUser.profile_pic;

    if (profileImage) {
      if (existingUser.profile_pic) {
        const fileName = existingUser.profile_pic.split('/').pop();
        if (fileName) {
          await this.uploadService.deleteImage(fileName);
        }
      }
      profilePicUrl = await this.uploadService.uploadImage(profileImage);
    }

    existingUser.email = updateDto.email ?? existingUser.email;
    existingUser.name = updateDto.name ?? existingUser.name;
    existingUser.profile_pic = profilePicUrl;

    return await this.userRepository.save(existingUser);
  }

  public async remove(req: Request) {
    const user = req[REQUEST_USER_KEY];

    const existuser = await this.userRepository.getById(user.sub);

    if (!existuser) {
      throw new BadRequestException("User doesn't exist");
    }

    if (existuser.profile_pic) {
      const fileName = existuser.profile_pic.split('/').pop();
      if (fileName) {
        await this.uploadService.deleteImage(fileName);
      }
    }

    await this.userRepository.delete(user.sub);

    return { deleted: true };
  }

  public async resetPasswordRequest(email: string) {
    const user = await this.userRepository.getByEmail(email);

    if (!user) {
      throw new BadRequestException("user Doesn't exist");
    }

    user.reset_password_token =
      (await this.generateTokenProvider.generateResetPasswordToken(user)) ??
      null;

    await this.userRepository.save(user);

    const token = user.reset_password_token;

    const url = `http://localhost:3000/api/user/auth/reset-password/${token}`;

    const arrayToken = token.split('.');
    const tokenPayload = JSON.parse(atob(arrayToken[1]));
    const userEmail = tokenPayload.email;

    await this.mailService.sendResetPassword(url, userEmail);

    return 'Email Sent Successfully';
  }

  public async resetPassword(token: string, password: string) {
    const user = await this.userRepository.getResetPasswordToken(token);

    user.password =
      (await this.hashingProvider.hashPassword(password)) ?? user.password;
    user.reset_password_token = null;

    await this.userRepository.save(user);
    return 'Password Reset Successfully';
  }

  public async validateOrCreateUser(profile: any) {
    const { id: twitterId, username, emails, photos } = profile;

    // Extract email if available
    const email = emails?.[0]?.value || null;

    // Check if a user already exists by Twitter ID or Email
    let user = await this.userRepository.findOne({
      where: { twitter_id: twitterId }, // Find by Twitter ID
    });

    if (!user) {
      user = this.userRepository.create({
        twitter_id: twitterId,
        name: username,
        email: email, // May be null
        profile_pic: photos?.[0]?.value || null,
      });

      await this.userRepository.save(user);
    }

    return user;
  }
}
