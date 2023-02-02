import { ArgumentsHost, Catch, ExceptionFilter, ConsoleLogger } from "@nestjs/common";
import { Response } from "express";
import httpStatus from "http-status";
import { HttpException } from "../lib/http-exception";
import { LoggerService } from "../logger/logger.service";

type HttpExceptionOrError<T extends HttpException | Error> = T extends HttpException ? HttpException : Error;

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private logger: ConsoleLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }
  catch<T extends HttpException | Error>(exception: HttpExceptionOrError<T>, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    this.logger.error(exception, GlobalExceptionFilter.name);
    if (exception instanceof HttpException) {
      const resObj = {
        code: exception.code,
        message: exception.message,
        body: exception.body,
      };
      response.status(exception.statusCode).json(resObj);
    } else {
      response.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        code: httpStatus["500_NAME"],
        message: httpStatus["500_MESSAGE"],
      });
    }
  }
}
