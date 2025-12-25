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
    expect(
      matcher.test(normalized),
      `Expected ${block.file} to include column ${column}`,
    ).toBe(true);
  }
};

describe("Phase 2 schema migrations", () => {
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
});
