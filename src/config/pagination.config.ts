import { registerAs } from "@nestjs/config";

export default registerAs("pagination", () => ({
  defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || "10", 10),
  maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || "100", 10),
}));
