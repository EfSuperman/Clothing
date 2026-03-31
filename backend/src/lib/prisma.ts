import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Directly connect to the TCP port (51214) of the running 'prisma dev' server.
// This is the fastest and most stable way to connect locally in Prisma 7.
const connectionString = "postgres://postgres:postgres@localhost:51214/clothing?sslmode=disable";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
