import { AccessType } from '../enum/access-type.enum';
import { AssignedWallDto } from './assigned-wall.dto';

export class AssignedByMeResponseDto {
  assigned_me: string;
  wall: AssignedWallDto;
  assigned_at: Date;
  access_type: AccessType;
}
