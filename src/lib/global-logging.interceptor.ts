import { CallHandler, ExecutionContext, Injectable, NestInterceptor, ConsoleLogger } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class GlobalLoggingInterceptor implements NestInterceptor {
  constructor(private logger: ConsoleLogger) {
    this.logger.setContext(GlobalLoggingInterceptor.name);
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const { method, originalUrl, headers, cookies, params, query, body, baseUrl } = ctx.getRequest<Request>();
    this.logger.log(`${method} ${originalUrl}`, {
      method,
      originalUrl,
      headers,
      cookies,
      params,
      query,
      body,
      baseUrl,
    });
    return next.handle();
  }
}
