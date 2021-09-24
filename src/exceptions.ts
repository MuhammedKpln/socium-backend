import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TypeORMError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    console.error(exception);

    if (exception instanceof TypeORMError) {
      if (exception['errno'] === 19) {
        return response.status(HttpStatus.NOT_ACCEPTABLE).json({
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: exception['response'],
    });
  }
}
