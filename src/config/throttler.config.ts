import { registerAs } from "@nestjs/config";

export default registerAs("throttler", () => ({
  // Global throttler tiers
  short: {
    ttl: parseInt(process.env.THROTTLE_SHORT_TTL || "1000", 10),
    limit: parseInt(process.env.THROTTLE_SHORT_LIMIT || "10", 10),
  },
  medium: {
    ttl: parseInt(process.env.THROTTLE_MEDIUM_TTL || "10000", 10),
    limit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT || "50", 10),
  },
  long: {
    ttl: parseInt(process.env.THROTTLE_LONG_TTL || "60000", 10),
    limit: parseInt(process.env.THROTTLE_LONG_LIMIT || "200", 10),
  },
  // Endpoint-specific overrides
  endpoints: {
    createTask: {
      ttl: parseInt(process.env.THROTTLE_CREATE_TASK_TTL || "1000", 10),
      limit: parseInt(process.env.THROTTLE_CREATE_TASK_LIMIT || "5", 10),
    },
    updateTask: {
      ttl: parseInt(process.env.THROTTLE_UPDATE_TASK_TTL || "1000", 10),
      limit: parseInt(process.env.THROTTLE_UPDATE_TASK_LIMIT || "10", 10),
    },
    deleteTask: {
      ttl: parseInt(process.env.THROTTLE_DELETE_TASK_TTL || "1000", 10),
      limit: parseInt(process.env.THROTTLE_DELETE_TASK_LIMIT || "3", 10),
    },
  },
}));
