import prisma from '../config/prisma';

async function main() {
  console.log('--- Setting up PostgreSQL Triggers for updatedAt ---');

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  console.log('✅ Created/Updated trigger function: update_updated_at_column');

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS set_forex_rate_updated_at ON public."ForexRate";
    CREATE TRIGGER set_forex_rate_updated_at
    BEFORE UPDATE ON public."ForexRate"
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  `);
  console.log('✅ Created trigger: set_forex_rate_updated_at on ForexRate');

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS set_branch_updated_at ON public."Branch";
    CREATE TRIGGER set_branch_updated_at
    BEFORE UPDATE ON public."Branch"
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  `);
  console.log('✅ Created trigger: set_branch_updated_at on Branch');

  console.log('Testing raw SQL update without explicit updatedAt...');
  await prisma.$executeRawUnsafe(`
    UPDATE public."ForexRate" SET "cashBuy" = 125.50 WHERE "currencyCode" = 'USD';
  `);

  // Print all current forex rates
  const rates = await prisma.forexRate.findMany({
    orderBy: { currencyCode: 'asc' },
  });
  console.log(`\nCurrent Forex Rates in DB (${rates.length}):`);
  for (const r of rates) {
    console.log(`  - ${r.currencyCode} (${r.currencyName}): Buy=${r.cashBuy} | updatedAt=${r.updatedAt.toISOString()}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error setting up triggers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
