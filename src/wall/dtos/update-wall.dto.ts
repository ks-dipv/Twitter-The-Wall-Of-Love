import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { WallVisibility } from '../enum/wall-visibility.enum';

export class UpdateWallDto {
    @IsOptional()
    @IsString()
    @MaxLength(250)
    title?: string;

    @IsOptional()
    @IsString()
    logo?: string;

    @IsOptional()
    @IsString()
    @MaxLength(250)
    description?: string;

    @IsOptional()
    @IsEnum(WallVisibility)
    visibility?: WallVisibility;
}
