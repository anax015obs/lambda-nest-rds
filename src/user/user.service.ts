import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaService } from "../lib/prisma.service";
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(UserService.name);
  }

  async upsertUser(userArgs: Pick<Prisma.UserCreateInput, "email" | "name" | "picture">): Promise<User> {
    const user = await this.prisma.user.upsert({
      create: {
        email: userArgs.email,
        name: userArgs.name,
        picture: userArgs.picture,
      },
      update: {
        name: userArgs.name,
        picture: userArgs.picture,
      },
      where: {
        email: userArgs.email,
      },
    });
    this.logger.log(`upserting user succeed`, user);
    return user;
  }

  async deleteUser(userArgs: Pick<User, "id">): Promise<User> {
    const user = await this.prisma.user.delete({
      where: {
        id: userArgs.id,
      },
    });
    this.logger.log(`deleting user succeed`, user);
    return user;
  }
}
