import { PrismaClient } from "../client/lib/generated/prisma/client"

export const prisma = new PrismaClient({
    log: ["error", "warn"],
})

process.on("SIGINT", async () => {
    await prisma.$disconnect()
})

process.on("SIGTERM", async () => {
    await prisma.$disconnect()
})