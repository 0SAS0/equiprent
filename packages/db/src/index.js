const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const generated = require("./generated/client");

const { PrismaClient } = generated;
const globalForPrisma = globalThis;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg(new Pool({ connectionString }));

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log:
			process.env.NODE_ENV === "development"
				? ["query", "error", "warn"]
				: ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

module.exports = {
	...generated,
	prisma,
};
