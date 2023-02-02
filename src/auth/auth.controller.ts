import { Controller, Get, Query, Redirect, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Prisma } from "@prisma/client";
import { Response } from "express";
import { Me } from "../lib/me.decorator";
import { LoggerService } from "../logger/logger.service";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService, private logger: LoggerService) {
    this.logger.setContext(AuthController.name);
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(): Promise<void> {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  @Redirect()
  async googleAuthCallback(
    @Me() userArgs: Pick<Prisma.UserCreateInput, "email" | "name" | "picture">,
    @Query("state") state: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ url: string; statusCode: number }> {
    this.logger.log("processing google authorizing...", userArgs);
    const jwt = await this.authService.issueJwt(userArgs);
    res.cookie("jwt", jwt, { httpOnly: true });
    return {
      url: state,
      statusCode: 302,
    };
  }
}
