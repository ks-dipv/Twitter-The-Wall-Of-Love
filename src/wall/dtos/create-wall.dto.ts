import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { WallVisibility } from '../enum/wall-visibility.enum';

export class CreateWallDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(250)
    title: string;

    @IsOptional()
    @IsString()
    logo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(250)
    description?: string;

    @IsEnum(WallVisibility)
    @IsOptional()
    visibility?: WallVisibility;
}
