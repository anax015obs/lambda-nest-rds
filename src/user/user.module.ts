import { Module } from "@nestjs/common";
import { PrismaService } from "../lib/prisma.service";
import { LoggerModule } from "../logger/logger.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [LoggerModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService, PrismaService],
})
export class UserModule {}
