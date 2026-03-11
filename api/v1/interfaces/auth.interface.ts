import type { Request } from "express";

export interface IAuthRequest extends Request {
  user?: IJwtPayload;
}

export interface IJwtPayload {
  ref: string;
  name: string;
  iat: number;
  exp: number;
}
