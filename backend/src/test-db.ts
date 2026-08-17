import prisma from "./config/prisma";

async function testDatabase() {
    try {
    const users = await prisma.user.findMany();

    console.log("Database connected!");
    console.log(users);
    } catch (error) {
    console.error("Database connection failed:", error);
    } finally {
    await prisma.$disconnect();
    }
}

testDatabase();