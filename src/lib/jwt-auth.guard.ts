import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import httpStatus from "http-status";
import { HttpException } from "./http-exception";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest(err: unknown, user: any) {
    if (err || !user) {
      throw new HttpException(httpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
