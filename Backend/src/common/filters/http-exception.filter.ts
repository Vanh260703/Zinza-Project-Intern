import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

// @Catch(HttpException) — bắt tất cả HttpException (400, 401, 403, 404, 409...)
// Đảm bảo mọi lỗi trả về cùng 1 format thay vì format mặc định của NestJS
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();

    // getResponse() có thể là string (message đơn) hoặc object (từ ValidationPipe)
    const exceptionResponse = exception.getResponse();
    const isObject =
      typeof exceptionResponse === 'object' && exceptionResponse !== null;

    const message =
      isObject && 'message' in exceptionResponse
        ? (exceptionResponse as Record<string, unknown>).message
        : exceptionResponse;

    const error =
      isObject && 'error' in exceptionResponse
        ? (exceptionResponse as Record<string, unknown>).error
        : exception.message;

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
