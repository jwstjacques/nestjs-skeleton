import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface ValidatedUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface RequestWithUser extends Request {
  user?: ValidatedUser;
}
