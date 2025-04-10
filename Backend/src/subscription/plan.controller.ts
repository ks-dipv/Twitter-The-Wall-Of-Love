import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlanService } from './service/plan.service';
import { CreatePlanDto } from './dtos/plan.dto';
@Controller('api/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post('new')
  createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.createPlan(createPlanDto);
  }

  @Get()
  getAllPlans() {
    return this.planService.getAllPlans();
  }
}
