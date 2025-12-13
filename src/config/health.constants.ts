/**
 * Health Check Configuration Constants
 *
 * These constants define the thresholds for various health checks
 * used by the NestJS Terminus health check endpoints.
 */

/**
 * Memory heap threshold in megabytes
 * Health check will fail if heap usage exceeds this value
 * @default 150 MB
 */
const HEALTH_MEMORY_HEAP_MB = parseInt(process.env.HEALTH_MEMORY_HEAP_MB || "150", 10);

/**
 * Memory heap threshold in bytes
 * Calculated from HEALTH_MEMORY_HEAP_MB
 */
export const HEALTH_CHECK_MEMORY_HEAP_THRESHOLD = HEALTH_MEMORY_HEAP_MB * 1024 * 1024;

/**
 * Memory RSS (Resident Set Size) threshold in megabytes
 * Health check will fail if RSS usage exceeds this value
 * @default 300 MB
 */
const HEALTH_MEMORY_RSS_MB = parseInt(process.env.HEALTH_MEMORY_RSS_MB || "300", 10);

/**
 * Memory RSS threshold in bytes
 * Calculated from HEALTH_MEMORY_RSS_MB
 */
export const HEALTH_CHECK_MEMORY_RSS_THRESHOLD = HEALTH_MEMORY_RSS_MB * 1024 * 1024;

/**
 * Disk storage threshold as percentage (0.0 to 1.0)
 * Health check will fail if disk usage exceeds this percentage
 * @default 0.9 (90%)
 */
export const HEALTH_CHECK_DISK_THRESHOLD = parseFloat(process.env.HEALTH_DISK_THRESHOLD || "0.9");

/**
 * Disk path to check for storage health
 * @default "/" (root filesystem)
 */
export const HEALTH_CHECK_DISK_PATH = process.env.HEALTH_DISK_PATH || "/";
