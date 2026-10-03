import prisma from "./config/prisma";

async function testDatabase() {
    try {
        const usersCount = await prisma.user.count();
        const branchesCount = await prisma.branch.count();
        const servicesCount = await prisma.service.count();
        const ticketsCount = await prisma.queueTicket.count();
        const forexRatesCount = await prisma.forexRate.count();

        console.log("✅ Neon Database connected Successfully!");
        console.log("📊 Data Summary in Neon:");
        console.log(`   - Users:        ${usersCount}`);
        console.log(`   - Branches:     ${branchesCount}`);
        console.log(`   - Services:     ${servicesCount}`);
        console.log(`   - QueueTickets: ${ticketsCount}`);
        console.log(`   - ForexRates:   ${forexRatesCount}`);
    } catch (error) {
        console.error("❌ Database connection failed with error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();