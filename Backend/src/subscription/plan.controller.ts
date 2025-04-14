import { Controller, Get } from '@nestjs/common';
import { PlanService } from './service/plan.service';
@Controller('api/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  getAllPlans() {
    return this.planService.getAllPlans();
  }
}
