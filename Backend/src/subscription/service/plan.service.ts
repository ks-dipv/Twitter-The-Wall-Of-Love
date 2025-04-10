import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entity/plan.entity';
import { CreatePlanDto } from '../dtos/plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async createPlan(createPlanDto: CreatePlanDto) {
    const plan = this.planRepository.create(createPlanDto);
    return await this.planRepository.save(plan);
  }

  async getAllPlans() {
    return await this.planRepository.find();
  }
}
