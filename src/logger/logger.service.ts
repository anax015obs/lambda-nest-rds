import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  constructor(context?: string) {
    super();
    this.context = context;
  }

  log(message: string, body?: unknown, context?: string): void {
    console.log(`[${context ? context : this.context ?? ""}] \x1b[32m%s \x1b[37m%s`, message, body ? JSON.stringify(body, null, 2) : "");
  }

  warn(message: string, body?: unknown, context?: string): void {
    console.log(`[${context ? context : this.context ?? ""}] \x1b[33m%s \x1b[37m%s`, message, body ? JSON.stringify(body, null, 2) : "");
  }

  error(error: unknown, context?: string) {
    console.error(`[${context ? context : this.context ?? ""}] \x1b[31m%s`, error);
  }
}
