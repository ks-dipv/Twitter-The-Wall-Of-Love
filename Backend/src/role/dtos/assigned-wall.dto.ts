import { WallVisibility } from 'src/wall/enum/wall-visibility.enum';

export class AssignedWallDto {
  id: number;
  name: string;
  logo: string;
  description: string;
  wall_visibility: WallVisibility;
  created_at: Date;
}
