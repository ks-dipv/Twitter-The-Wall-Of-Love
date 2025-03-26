import {
  IsEnum,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { SocialLinkDto } from './social-link.dto';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWallDto {
  @ApiProperty({
    description: 'The title of the wall',
    example: 'My Awesome Wall',
    maxLength: 250,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  title: string;

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  social_links?: SocialLinkDto[];
}
