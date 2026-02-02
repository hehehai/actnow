import { nanoid } from "nanoid";
import type { db as DbType } from "../index";
import { account, user } from "../schema/auth";

// Realistic user data
const mockUsers = [
  {
    name: "Admin User",
    email: "admin@actnow.dev",
    role: "ADMIN" as const,
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    role: "USER" as const,
  },
  {
    name: "Marcus Johnson",
    email: "marcus.j@example.com",
    role: "USER" as const,
  },
  {
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    role: "USER" as const,
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    role: "USER" as const,
  },
  {
    name: "Jessica Taylor",
    email: "jessica.t@example.com",
    role: "USER" as const,
  },
  {
    name: "Michael Brown",
    email: "michael.b@example.com",
    role: "USER" as const,
  },
  {
    name: "Amanda Wilson",
    email: "amanda.w@example.com",
    role: "USER" as const,
  },
  {
    name: "Christopher Lee",
    email: "chris.lee@example.com",
    role: "USER" as const,
  },
  {
    name: "Rachel Martinez",
    email: "rachel.m@example.com",
    role: "USER" as const,
  },
];

export async function seedUsers(db: typeof DbType) {
  console.info("Seeding users...");

  const userRecords = mockUsers.map((u, index) => ({
    id: nanoid(),
    name: u.name,
    email: u.email,
    emailVerified: true,
    image: `https://picsum.photos/seed/user${index + 1}/200/200`,
    role: u.role,
    banned: false,
  }));

  await db.insert(user).values(userRecords).onConflictDoNothing();

  // Create credential accounts for all users (password: "password123")
  // Hash generated with bcrypt, 10 rounds
  const hashedPassword =
    "$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u";

  const accountRecords = userRecords.map((u) => ({
    id: nanoid(),
    accountId: u.id,
    providerId: "credential",
    userId: u.id,
    password: hashedPassword,
  }));

  await db.insert(account).values(accountRecords).onConflictDoNothing();

  // Query actual users from database to get correct IDs
  const existingUsers = await db
    .select({ id: user.id, email: user.email, role: user.role })
    .from(user);

  console.info(`Seeded/found ${existingUsers.length} users`);

  return existingUsers;
}
