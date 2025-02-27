import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from '../dtos/signup.dto';
import { HashingProvider } from './hashing.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { SignInDto } from '../dtos/signin.dto';
import { UploadService } from './upload.service';
import { UpdateDto } from '../dtos/update.dto';
import { MailService } from './mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

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
    const existUser = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });

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

  public async signIn(signInDto: SignInDto) {
    //find the user using email ID
    // throw an exception user not password
    const user = await await this.userRepository.findOne({
      where: { email: signInDto.email },
    });

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

    return await this.generateTokenProvider.generateTokens(user);
  }

  public async update(
    id: number,
    updateDto: UpdateDto,
    profileImage?: Express.Multer.File,
  ) {
    const user = await this.userRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new BadRequestException("user doesn't exist");
    }

    let profilePicUrl: string | null = null;

    // Upload profile image to MinIO if provided
    if (profileImage) {
      profilePicUrl = await this.uploadService.uploadImage(profileImage);
    }

    user.email = updateDto.email ?? user.email;
    user.name = updateDto.name ?? user.name;
    user.profile_pic = profilePicUrl ?? user.profile_pic;

    return await this.userRepository.save(user);
  }

  public async remove(id: number) {
    await this.userRepository.delete(id);

    return { id, Deleted: true };
  }

  public async resetPasswordRequest(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
    });

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
    const user = await this.userRepository.findOne({
      where: {
        reset_password_token: token,
      },
    });

    user.password =
      (await this.hashingProvider.hashPassword(password)) ?? user.password;
    user.reset_password_token = null;

    await this.userRepository.save(user);
    return 'Password Reset Successfully';
  }
}
