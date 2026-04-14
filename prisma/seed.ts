import { PrismaClient, UserRole, TaskStatus, TaskPriority } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/taskdb";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: Refusing to seed a production database. Aborting.");
    process.exit(1);
  }

  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for demo users
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
  const hashedPassword = await bcrypt.hash("Password123!", bcryptRounds);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
    },
  });
  console.log("✅ Created admin user:", adminUser.email);

  // Create regular users
  const johnDoe = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      username: "johndoe",
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      role: UserRole.USER,
    },
  });
  console.log("✅ Created user:", johnDoe.email);

  const janeSmith = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      username: "janesmith",
      password: hashedPassword,
      firstName: "Jane",
      lastName: "Smith",
      role: UserRole.USER,
    },
  });
  console.log("✅ Created user:", janeSmith.email);

  // Create tasks for John Doe
  const johnTasks = await prisma.task.createMany({
    data: [
      {
        title: "Complete project proposal",
        description: "Write and submit the Q4 project proposal to management",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        userId: johnDoe.id,
        dueDate: new Date("2025-12-15"),
      },
      {
        title: "Review pull requests",
        description: "Review and approve pending pull requests from the team",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        userId: johnDoe.id,
        dueDate: new Date("2025-12-01"),
      },
      {
        title: "Update documentation",
        description: "Update API documentation for the latest release",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.LOW,
        userId: johnDoe.id,
        completedAt: new Date("2025-11-20"),
      },
      {
        title: "Fix production bug",
        description: "Investigate and fix the authentication timeout issue",
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        userId: johnDoe.id,
        dueDate: new Date("2025-11-29"),
      },
    ],
  });
  console.log(`✅ Created ${johnTasks.count} tasks for John`);

  // Create tasks for Jane Smith
  const janeTasks = await prisma.task.createMany({
    data: [
      {
        title: "Design new dashboard",
        description: "Create mockups for the new analytics dashboard",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        userId: janeSmith.id,
        dueDate: new Date("2025-12-10"),
      },
      {
        title: "Team standup meeting",
        description: "Daily standup with the development team",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        userId: janeSmith.id,
        dueDate: new Date("2025-11-28"),
      },
      {
        title: "Client presentation",
        description: "Present Q3 results to the client",
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        userId: janeSmith.id,
        completedAt: new Date("2025-11-25"),
      },
      {
        title: "Code review training",
        description: "Conduct code review best practices training session",
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        userId: janeSmith.id,
        dueDate: new Date("2025-12-05"),
      },
      {
        title: "Optimize database queries",
        description: "Identify and optimize slow database queries",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        userId: janeSmith.id,
      },
    ],
  });
  console.log(`✅ Created ${janeTasks.count} tasks for Jane`);

  // Create tasks for admin
  const adminTasks = await prisma.task.createMany({
    data: [
      {
        title: "Review system architecture",
        description: "Conduct quarterly system architecture review",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        userId: adminUser.id,
        dueDate: new Date("2025-12-20"),
      },
      {
        title: "Update security policies",
        description: "Review and update application security policies",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        userId: adminUser.id,
        dueDate: new Date("2025-12-01"),
      },
    ],
  });
  console.log(`✅ Created ${adminTasks.count} tasks for Admin`);

  // Get statistics
  const totalUsers = await prisma.user.count();
  const totalTasks = await prisma.task.count();
  const tasksByStatus = await prisma.task.groupBy({
    by: ["status"],
    _count: true,
  });

  console.log("\n📊 Database Statistics:");
  console.log(`   Total Users: ${totalUsers}`);
  console.log(`   Total Tasks: ${totalTasks}`);
  console.log("   Tasks by Status:");
  tasksByStatus.forEach((stat) => {
    console.log(`     ${stat.status}: ${stat._count}`);
  });

  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
