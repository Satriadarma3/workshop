import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { SESSION_EXPIRED_MESSAGE } from '../constants';

/** Semua error dibalas { message, errors? } supaya langsung bisa ditampilkan frontend. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.normalize(exception);
    res.status(status).json(body);
  }

  private normalize(exception: unknown): { status: number; body: { message: string; errors?: unknown } } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      let message: string;
      let errors: unknown;

      if (typeof response === 'string') {
        message = response;
      } else {
        const obj = response as Record<string, any>;
        message = Array.isArray(obj.message) ? String(obj.message[0]) : (obj.message ?? exception.message);
        errors = obj.errors;
      }

      if (status === 401 && message === 'Unauthorized') message = SESSION_EXPIRED_MESSAGE;
      if (status === 404 && /^Cannot (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/.test(message))
        message = 'Endpoint tidak ditemukan.';

      return { status, body: errors ? { message, errors } : { message } };
    }

    // Galat dari body-parser (mis. JSON rusak) membawa status 4xx sendiri
    const status = (exception as any)?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return { status: 400, body: { message: 'Format permintaan tidak valid.' } };
    }

    this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : String(exception));
    return { status: 500, body: { message: 'Terjadi kesalahan pada server.' } };
  }
}
