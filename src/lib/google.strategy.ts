import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import httpStatus from "http-status";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { ParsedQs } from "qs";
import { HttpException } from "../lib/http-exception";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? `${process.env.SERVER_URL}/auth/google/callback`
          : `http://localhost:${process.env.SERVER_PORT}/auth/google/callback`,
      passReqToCallback: true,
      scope: ["email", "profile"],
    });
  }

  async authenticate(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, options?: any): Promise<void> {
    options.state = req.query.originalUrl;
    super.authenticate(req, options);
  }

  async validate(req: Request, at: string, rt: string, profile: Profile, done: VerifyCallback): Promise<void> {
    const { displayName, emails, photos } = profile;
    if (!req.query.state) {
      throw new HttpException(httpStatus.BAD_REQUEST, null, "missing state");
    }
    if (!Array.isArray(emails) || !emails.length || emails[0].verified === "false") {
      throw new HttpException(httpStatus.BAD_REQUEST, null, "invalid email format");
    }
    if (!Array.isArray(photos)) {
      throw new HttpException(httpStatus.BAD_REQUEST, null, "invalid photo format");
    }
    if (!displayName) {
      throw new HttpException(httpStatus.BAD_REQUEST, null, "invalid name format");
    }
    const userArgs = {
      email: emails[0].value,
      name: displayName,
      picture: photos[0] ? photos[0].value : null,
    };
    done(null, userArgs);
  }
}
