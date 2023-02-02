import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import { LoggerService } from "../logger/logger.service";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private logger: LoggerService, private userService: UserService) {
    this.logger.setContext(AuthService.name);
  }

  async issueJwt(userArgs: Pick<Prisma.UserCreateInput, "email" | "name" | "picture">): Promise<string> {
    const user = await this.userService.upsertUser(userArgs);
    const jwt = await this.jwtService.signAsync(user);
    this.logger.log(`jwt issued for user ${user.email}(${user.id})`, jwt);
    return jwt;
  }
}
