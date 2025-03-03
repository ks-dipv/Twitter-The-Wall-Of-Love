import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
import { Tweets } from './entity/tweets.entity';
import { SocialLink } from './entity/social-links.entity';
import { WallController } from './wall.controller';
import { WallService } from './service/wall.service';
import { WallRepository } from './repository/wall.repository';
@Module({
    imports: [TypeOrmModule.forFeature([Wall, SocialLink, Tweets])],
    controllers: [WallController],
    providers: [WallService,WallRepository],
    exports:[WallRepository]
})
export class WallModule { }
