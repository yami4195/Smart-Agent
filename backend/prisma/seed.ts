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
  console.log("🌱 Seeding database with clean banking services...");

  // 1. Seed 33 Real-World Banking Services
  const servicesData = [
    // 1. Accounts & Deposits
    { name: "Savings Account Opening", description: "Individual, youth, women, and high-yield savings" },
    { name: "Current & Checking Account", description: "Commercial and personal checking accounts" },
    { name: "Fixed Time Deposit", description: "High-yield term deposit investment contracts" },
    { name: "Interest-Free Banking (Amana)", description: "Sharia-compliant ethical Islamic banking" },
    { name: "Salary Account Processing", description: "Corporate payroll and institutional employee accounts" },
    { name: "Student & Youth Banking", description: "Subsidized student and teenage banking accounts" },

    // 2. Cards & Terminals
    { name: "ATM & Debit Card Issuance", description: "Contactless debit cards, issuance & renewals" },
    { name: "Card PIN Reset & Unblock", description: "Instant PIN regeneration and card credential unlock" },
    { name: "POS Merchant Terminal Setup", description: "Point of Sale merchant machine installation" },
    { name: "International Visa/Mastercard", description: "Prepaid travel cards and international online payments" },

    // 3. Cash & Teller
    { name: "Cash Deposit & Fast Teller", description: "High-speed cash depositing & counter receipts" },
    { name: "Cash Withdrawal", description: "Counter cash withdrawals and cheque encashment" },
    { name: "Utility & Tax Bill Payments", description: "Water, electricity, customs, and ERCA tax payments" },
    { name: "Cheque Clearance & CPO", description: "Certified payment orders (CPO) and clearance" },
    { name: "School & University Fee Payment", description: "Tuition deposits and institutional payment receipts" },

    // 4. Forex & International Trade
    { name: "Forex Cash Exchange", description: "Foreign currency spot buying and selling" },
    { name: "International Inward Remittance", description: "Western Union, MoneyGram, Ria, and Remitly payouts" },
    { name: "SWIFT Outward Wire Transfer", description: "Telegraphic transfers for imports and education" },
    { name: "Letter of Credit (LC) Processing", description: "Trade finance and commercial import/export LC" },
    { name: "Forex Retention Account", description: "Exporters and diaspora USD/EUR retention accounts" },

    // 5. Loans & Credit
    { name: "Personal & Salary Advance Loan", description: "Short-term consumer and personal financing" },
    { name: "Vehicle & Asset Financing", description: "Automobile and commercial transport asset loans" },
    { name: "Mortgage & Home Loan", description: "Residential property acquisition and construction credit" },
    { name: "SME & Working Capital Credit", description: "Trade, retail, and manufacturing credit lines" },
    { name: "Agricultural & Export Financing", description: "Commodity export and agricultural value chain funding" },

    // 6. Digital & Mobile Banking
    { name: "Mobile App & Internet Banking", description: "Wegagen Mobile App onboarding and web banking" },
    { name: "Telebirr & Wallet Integration", description: "CBE/Telebirr seamless wallet linkage" },
    { name: "SMS & Email Alert Subscription", description: "Real-time instant transaction notifications" },
    { name: "E-Commerce Payment Gateway", description: "Merchant online payment integration and APIs" },

    // 7. Corporate, VIP & Advisory
    { name: "VIP Priority & Private Banking", description: "Dedicated relationship managers and private lounge access" },
    { name: "Corporate Treasury & Escrow", description: "Enterprise liquidity management and escrow services" },
    { name: "Bank Guarantee & Bid Bond", description: "Performance bonds, bid bonds, and advance payment guarantees" },
    { name: "Customer Care & Statement Requests", description: "General inquiries, complaints, and official account statements" },
  ];

  const createdServices: Record<string, string> = {};
  for (const s of servicesData) {
    const service = await prisma.service.upsert({
      where: { name: s.name },
      update: { description: s.description },
      create: s,
    });
    createdServices[s.name] = service.id;
  }
  console.log(`✅ Seeded ${Object.keys(createdServices).length} distinct services.`);

  // All service names array
  const allServiceNames = servicesData.map((s) => s.name);

  // Helper to pick random subset
  const getRandomServices = (pool: string[], count: number, mustInclude: string[] = []): string[] => {
    const set = new Set<string>(mustInclude);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    for (const item of shuffled) {
      if (set.size >= count) break;
      set.add(item);
    }
    return Array.from(set);
  };

  // 2. Seed Branches (Headquarters gets the most services; branches get 6 to 10)
  const branchesData = [
    {
      name: "Wegagen - Headquarters (HQ) Branch",
      address: "Ras Mekonnen Avenue, Legehar / Stadium",
      latitude: 9.0145,
      longitude: 38.7538,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 552 3800",
      // HQ gets 30 services (the most services)
      serviceNames: getRandomServices(allServiceNames, 30, [
        "Savings Account Opening",
        "Current & Checking Account",
        "VIP Priority & Private Banking",
        "Corporate Treasury & Escrow",
        "Bank Guarantee & Bid Bond",
        "Letter of Credit (LC) Processing",
        "SWIFT Outward Wire Transfer",
        "Forex Cash Exchange",
        "Cash Deposit & Fast Teller",
        "Cash Withdrawal",
      ]),
    },
    {
      name: "Wegagen - Bole Branch",
      address: "Bole Road, Near Friendship City Center",
      latitude: 8.9954,
      longitude: 38.7852,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 661 2345",
      serviceNames: getRandomServices(allServiceNames, 10, [
        "Savings Account Opening",
        "ATM & Debit Card Issuance",
        "Cash Deposit & Fast Teller",
        "Forex Cash Exchange",
        "International Inward Remittance",
      ]),
    },
    {
      name: "Wegagen - Kazanchis Branch",
      address: "Africa Avenue, Near UNECA Building",
      latitude: 9.0175,
      longitude: 38.7725,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 551 6789",
      serviceNames: getRandomServices(allServiceNames, 9, [
        "Savings Account Opening",
        "Cash Deposit & Fast Teller",
        "VIP Priority & Private Banking",
        "SWIFT Outward Wire Transfer",
      ]),
    },
    {
      name: "Wegagen - Merkato Branch",
      address: "Somale Tera, Near Grand Anwar Mosque",
      latitude: 9.0320,
      longitude: 38.7390,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 278 4400",
      serviceNames: getRandomServices(allServiceNames, 10, [
        "Cash Deposit & Fast Teller",
        "Cash Withdrawal",
        "Cheque Clearance & CPO",
        "SME & Working Capital Credit",
        "Interest-Free Banking (Amana)",
      ]),
    },
    {
      name: "Wegagen - Megenagna Branch",
      address: "Sileshi Sihine Building, Megenagna Square",
      latitude: 9.0210,
      longitude: 38.8020,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 663 8811",
      serviceNames: getRandomServices(allServiceNames, 9, [
        "Savings Account Opening",
        "ATM & Debit Card Issuance",
        "Cash Deposit & Fast Teller",
        "Telebirr & Wallet Integration",
      ]),
    },
    {
      name: "Wegagen - Piassa Branch",
      address: "Churchill Avenue, Near Eliana Hotel",
      latitude: 9.0348,
      longitude: 38.7525,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 155 4321",
      serviceNames: getRandomServices(allServiceNames, 8, [
        "Savings Account Opening",
        "ATM & Debit Card Issuance",
        "Cash Deposit & Fast Teller",
        "Forex Cash Exchange",
      ]),
    },
    {
      name: "Wegagen - Mexico Branch",
      address: "Ras Abebe Aregay St, Mexico Square",
      latitude: 9.0112,
      longitude: 38.7467,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 553 9876",
      serviceNames: getRandomServices(allServiceNames, 8, [
        "Savings Account Opening",
        "Current & Checking Account",
        "Cash Deposit & Fast Teller",
        "Mobile App & Internet Banking",
      ]),
    },
    {
      name: "Wegagen - Arat Kilo Branch",
      address: "Near Ministry of Education, Arat Kilo",
      latitude: 9.0330,
      longitude: 38.7610,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 123 7799",
      serviceNames: getRandomServices(allServiceNames, 7, [
        "Student & Youth Banking",
        "Savings Account Opening",
        "Cash Deposit & Fast Teller",
        "School & University Fee Payment",
      ]),
    },
    {
      name: "Wegagen - CMC Branch",
      address: "CMC Road, Near Michael Square",
      latitude: 9.0220,
      longitude: 38.8350,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: true,
      phone: "+251 11 647 3344",
      serviceNames: getRandomServices(allServiceNames, 7, [
        "Savings Account Opening",
        "Mortgage & Home Loan",
        "Cash Deposit & Fast Teller",
        "Utility & Tax Bill Payments",
      ]),
    },
    {
      name: "Wegagen - Sarbet Branch",
      address: "Near African Union HQ, Sarbet",
      latitude: 8.9987,
      longitude: 38.7364,
      openingHours: "8:00 AM - 5:00 PM",
      isOpen: false,
      phone: "+251 11 372 1122",
      serviceNames: getRandomServices(allServiceNames, 6, [
        "Savings Account Opening",
        "ATM & Debit Card Issuance",
        "Cash Deposit & Fast Teller",
        "Forex Cash Exchange",
      ]),
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
    } else {
      await prisma.branch.update({
        where: { id: existing.id },
        data: {
          ...branchInfo,
          services: {
            set: serviceNames.map((name) => ({ id: createdServices[name] })),
          },
        },
      });
    }
  }
  console.log(`✅ Seeded ${branchesData.length} branches with customized service portfolios.`);


  // 3. Seed Forex Rates
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
  // 4. Ensure PostgreSQL Database Triggers for automatic updatedAt maintenance
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS set_forex_rate_updated_at ON "ForexRate";
    CREATE TRIGGER set_forex_rate_updated_at
    BEFORE UPDATE ON "ForexRate"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS set_branch_updated_at ON "Branch";
    CREATE TRIGGER set_branch_updated_at
    BEFORE UPDATE ON "Branch"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
  console.log("✅ Automatic updatedAt triggers initialized.");

  console.log("🚀 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
