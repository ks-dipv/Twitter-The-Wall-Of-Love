import { Controller, Get } from '@nestjs/common';
import { PlanService } from './service/plan.service';
import { Auth } from 'src/common/decorator/auth.decorator';
import { AuthType } from 'src/common/enum/auth-type.enum';
@Controller('api/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  @Auth(AuthType.None)
  getAllPlans() {
    return this.planService.getAllPlans();
  }
}
