import { Controller, Get } from '@nestjs/common';
import { PlanService } from './service/plan.service';
import { Auth } from '../common/decorator/auth.decorator';
import { AuthType } from '../common/enum/auth-type.enum';
import { Plan } from './entity/plan.entity';

@Controller('api/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @Auth(AuthType.None)
  async findAll(): Promise<Plan[]> {
    return this.planService.findAll();
  }
}
