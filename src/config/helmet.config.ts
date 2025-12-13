import helmet from "helmet";

/**
 * Helmet configuration for security headers
 * @see https://helmetjs.github.io/
 */
export function createHelmetConfig(): Parameters<typeof helmet>[0] {
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: parseCSPDirective(process.env.HELMET_CSP_DEFAULT_SRC, ["'self'"]),
        styleSrc: parseCSPDirective(process.env.HELMET_CSP_STYLE_SRC, [
          "'self'",
          "'unsafe-inline'",
        ]),
        scriptSrc: parseCSPDirective(process.env.HELMET_CSP_SCRIPT_SRC, [
          "'self'",
          "'unsafe-inline'",
        ]),
        imgSrc: parseCSPDirective(process.env.HELMET_CSP_IMG_SRC, ["'self'", "data:", "https:"]),
      },
    },
    crossOriginEmbedderPolicy: parseBooleanEnv(
      process.env.HELMET_CROSS_ORIGIN_EMBEDDER_POLICY,
      false,
    ),
  };
}

/**
 * Parse a comma-separated CSP directive from environment variable
 * @param envValue - Environment variable value
 * @param defaultValue - Default directive array
 * @returns Array of CSP directive values
 */
function parseCSPDirective(envValue: string | undefined, defaultValue: string[]): string[] {
  if (!envValue) {
    return defaultValue;
  }

  return envValue.split(",").map((val) => val.trim());
}

/**
 * Parse a boolean environment variable
 * @param envValue - Environment variable value
 * @param defaultValue - Default boolean value
 * @returns Boolean value
 */
function parseBooleanEnv(envValue: string | undefined, defaultValue: boolean): boolean {
  if (envValue === undefined || envValue === "") {
    return defaultValue;
  }

  return envValue.toLowerCase() === "true" || envValue === "1";
}
