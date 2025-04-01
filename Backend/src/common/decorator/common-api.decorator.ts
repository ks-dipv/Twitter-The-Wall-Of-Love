// src/common/decorator/common-api.decorator.ts
import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';

export function CommonApiDecorators(options: {
  summary: string;
  successStatus?: number;
  successDescription?: string;
  errorStatus?: number;
  errorDescription?: string;
}) {
  return applyDecorators(
    UseInterceptors(ClassSerializerInterceptor),
    ApiOperation({ summary: options.summary }),
    ApiResponse({
      status: options.successStatus || 200,
      description: options.successDescription || 'Operation successful',
    }),
    ApiResponse({
      status: options.errorStatus || 400,
      description: options.errorDescription || 'Bad request',
    }),
  );
}
