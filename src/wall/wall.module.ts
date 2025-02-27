import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
import { Tweet } from './entity/tweets.entity';
import { SocialLink } from './entity/social-links.entity';
import { WallController } from './wall.controller';
import { WallService } from './service/wall.service';
import { WallRepository } from './repository/wall.repository';
import { TweetService } from './service/tweet.service';
import { TweetController } from './tweet.controller';
import { TwitterService } from './service/twitter.service';
import { TweetRepository } from './repository/tweet.repository';
// import { TweetRepository } from './repository/tweet.repository';
@Module({
    imports: [TypeOrmModule.forFeature([Wall, SocialLink, Tweet])],
    controllers: [WallController, TweetController],
    providers: [WallService,WallRepository, TweetService,TwitterService, TweetRepository],
    exports:[WallRepository, TweetRepository]
})
export class WallModule { }
