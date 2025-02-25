import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wall } from './entity/wall.entity';
@Module({
    imports: [TypeOrmModule.forFeature([Wall])]
})
export class WallModule { }
