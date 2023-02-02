import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { GoogleStrategy } from "../lib/google.strategy";
import { JwtStrategy } from "../lib/jwt.strategy";
import { LoggerModule } from "../logger/logger.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    LoggerModule,
    UserModule,
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: process.env.JWT_EXPIRES_IN } }),
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtStrategy, AuthService],
})
export class AuthModule {}
