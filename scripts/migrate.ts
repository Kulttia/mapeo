import "dotenv/config";
import { db } from "../src/db";

async function main() {
  if (process.env.DATABASE_URL) {
    const { migrate } = await import("drizzle-orm/neon-http/migrator");
    await migrate(db as never, { migrationsFolder: "drizzle" });
  } else {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db as never, { migrationsFolder: "drizzle" });
  }
  console.log("Migraciones aplicadas.");
}

main().then(() => process.exit(0), (e) => {
  console.error(e);
  process.exit(1);
});
