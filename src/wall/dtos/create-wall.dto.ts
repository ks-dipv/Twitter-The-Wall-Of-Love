import {
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { SocialLinkDto } from './social-link.dto';
import { Type } from 'class-transformer';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  social_links?: SocialLinkDto[];
}
