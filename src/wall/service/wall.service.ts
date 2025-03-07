import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WallRepository } from '../repository/wall.repository';
import { CreateWallDto } from '../dtos/create-wall.dto';
import { Wall } from '../entity/wall.entity';
import { UpdateWallDto } from '../dtos/update-wall.dto';
import { REQUEST_USER_KEY } from 'src/user/constants/auth.constant';
import { UserRepository } from 'src/user/repositories/user.repository';
import { UploadService } from 'src/user/services/upload.service';
import { SocialLink } from '../entity/social-links.entity';
import { SocialPlatform } from '../enum/social-platform.enum';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from 'typeorm';
import { WallVisibility } from '../enum/wall-visibility.enum';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class WallService {
  constructor(
    private readonly wallRepository: WallRepository,
    private readonly userRepository: UserRepository,
    private readonly uploadService: UploadService,

    @InjectRepository(SocialLink)
    private readonly socialLinkRepository: Repository<SocialLink>,
  ) { }

  // Generate links
  private generateLinks(): { shareable_link: string; embed_link: string } {
    const uniqueId = uuidv4();
    const baseUrl = 'http://localhost:3000/';

    return {
      shareable_link: `${baseUrl}api/walls/share/${uniqueId}`,
      embed_link: `<iframe src="${baseUrl}/walls/embed/${uniqueId}" width="600" height="400" style="border:none;"></iframe>`,
    };
  }

  // Create wall
  async createWall(
    createWallDto: CreateWallDto,
    req: Request,
    wallLogo?: Express.Multer.File,
  ) {
    const user = req[REQUEST_USER_KEY];
    const { title, logo, description, visibility } = createWallDto;

    let logoUrl: string | null = logo || null;

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (wallLogo) {
      logoUrl = await this.uploadService.logo(wallLogo);
    }


    const wall = this.wallRepository.create({
      title,
      logo: logoUrl,
      description,
      visibility,
      user: existingUser,
      ...this.generateLinks(),  // 🔹 Generate unique links here
    });


    const savedWall = await this.wallRepository.save(wall);

    if (createWallDto.social_links && createWallDto.social_links.length > 0) {
      const socialLinksEntities = createWallDto.social_links.map((link) =>
        this.socialLinkRepository.create({
          platform: link.platform as SocialPlatform,
          url: link.url,
          wall: savedWall,
        }),
      );
      await this.socialLinkRepository.save(socialLinksEntities);
      savedWall.social_links = socialLinksEntities;
    }

    return savedWall;
  }

  async getAllWalls(req: Request): Promise<Wall[]> {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    return await this.wallRepository.find({
      where: { user: { id: existingUser.id } },
    });
  }

  // Get wall bY ID
  async getWallById(id: number, req: Request): Promise<Wall> {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    const wall = await this.wallRepository.getById(id);

    if (!wall || wall.user.id !== existingUser.id) {
      throw new NotFoundException('Wall not found or access denied');
    }

    return wall;
  }

  // Get wall by sharable Link 
  async getWallBySharableLink(sharableLink: string): Promise<Wall> {
    console.log('Searching wall with shareable link:', sharableLink);

    const wall = await this.wallRepository.findOne({ where: { shareable_link: Like(`%${sharableLink}`) } });

    if (!wall) {
      throw new NotFoundException('Wall not found');
    }

    // Check if wall is private
    if (wall.visibility === WallVisibility.PRIVATE) {
      throw new UnauthorizedException('This Wall is private and cannot be accessed via sharable link');
    }

    return wall;
  }


  async deleteWall(id: number, req: Request) {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    const wall = await this.wallRepository.getById(id);

    if (!wall || wall.user.id !== existingUser.id) {
      throw new NotFoundException('Wall not found or access denied');
    }

    await this.wallRepository.delete(id);
    return { message: 'Wall deleted successfully' };
  }

  async updateWall(
    id: number,
    updateWallDto: UpdateWallDto,
    req: Request,
    logo?: Express.Multer.File,
  ): Promise<Wall> {
    const user = req[REQUEST_USER_KEY];

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const existingUser = await this.userRepository.getByEmail(user.email);

    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }

    // Find the existing wall
    const wall = await this.wallRepository.getById(id);

    if (!wall) {
      throw new NotFoundException(`Wall with ID ${id} not found`);
    }

    // Ensure the user owns the wall
    if (wall.user.id !== existingUser.id) {
      throw new NotFoundException(
        'You do not have permission to update this wall',
      );
    }

    let logoUrl: string | null = wall.logo;

    if (logo) {
      if (wall.logo) {
        const fileName = wall.logo.split('/').pop();
        if (fileName) {
          await this.uploadService.deleteLogo(fileName);
        }
      }

      logoUrl = await this.uploadService.logo(logo);
    }

    // Update wall properties
    wall.title = updateWallDto.title ?? wall.title;
    wall.description = updateWallDto.description ?? wall.description;
    wall.visibility = updateWallDto.visibility ?? wall.visibility;
    wall.logo = logoUrl;

    // Update Social Links (Replace old ones)
    if (updateWallDto.social_links && updateWallDto.social_links.length > 0) {

      for (const linkDto of updateWallDto.social_links) {
        // Find the existing social link by platform
        const existingLink = wall.social_links.find(
          (link) => link.platform === linkDto.platform,
        );

        if (existingLink) {
          // Update the existing social link
          existingLink.url = linkDto.url;
          await this.socialLinkRepository.save(existingLink);
        } else {
          // If no existing link is found, create a new one
          const newSocialLink = this.socialLinkRepository.create({
            platform: linkDto.platform,
            url: linkDto.url,
            wall,
          });
          await this.socialLinkRepository.save(newSocialLink);
          wall.social_links.push(newSocialLink);
        }
      }
    }

    return await this.wallRepository.save(wall);
  }

  // Delete a social link by id 
  async deleteSocialLink(id: number, req: Request): Promise<{ message: string }> {
    const user = req[REQUEST_USER_KEY];
  
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
  
    const existingUser = await this.userRepository.getByEmail(user.email);
    if (!existingUser) {
      throw new BadRequestException("User doesn't exist");
    }
  
    const socialLink = await this.socialLinkRepository.findOne({
      where: { id },
      relations: ['wall'],
    });
  
    if (!socialLink) {
      throw new NotFoundException('Social link not found');
    }
  
    if (socialLink.wall.user.id !== existingUser.id) {
      throw new UnauthorizedException('You do not have permission to delete this social link');
    }
  
    await this.socialLinkRepository.delete(id);
    return { message: 'Social link deleted successfully' };
  }
  


}
