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

const expectIndex = (table: string, columns: string[]) => {
  const columnPattern = columns.map((column) => `\\s*${column}\\s*`).join("\\s*,\\s*");
  expectPattern(
    new RegExp(
      [
        "create\\s+index\\s+(if\\s+not\\s+exists\\s+)?",
        "[^;]*",
        `on\\s+public\\.${table}[^;]*`,
        "using\\s+btree\\s*",
        `\\(\\s*${columnPattern}\\s*\\)`,
      ].join(""),
      "i",
    ),
    `${table} index on ${columns.join(", ")}`,
  );
};

const expectRlsEnabled = (table: string) => {
  expectPattern(
    new RegExp(`alter\\s+table\\s+public\\.${table}[^;]*enable\\s+row\\s+level\\s+security`, "i"),
    `${table} RLS enabled`,
  );
};

const expectPolicy = (
  table: string,
  action: "select" | "insert" | "update" | "delete",
  clauses: string[],
) => {
  const pattern = new RegExp(
    [
      `create\\s+policy\\s+[^;]*?\\s+on\\s+public\\.${table}[^;]*?`,
      `for\\s+${action}[^;]*?`,
      ...clauses.map((clause) => `[^;]*?${clause}`),
    ].join(""),
    "i",
  );
  expectPattern(pattern, `${table} ${action} policy`);
};

const expectMonthStartConstraint = (table: string, column: string, nullable: boolean) => {
  const condition = nullable
    ? `${column}\\s+is\\s+null\\s+or\\s+date_part\\('\\s*day\\s*',\\s*${column}\\)\\s*=\\s*1`
    : `date_part\\('\\s*day\\s*',\\s*${column}\\)\\s*=\\s*1`;
  expectPattern(
    new RegExp(`alter\\s+table\\s+public\\.${table}[^;]*${condition}`, "i"),
    `${table}.${column} month-start check constraint`,
  );
};

const expectNonNegativeConstraint = (table: string, column: string) => {
  expectPattern(
    new RegExp(`alter\\s+table\\s+public\\.${table}[^;]*${column}[^\\n]*>=\\s*0`, "i"),
    `${table}.${column} >= 0 check constraint`,
  );
};

describe("Schema Migrations", () => {
  describe("Phase 2: User Profiles & Settings", () => {
    it("creates profiles with required columns", () => {
      const block = findTableBlock("profiles");
      expect(block, "profiles table definition not found in migrations").not.toBeNull();
      if (!block) {
        return;
      }

      expectColumns(block, [
        "user_id",
        "birth_year",
        "birth_month",
        "spouse_birth_year",
        "spouse_birth_month",
        "pension_start_age",
      ]);
    });

    it("creates simulation_settings with required columns", () => {
      const block = findTableBlock("simulation_settings");
      expect(block, "simulation_settings table definition not found in migrations").not.toBeNull();
      if (!block) {
        return;
      }

      expectColumns(block, [
        "user_id",
        "start_offset_months",
        "end_age",
        "pension_amount_single",
        "pension_amount_spouse",
        "mortgage_transaction_cost_rate",
        "real_estate_tax_rate",
        "real_estate_evaluation_rate",
      ]);
    });

    it("adds on_auth_user_created trigger to create initial records", () => {
      expectPattern(/create\s+trigger\s+on_auth_user_created/i, "on_auth_user_created trigger");
      expectPattern(/insert\s+into\s+public\.profiles/i, "profiles insert in trigger function");
      expectPattern(
        /insert\s+into\s+public\.simulation_settings/i,
        "simulation_settings insert in trigger function",
      );
    });
  });

  describe("Phase 3: Financial Inputs", () => {
    it("creates children with required columns", () => {
      const block = findTableBlock("children");
      expect(block, "children table definition not found in migrations").not.toBeNull();
      if (!block) {
        return;
      }

      expectColumns(block, [
        "id",
        "user_id",
        "label",
        "birth_year_month",
        "due_year_month",
        "note",
      ]);
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

    it("enforces month-start dates across core tables", () => {
      expectMonthStartConstraint("children", "birth_year_month", true);
      expectMonthStartConstraint("children", "due_year_month", true);
      expectMonthStartConstraint("income_streams", "change_year_month", true);
      expectMonthStartConstraint("income_streams", "start_year_month", false);
      expectMonthStartConstraint("income_streams", "end_year_month", true);
      expectMonthStartConstraint("expenses", "start_year_month", false);
      expectMonthStartConstraint("expenses", "end_year_month", true);
      expectMonthStartConstraint("rentals", "start_year_month", false);
      expectMonthStartConstraint("rentals", "end_year_month", true);
      expectMonthStartConstraint("mortgages", "start_year_month", false);
      expectMonthStartConstraint("life_events", "year_month", false);
    });

    it("prevents negative monetary amounts", () => {
      expectNonNegativeConstraint("income_streams", "take_home_monthly");
      expectNonNegativeConstraint("income_streams", "bonus_amount");
      expectNonNegativeConstraint("income_streams", "bonus_amount_after");
      expectNonNegativeConstraint("expenses", "amount_monthly");
      expectNonNegativeConstraint("rentals", "rent_monthly");
      expectNonNegativeConstraint("assets", "cash_balance");
      expectNonNegativeConstraint("assets", "investment_balance");
      expectNonNegativeConstraint("mortgages", "principal");
      expectNonNegativeConstraint("mortgages", "building_price");
      expectNonNegativeConstraint("mortgages", "land_price");
      expectNonNegativeConstraint("mortgages", "down_payment");
      expectNonNegativeConstraint("life_events", "amount");
    });

    it("requires children to have birth or due month", () => {
      expectPattern(
        new RegExp(
          [
            "alter\\s+table\\s+public\\.children[^;]*",
            "birth_year_month\\s+is\\s+not\\s+null\\s+or\\s+due_year_month\\s+is\\s+not\\s+null",
          ].join(""),
          "i",
        ),
        "children birth/due requirement check",
      );
    });

    it("enforces repeat_interval_years to be positive when present", () => {
      expectPattern(
        new RegExp(
          [
            "alter\\s+table\\s+public\\.life_events[^;]*",
            "repeat_interval_years\\s+is\\s+null\\s+or\\s+repeat_interval_years\\s*>\\s*0",
          ].join(""),
          "i",
        ),
        "repeat_interval_years > 0 check",
      );
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
      expectPattern(
        /create\s+table\s+if\s+not\s+exists\s+public\.life_events/i,
        "life_events table",
      );
    });

    it("adds required indexes for core tables", () => {
      expectIndex("children", ["user_id"]);
      expectIndex("income_streams", ["user_id"]);
      expectIndex("expenses", ["user_id"]);
      expectIndex("rentals", ["user_id"]);
      expectIndex("assets", ["user_id"]);
      expectIndex("mortgages", ["user_id"]);
      expectIndex("life_events", ["user_id"]);
      expectIndex("life_events", ["year_month"]);
      expectIndex("mortgages", ["user_id", "target_rental_id"]);
    });

    it("enables RLS and adds per-user policies for core tables", () => {
      const tables = [
        "children",
        "income_streams",
        "expenses",
        "rentals",
        "assets",
        "mortgages",
        "life_events",
      ];

      for (const table of tables) {
        expectRlsEnabled(table);
        expectPolicy(table, "select", ["using\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*user_id\\s*\\)"]);
        expectPolicy(table, "insert", [
          "with\\s+check\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*user_id\\s*\\)",
        ]);
        expectPolicy(table, "update", [
          "using\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*user_id\\s*\\)",
          "with\\s+check\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*user_id\\s*\\)",
        ]);
        expectPolicy(table, "delete", ["using\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*user_id\\s*\\)"]);
      }
    });
  });
});
