import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

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

const expectPattern = (pattern: RegExp, label: string) => {
  const migrations = readMigrationSql();
  const matched = migrations.some(({ sql }) => pattern.test(sql));
  const files = migrations.map(({ file }) => file).join(", ");
  expect(matched, `Expected migrations (${files}) to include ${label}`).toBe(true);
};

const policyPattern = (
  table: "profiles" | "simulation_settings",
  action: "select" | "insert" | "update" | "delete",
  clause: "using" | "with check",
) =>
  new RegExp(
    `create\\s+policy\\s+[\\s\\S]*?on\\s+public\\.${table}\\s+for\\s+${action}[\\s\\S]*?${clause}\\s*\\(\\s*auth\\.uid\\(\\)\\s*=\\s*user_id\\s*\\)`,
    "i",
  );

describe("Phase 2 RLS policies", () => {
  it("enables row level security for profiles and simulation_settings", () => {
    expectPattern(
      /alter\s+table\s+public\.profiles\s+enable\s+row\s+level\s+security/i,
      "RLS enabled on profiles",
    );
    expectPattern(
      /alter\s+table\s+public\.simulation_settings\s+enable\s+row\s+level\s+security/i,
      "RLS enabled on simulation_settings",
    );
  });

  it("adds CRUD policies for profiles", () => {
    expectPattern(policyPattern("profiles", "select", "using"), "profiles select policy");
    expectPattern(policyPattern("profiles", "insert", "with check"), "profiles insert policy");
    expectPattern(policyPattern("profiles", "update", "using"), "profiles update using policy");
    expectPattern(
      policyPattern("profiles", "update", "with check"),
      "profiles update check policy",
    );
    expectPattern(policyPattern("profiles", "delete", "using"), "profiles delete policy");
  });

  it("adds CRUD policies for simulation_settings", () => {
    expectPattern(
      policyPattern("simulation_settings", "select", "using"),
      "simulation_settings select policy",
    );
    expectPattern(
      policyPattern("simulation_settings", "insert", "with check"),
      "simulation_settings insert policy",
    );
    expectPattern(
      policyPattern("simulation_settings", "update", "using"),
      "simulation_settings update using policy",
    );
    expectPattern(
      policyPattern("simulation_settings", "update", "with check"),
      "simulation_settings update check policy",
    );
    expectPattern(
      policyPattern("simulation_settings", "delete", "using"),
      "simulation_settings delete policy",
    );
  });
});
