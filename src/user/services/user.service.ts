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
}
