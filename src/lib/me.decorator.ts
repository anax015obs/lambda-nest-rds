import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Me = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});
