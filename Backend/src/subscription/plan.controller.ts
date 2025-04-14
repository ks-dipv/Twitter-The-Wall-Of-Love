import { Controller, Get } from '@nestjs/common';
import { PlanService } from './service/plan.service';
import { Plan } from './entity/plan.entity';

@Controller('api/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  async findAll(): Promise<Plan[]> {
    return this.planService.findAll();
  }
}
