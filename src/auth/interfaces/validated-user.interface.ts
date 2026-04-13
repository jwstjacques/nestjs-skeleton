import { Request } from "express";

export interface ValidatedUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends Request {
  user?: ValidatedUser;
}
