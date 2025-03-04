import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
import { Tweets } from './entity/tweets.entity';
import { SocialLink } from './entity/social-links.entity';
import { WallController } from './wall.controller';
import { WallService } from './service/wall.service';
import { WallRepository } from './repository/wall.repository';
import { UserModule } from 'src/user/user.module';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UploadService } from 'src/user/services/upload.service';
@Module({
  imports: [TypeOrmModule.forFeature([Wall, SocialLink, Tweets]), UserModule],
  controllers: [WallController],
  providers: [WallService, WallRepository, UserRepository, UploadService],
  exports: [WallRepository],
})
export class WallModule {}
