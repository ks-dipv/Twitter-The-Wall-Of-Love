import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
import { Tweets } from './entity/tweets.entity';
import { SocialLink } from './entity/social-links.entity';
import { WallController } from './wall.controller';
import { WallService } from './service/wall.service';
import { WallRepository } from './repository/wall.repository';
import { TweetService } from './service/tweet.service';
import { TweetController } from './tweet.controller';
import { TwitterService } from './service/twitter.service';
import { TweetRepository } from './repository/tweet.repository';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/repositories/user.repository';
import { UploadService } from '../common/services/upload.service';
@Module({
  imports: [TypeOrmModule.forFeature([Wall, SocialLink, Tweets]), UserModule],
  controllers: [WallController, TweetController],
  providers: [
    WallService,
    WallRepository,
    UserRepository,
    UploadService,
    TweetService,
    TwitterService,
    TweetRepository,
  ],
  exports: [WallRepository, TweetRepository],
})
export class WallModule {}
