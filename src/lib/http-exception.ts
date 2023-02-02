import httpStatus from "http-status";

export class HttpException extends Error {
  statusCode: number;
  code: string;
  body: { [k: string]: any } | null;

  constructor(statusCode: number, code?: string | null, message?: string | null, body?: { [k: string]: any }) {
    super();
    this.statusCode = statusCode;
    this.name = httpStatus[statusCode] ?? httpStatus[500];
    this.code = code ?? httpStatus[`${statusCode}_NAME`]?.toString() ?? httpStatus["500_NAME"];
    this.message = message ?? httpStatus[statusCode] ?? httpStatus[500];
    this.body = body ?? null;
  }
}
