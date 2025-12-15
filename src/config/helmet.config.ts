import helmet from "helmet";
import { ConfigService } from "@nestjs/config";

/**
 * Helmet configuration for security headers
 *
 * @param configService - NestJS ConfigService for accessing configuration
 * @returns Helmet configuration object
 * @see https://helmetjs.github.io/
 */
export function createHelmetConfig(configService: ConfigService): Parameters<typeof helmet>[0] {
  // Get CSP configuration from config service
  const cspEnabled = configService.get<boolean>("security.helmet.contentSecurityPolicy", true);

  return {
    contentSecurityPolicy: cspEnabled
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: configService.get<boolean>(
      "security.helmet.crossOriginEmbedderPolicy",
      false,
    ),
    crossOriginOpenerPolicy: configService.get<boolean>(
      "security.helmet.crossOriginOpenerPolicy",
      false,
    )
      ? { policy: "same-origin" }
      : false,
    crossOriginResourcePolicy: configService.get<boolean>(
      "security.helmet.crossOriginResourcePolicy",
      false,
    )
      ? { policy: "same-origin" }
      : false,
  };
}
