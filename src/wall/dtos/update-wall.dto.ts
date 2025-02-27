import { IsEnum, IsOptional, IsString,IsArray,ValidateNested, MaxLength } from 'class-validator';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { Type } from 'class-transformer';
import { SocialLinkDto } from './social-link.dto';
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

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SocialLinkDto)
    social_links?: SocialLinkDto[];
}
