import { ApiPropertyOptional } from '@nestjs/swagger';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { SocialLinkDto } from './social-link.dto';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateWallDto {
  @ApiPropertyOptional({
    description: 'The title of the wall',
    example: 'My Awesome Wall',
    maxLength: 250,
  })
  @IsString()
  @IsOptional()
  @MaxLength(250)
  title?: string;

  @ApiPropertyOptional({
    description: 'The URL of the wall logo',
    example: 'https://example.com/logo.png',
    type: 'file',
    format: 'binary',
  })
  @IsOptional()
  @IsString()
  @Matches(/\.(jpg|jpeg|png)$/i, {
    message: 'Logo must be in JPG, JPEG, or PNG format',
  })
  logo?: any;

  @ApiPropertyOptional({
    description: 'A short description of the wall',
    example: 'This wall showcases the best tweets about our brand.',
    maxLength: 250,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Visibility of the wall',
    enum: WallVisibility,
    example: WallVisibility.PUBLIC,
  })
  @IsEnum(WallVisibility)
  @IsOptional()
  visibility?: WallVisibility;

  @ApiPropertyOptional({
    description: 'List of social media links associated with the wall',
    type: [SocialLinkDto],
  })
  @IsOptional()
  @Type(() => SocialLinkDto)
  social_links?: SocialLinkDto[];
}
