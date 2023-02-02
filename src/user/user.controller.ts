import { Res, Controller, Delete, Get, UseGuards } from "@nestjs/common";
import { User } from "@prisma/client";
import { Response } from "express";
import { JwtAuthGuard } from "../lib/jwt-auth.guard";
import { Me } from "../lib/me.decorator";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Me() me: User): Promise<User> {
    return me;
  }

  @Delete("token")
  @UseGuards(JwtAuthGuard)
  async deleteToken(@Res({ passthrough: true }) res: Response, @Me() me: User): Promise<User> {
    res.clearCookie("jwt", { httpOnly: true });
    return me;
  }

  @Delete("me")
  @UseGuards(JwtAuthGuard)
  async deleteMe(@Me() me: User): Promise<User> {
    return await this.userService.deleteUser(me);
  }
}
