import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Seed Services
  const servicesData = [
    { name: "Teller Services", description: "Cash deposits, withdrawals, and utility payments" },
    { name: "Forex / FX", description: "Foreign currency exchange and telegraphic transfers" },
    { name: "Account Opening", description: "Open new savings, current, or interest-free accounts" },
    { name: "ATM / CDM", description: "Card issuance, PIN reset, and cash deposit machine support" },
    { name: "VIP Banking", description: "Priority customer banking and private wealth services" },
    { name: "Loan / Credit", description: "Personal, business, and mortgage loan consultations" },
  ];

  const createdServices: Record<string, string> = {};
  for (const s of servicesData) {
    const service = await prisma.service.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    createdServices[s.name] = service.id;
  }
  console.log(`✅ Seeded ${Object.keys(createdServices).length} services.`);

  // 2. Seed Branches (matching Wegagen Bank locations in Addis Ababa)
  const branchesData = [
    {
      name: "Wegagen - Bole Branch",
      address: "Bole Road, Near Friendship City Center",
      latitude: 8.9954,
      longitude: 38.7852,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 661 2345",
      serviceNames: ["Teller Services", "Forex / FX", "Account Opening", "ATM / CDM"],
    },
    {
      name: "Wegagen - Kazanchis Branch",
      address: "Africa Avenue, Near UNECA Building",
      latitude: 9.0175,
      longitude: 38.7725,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 551 6789",
      serviceNames: ["Teller Services", "Forex / FX", "VIP Banking", "Loan / Credit"],
    },
    {
      name: "Wegagen - Piassa Branch",
      address: "Churchill Avenue, Near Eliana Hotel",
      latitude: 9.0348,
      longitude: 38.7525,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 155 4321",
      serviceNames: ["Teller Services", "Forex / FX", "Account Opening", "ATM / CDM"],
    },
    {
      name: "Wegagen - Mexico Branch",
      address: "Ras Abebe Aregay St, Mexico Square",
      latitude: 9.0112,
      longitude: 38.7467,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 553 9876",
      serviceNames: ["Teller Services", "Account Opening", "ATM / CDM"],
    },
    {
      name: "Wegagen - Sarbet Branch",
      address: "Near African Union HQ, Sarbet",
      latitude: 8.9987,
      longitude: 38.7364,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: false,
      phone: "+251 11 372 1122",
      serviceNames: ["Teller Services", "Forex / FX", "Account Opening"],
    },
  ];

  for (const b of branchesData) {
    const { serviceNames, ...branchInfo } = b;
    const existing = await prisma.branch.findFirst({
      where: { name: branchInfo.name },
    });

    if (!existing) {
      await prisma.branch.create({
        data: {
          ...branchInfo,
          services: {
            connect: serviceNames.map((name) => ({ id: createdServices[name] })),
          },
        },
      });
    }
  }
  console.log(` Seeded ${branchesData.length} branches with linked services.`);

  // 3. Seed Forex Rates (Official Wegagen Live Rates)
  const forexRatesData = [
    { currencyCode: "USD", currencyName: "US Dollar", flagEmoji: "🇺🇸", cashBuy: 125.40, cashSell: 127.90, ttBuy: 126.15, ttSell: 128.67, change24h: "+0.35%", isPositive: true, isMajor: true },
    { currencyCode: "EUR", currencyName: "Euro", flagEmoji: "🇪🇺", cashBuy: 136.10, cashSell: 138.80, ttBuy: 137.05, ttSell: 139.75, change24h: "-0.12%", isPositive: false, isMajor: true },
    { currencyCode: "GBP", currencyName: "British Pound", flagEmoji: "🇬🇧", cashBuy: 160.25, cashSell: 163.45, ttBuy: 161.40, ttSell: 164.60, change24h: "+0.48%", isPositive: true, isMajor: true },
    { currencyCode: "AED", currencyName: "UAE Dirham", flagEmoji: "🇦🇪", cashBuy: 34.14, cashSell: 34.82, ttBuy: 34.35, ttSell: 35.03, change24h: "+0.05%", isPositive: true, isMajor: true },
    { currencyCode: "SAR", currencyName: "Saudi Riyal", flagEmoji: "🇸🇦", cashBuy: 33.42, cashSell: 34.08, ttBuy: 33.60, ttSell: 34.27, change24h: "-0.08%", isPositive: false, isMajor: true },
    { currencyCode: "CAD", currencyName: "Canadian Dollar", flagEmoji: "🇨🇦", cashBuy: 91.20, cashSell: 93.00, ttBuy: 91.80, ttSell: 93.60, change24h: "+0.18%", isPositive: true, isMajor: false },
    { currencyCode: "CNY", currencyName: "Chinese Yuan", flagEmoji: "🇨🇳", cashBuy: 17.30, cashSell: 17.65, ttBuy: 17.45, ttSell: 17.80, change24h: "-0.04%", isPositive: false, isMajor: false },
    { currencyCode: "CHF", currencyName: "Swiss Franc", flagEmoji: "🇨🇭", cashBuy: 141.50, cashSell: 144.30, ttBuy: 142.30, ttSell: 145.10, change24h: "+0.22%", isPositive: true, isMajor: false },
  ];

  for (const rate of forexRatesData) {
    await prisma.forexRate.upsert({
      where: { currencyCode: rate.currencyCode },
      update: rate,
      create: rate,
    });
  }
  console.log(` Seeded ${forexRatesData.length} forex exchange rates.`);

  console.log(" Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(" Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
