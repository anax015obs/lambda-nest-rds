import { NestApplication, NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import session from "express-session";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./lib/global-exception.filter";
import { GlobalLoggingInterceptor } from "./lib/global-logging.interceptor";
import { LoggerService } from "./logger/logger.service";

export const getApp = async () => {
  const logger = new LoggerService(NestApplication.name);
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.enableCors({
    origin: "*",
    allowedHeaders: ["Authorization"],
  });
  app.use(
    session({
      secret: "my-secret",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.useLogger(logger);
  app.use(cookieParser());
  app.useGlobalInterceptors(new GlobalLoggingInterceptor(logger));
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  return app;
};
