import { WallAccess } from 'src/role/entity/wall-access.entity';
import { Wall } from '../entity/wall.entity';

export class WallDto {
  public id: number;
  public title: string;
  public description: string;
  public logo: string;
  public createdAt: Date;

  constructor(wall: Wall) {
    this.id = wall.id;
    this.title = wall.title;
    this.description = wall.description;
    this.logo = wall.logo;
    this.createdAt = wall.created_at;
  }

  static toDto(wall: Wall): WallDto {
    return new WallDto(wall);
  }
}

export class AssignedWithMeDto {
  public wall: WallDto;
  public assignedMe: string;
  public assignedAt: Date;
  public accessType: string;

  constructor(wallAccess: WallAccess) {
    this.wall = WallDto.toDto(wallAccess.wall);
    this.assignedMe = wallAccess.assigned_by.email ;
    this.assignedAt = wallAccess.created_at;
    this.accessType = wallAccess.access_type;
  }

  static toDto(wallAccess: WallAccess): AssignedWithMeDto {
    return new AssignedWithMeDto(wallAccess);
  }
}

export class GetAssignedUserDto {
  public email: string;
  public access_type: string;
  public assigned_at: Date;

  constructor(access: WallAccess) {
    this.email = access.user.email;
    this.access_type = access.access_type;
    this.assigned_at = access.created_at;
  }

  static toDto(access: WallAccess): GetAssignedUserDto {
    return new GetAssignedUserDto(access);
  }
}
