import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';

@Module({
  providers: [PaginationService]
})
export class PaginationModule {}
