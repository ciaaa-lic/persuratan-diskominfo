import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  status: string;
  message: string;
  data: T;
}

interface StructuredResponse<T> {
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          const structured = data as StructuredResponse<T>;
          return {
            status: 'success',
            message: structured.message,
            data: structured.data,
          };
        }

        return {
          status: 'success',
          message: 'Success',
          data: data as T,
        };
      }),
    );
  }
}
