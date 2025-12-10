import { PrismaService } from "../../src/database/prisma.service";

/**
 * Test cleanup utility for safely removing test data
 * Tracks created entities by ID and deletes only tracked items
 * Never uses deleteMany() to prevent accidental data loss
 */
export class TestCleanup {
  private taskIds: Set<string> = new Set();
  private userIds: Set<string> = new Set();

  constructor(private prisma: PrismaService) {}

  /**
   * Track a task ID for cleanup
   * @param id Task ID to track
   */
  trackTask(id: string): void {
    this.taskIds.add(id);
  }

  /**
   * Track multiple task IDs for cleanup
   * @param ids Task IDs to track
   */
  trackTasks(ids: string[]): void {
    ids.forEach((id) => this.taskIds.add(id));
  }

  /**
   * Track a user ID for cleanup
   * @param id User ID to track
   */
  trackUser(id: string): void {
    this.userIds.add(id);
  }

  /**
   * Track multiple user IDs for cleanup
   * @param ids User IDs to track
   */
  trackUsers(ids: string[]): void {
    ids.forEach((id) => this.userIds.add(id));
  }

  /**
   * Clean up all tracked tasks
   * Deletes tasks one by one by ID
   */
  async cleanupTasks(): Promise<void> {
    for (const id of this.taskIds) {
      try {
        await this.prisma.task.delete({ where: { id } });
      } catch {
        // Task may already be deleted, ignore error
      }
    }
    this.taskIds.clear();
  }

  /**
   * Clean up all tracked users
   * Deletes users one by one by ID
   */
  async cleanupUsers(): Promise<void> {
    for (const id of this.userIds) {
      try {
        await this.prisma.user.delete({ where: { id } });
      } catch {
        // User may already be deleted, ignore error
      }
    }
    this.userIds.clear();
  }

  /**
   * Clean up all tracked entities
   * Cleans tasks first (due to foreign key constraints), then users
   */
  async cleanupAll(): Promise<void> {
    await this.cleanupTasks();
    await this.cleanupUsers();
  }

  /**
   * Clear all tracked IDs without deleting
   * Useful when you want to reset tracking state
   */
  clearTracking(): void {
    this.taskIds.clear();
    this.userIds.clear();
  }

  /**
   * Get count of tracked tasks
   * @returns Number of tracked task IDs
   */
  getTrackedTaskCount(): number {
    return this.taskIds.size;
  }

  /**
   * Get count of tracked users
   * @returns Number of tracked user IDs
   */
  getTrackedUserCount(): number {
    return this.userIds.size;
  }
}
