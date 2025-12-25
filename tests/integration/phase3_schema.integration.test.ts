import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type TableBlock = {
  file: string;
  block: string;
};

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");

const readMigrations = () => {
  if (!fs.existsSync(migrationsDir)) {
    return [] as string[];
  }
  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();
};

const readMigrationSql = () =>
  readMigrations().map((file) => ({
    file,
    sql: fs.readFileSync(path.join(migrationsDir, file), "utf8"),
  }));

const findTableBlock = (tableName: string): TableBlock | null => {
  const migrationFiles = readMigrations();
  for (const file of migrationFiles) {
    const fullPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(fullPath, "utf8");
    const lower = sql.toLowerCase();
    const markers = [
      `create table if not exists public.${tableName}`,
      `create table public.${tableName}`,
      `create table if not exists ${tableName}`,
      `create table ${tableName}`,
    ];
    const start = markers.reduce((foundIndex, marker) => {
      if (foundIndex >= 0) {
        return foundIndex;
      }
      return lower.indexOf(marker);
    }, -1);

    if (start >= 0) {
      const next = lower.indexOf("create table", start + 1);
      const end = next === -1 ? sql.length : next;
      return { file, block: sql.slice(start, end) };
    }
  }
  return null;
};

const expectColumns = (block: TableBlock, columns: string[]) => {
  const normalized = block.block.toLowerCase();
  for (const column of columns) {
    const matcher = new RegExp(`\\b${column}\\b`, "i");
    expect(matcher.test(normalized), `Expected ${block.file} to include column ${column}`).toBe(
      true,
    );
  }
};

const expectColumnDefault = (block: TableBlock, column: string, defaultPattern: RegExp) => {
  const matcher = new RegExp(`${column}\\b[^\\n]*default\\s+${defaultPattern.source}`, "i");
  expect(
    matcher.test(block.block),
    `Expected ${block.file} to include default for ${column} (${defaultPattern})`,
  ).toBe(true);
};

const expectColumnReference = (block: TableBlock, column: string, referencePattern: RegExp) => {
  const matcher = new RegExp(`${column}\\b[^\\n]*references\\s+${referencePattern.source}`, "i");
  expect(
    matcher.test(block.block),
    `Expected ${block.file} to reference ${referencePattern} for ${column}`,
  ).toBe(true);
};

const expectPattern = (pattern: RegExp, label: string) => {
  const migrations = readMigrationSql();
  const matched = migrations.some(({ sql }) => pattern.test(sql));
  const files = migrations.map(({ file }) => file).join(", ");
  expect(matched, `Expected migrations (${files}) to include ${label}`).toBe(true);
};

describe("Phase 3 schema migrations", () => {
  it("creates children with required columns", () => {
    const block = findTableBlock("children");
    expect(block, "children table definition not found in migrations").not.toBeNull();
    if (!block) {
      return;
    }

    expectColumns(block, ["id", "user_id", "label", "birth_year_month", "due_year_month", "note"]);
  });

  it("creates income_streams with required columns and defaults", () => {
    const block = findTableBlock("income_streams");
    expect(block, "income_streams table definition not found in migrations").not.toBeNull();
    if (!block) {
      return;
    }

    expectColumns(block, [
      "id",
      "user_id",
      "label",
      "take_home_monthly",
      "bonus_months",
      "bonus_amount",
      "change_year_month",
      "bonus_amount_after",
      "raise_rate",
      "start_year_month",
      "end_year_month",
    ]);

    expectColumnDefault(block, "bonus_months", /'\{\}'(::integer\[\])?/i);
    expectColumnDefault(block, "raise_rate", /0\.01/);
  });

  it("creates expenses with required columns and defaults", () => {
    const block = findTableBlock("expenses");
    expect(block, "expenses table definition not found in migrations").not.toBeNull();
    if (!block) {
      return;
    }

    expectColumns(block, [
      "id",
      "user_id",
      "label",
      "amount_monthly",
      "inflation_rate",
      "category",
      "start_year_month",
      "end_year_month",
    ]);

    expectColumnDefault(block, "inflation_rate", /0\.0/);
  });

  it("creates rentals with required columns", () => {
    const block = findTableBlock("rentals");
    expect(block, "rentals table definition not found in migrations").not.toBeNull();
    if (!block) {
      return;
    }

    expectColumns(block, ["id", "user_id", "rent_monthly", "start_year_month", "end_year_month"]);
  });

  it("creates assets with required columns and defaults", () => {
    const block = findTableBlock("assets");
    expect(block, "assets table definition not found in migrations").not.toBeNull();
    if (!block) {
      return;
    }

    expectColumns(block, ["id", "user_id", "cash_balance", "investment_balance", "return_rate"]);

    expectColumnDefault(block, "return_rate", /0\.03/);
  });

  it("creates mortgages with required columns and defaults", () => {
    const block = findTableBlock("mortgages");
    expect(block, "mortgages table definition not found in migrations").not.toBeNull();
    if (!block) {
      return;
    }

    expectColumns(block, [
      "id",
      "user_id",
      "principal",
      "annual_rate",
      "years",
      "start_year_month",
      "building_price",
      "land_price",
      "down_payment",
      "target_rental_id",
    ]);

    expectColumnDefault(block, "annual_rate", /0\.015/);
    expectColumnReference(block, "target_rental_id", /public\.rentals\s*\(id\)/i);
  });

  it("creates life_events with required columns", () => {
    const block = findTableBlock("life_events");
    expect(block, "life_events table definition not found in migrations").not.toBeNull();
    if (!block) {
      return;
    }

    expectColumns(block, [
      "id",
      "user_id",
      "label",
      "amount",
      "year_month",
      "repeat_interval_years",
      "stop_after_occurrences",
      "category",
      "auto_toggle_key",
      "building_price",
      "land_price",
      "down_payment",
      "target_rental_id",
    ]);
  });

  it("adds all core tables in migrations", () => {
    expectPattern(/create\s+table\s+if\s+not\s+exists\s+public\.children/i, "children table");
    expectPattern(
      /create\s+table\s+if\s+not\s+exists\s+public\.income_streams/i,
      "income_streams table",
    );
    expectPattern(/create\s+table\s+if\s+not\s+exists\s+public\.expenses/i, "expenses table");
    expectPattern(/create\s+table\s+if\s+not\s+exists\s+public\.rentals/i, "rentals table");
    expectPattern(/create\s+table\s+if\s+not\s+exists\s+public\.assets/i, "assets table");
    expectPattern(/create\s+table\s+if\s+not\s+exists\s+public\.mortgages/i, "mortgages table");
    expectPattern(/create\s+table\s+if\s+not\s+exists\s+public\.life_events/i, "life_events table");
  });
});
