import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
import { Tweets } from './entity/tweets.entity';
import { SocialLink } from './entity/social-links.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Wall, SocialLink, Tweets])]
})
export class WallModule { }
