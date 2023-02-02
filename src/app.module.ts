import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import errorCodeConfig from "./config/error-code.config";
import { PrismaService } from "./lib/prisma.service";
import { LoggerModule } from "./logger/logger.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      load: [errorCodeConfig],
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
