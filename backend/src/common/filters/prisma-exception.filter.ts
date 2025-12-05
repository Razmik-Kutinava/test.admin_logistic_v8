import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle Prisma errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Unique constraint violation';
          error = 'Conflict';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'Not Found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint violation';
          error = 'Bad Request';
          break;
        case 'P2021':
          status = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Database tables do not exist. Please run migrations first.';
          error = 'Service Unavailable';
          break;
        default:
          this.logger.error(`Prisma error: ${exception.code}`, exception.stack);
          message = 'Database error occurred';
      }
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      this.logger.error('Prisma unknown error', exception.stack);
      message = 'Database connection error';
    } else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      this.logger.error('Prisma panic error', exception.stack);
      message = 'Database engine error';
    } else if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error('Prisma initialization error', exception.stack);
      message = 'Database initialization failed. Please check your database connection.';
      status = HttpStatus.SERVICE_UNAVAILABLE;
      error = 'Service Unavailable';
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database validation error';
      error = 'Bad Request';
      this.logger.error('Prisma validation error', exception.stack);
    } else if (exception instanceof Error) {
      // Handle other errors
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      message = exception.message || 'Internal server error';
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}

