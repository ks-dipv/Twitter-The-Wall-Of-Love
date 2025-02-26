import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
import { Tweets } from './entity/tweets.entity';
import { SocialLink } from './entity/social-links.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Wall]),TypeOrmModule.forFeature([Tweets]),TypeOrmModule.forFeature([SocialLink])]
})
export class WallModule { }
