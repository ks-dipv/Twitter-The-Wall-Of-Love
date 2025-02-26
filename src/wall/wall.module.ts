import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
import { Tweets } from './entity/tweets.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Wall]),TypeOrmModule.forFeature([Tweets])]
})
export class WallModule { }
