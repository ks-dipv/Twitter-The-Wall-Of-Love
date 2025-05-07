import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository, FindOptionsWhere } from 'typeorm';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { Paginated } from '../interfaces/paginated.interface';

@Injectable()
export class PaginationService {
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQuery: PaginationQueryDto,
    repository: Repository<T>,
    whereCondition?: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    orderBy?: Record<string, 'ASC' | 'DESC'>,
  ): Promise<Paginated<T>> {
    const queryOptions: any = {
      skip: (paginationQuery.page - 1) * paginationQuery.limit,
      take: paginationQuery.limit,
    };

    if (whereCondition) {
      queryOptions.where = whereCondition;
    }

    if (orderBy) {
      queryOptions.order = orderBy;
    }

    // Execute the query with all conditions
    const results = await repository.find(queryOptions);

    // Count total items with the same filters
    const totalItems = await repository.count({ where: whereCondition });

    const totalPages = Math.ceil(totalItems / paginationQuery.limit);
    const nextPage =
      paginationQuery.page === totalPages
        ? paginationQuery.page
        : paginationQuery.page + 1;

    const previousPage =
      paginationQuery.page === 1
        ? paginationQuery.page
        : paginationQuery.page - 1;

    const finalResponse: Paginated<T> = {
      data: results,
      meta: {
        itemsPerPage: paginationQuery.limit,
        totalItems: totalItems,
        currentPage: paginationQuery.page,
        totalPages: totalPages,
      },
      links: {
        first: `/api/resource?limit=${paginationQuery.limit}&page=1`,
        last: `/api/resource?limit=${paginationQuery.limit}&page=${totalPages}`,
        current: `/api/resource?limit=${paginationQuery.limit}&page=${paginationQuery.page}`,
        next: `/api/resource?limit=${paginationQuery.limit}&page=${nextPage}`,
        previous: `/api/resource?limit=${paginationQuery.limit}&page=${previousPage}`,
      },
    };
    return finalResponse;
  }
}
