import type { SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CreateAssetEndpoint } from "@/features/inputs/assets/commands/create-asset/endpoint";
import { CreateAssetCommandHandler } from "@/features/inputs/assets/commands/create-asset/handler";
import { SupabaseCreateAssetRepository } from "@/features/inputs/assets/commands/create-asset/repository";
import { DeleteAssetEndpoint } from "@/features/inputs/assets/commands/delete-asset/endpoint";
import { DeleteAssetCommandHandler } from "@/features/inputs/assets/commands/delete-asset/handler";
import { SupabaseDeleteAssetRepository } from "@/features/inputs/assets/commands/delete-asset/repository";
import { UpdateAssetEndpoint } from "@/features/inputs/assets/commands/update-asset/endpoint";
import { UpdateAssetCommandHandler } from "@/features/inputs/assets/commands/update-asset/handler";
import { SupabaseUpdateAssetRepository } from "@/features/inputs/assets/commands/update-asset/repository";
import { ListAssetsEndpoint } from "@/features/inputs/assets/queries/list-assets/endpoint";
import { ListAssetsQueryHandler } from "@/features/inputs/assets/queries/list-assets/handler";
import { SupabaseListAssetsRepository } from "@/features/inputs/assets/queries/list-assets/repository";
import { CreateChildEndpoint } from "@/features/inputs/children/commands/create-child/endpoint";
import { CreateChildCommandHandler } from "@/features/inputs/children/commands/create-child/handler";
import { SupabaseCreateChildRepository } from "@/features/inputs/children/commands/create-child/repository";
import { DeleteChildEndpoint } from "@/features/inputs/children/commands/delete-child/endpoint";
import { DeleteChildCommandHandler } from "@/features/inputs/children/commands/delete-child/handler";
import { SupabaseDeleteChildRepository } from "@/features/inputs/children/commands/delete-child/repository";
import { UpdateChildEndpoint } from "@/features/inputs/children/commands/update-child/endpoint";
import { UpdateChildCommandHandler } from "@/features/inputs/children/commands/update-child/handler";
import { SupabaseUpdateChildRepository } from "@/features/inputs/children/commands/update-child/repository";
import { ListChildrenEndpoint } from "@/features/inputs/children/queries/list-children/endpoint";
import { ListChildrenQueryHandler } from "@/features/inputs/children/queries/list-children/handler";
import { SupabaseListChildrenRepository } from "@/features/inputs/children/queries/list-children/repository";
import { CreateExpenseEndpoint } from "@/features/inputs/expenses/commands/create-expense/endpoint";
import { CreateExpenseCommandHandler } from "@/features/inputs/expenses/commands/create-expense/handler";
import { SupabaseCreateExpenseRepository } from "@/features/inputs/expenses/commands/create-expense/repository";
import { DeleteExpenseEndpoint } from "@/features/inputs/expenses/commands/delete-expense/endpoint";
import { DeleteExpenseCommandHandler } from "@/features/inputs/expenses/commands/delete-expense/handler";
import { SupabaseDeleteExpenseRepository } from "@/features/inputs/expenses/commands/delete-expense/repository";
import { UpdateExpenseEndpoint } from "@/features/inputs/expenses/commands/update-expense/endpoint";
import { UpdateExpenseCommandHandler } from "@/features/inputs/expenses/commands/update-expense/handler";
import { SupabaseUpdateExpenseRepository } from "@/features/inputs/expenses/commands/update-expense/repository";
import { ListExpensesEndpoint } from "@/features/inputs/expenses/queries/list-expenses/endpoint";
import { ListExpensesQueryHandler } from "@/features/inputs/expenses/queries/list-expenses/handler";
import { SupabaseListExpensesRepository } from "@/features/inputs/expenses/queries/list-expenses/repository";
import { CreateIncomeStreamEndpoint } from "@/features/inputs/income-streams/commands/create-income-stream/endpoint";
import { CreateIncomeStreamCommandHandler } from "@/features/inputs/income-streams/commands/create-income-stream/handler";
import { SupabaseCreateIncomeStreamRepository } from "@/features/inputs/income-streams/commands/create-income-stream/repository";
import { DeleteIncomeStreamEndpoint } from "@/features/inputs/income-streams/commands/delete-income-stream/endpoint";
import { DeleteIncomeStreamCommandHandler } from "@/features/inputs/income-streams/commands/delete-income-stream/handler";
import { SupabaseDeleteIncomeStreamRepository } from "@/features/inputs/income-streams/commands/delete-income-stream/repository";
import { UpdateIncomeStreamEndpoint } from "@/features/inputs/income-streams/commands/update-income-stream/endpoint";
import { UpdateIncomeStreamCommandHandler } from "@/features/inputs/income-streams/commands/update-income-stream/handler";
import { SupabaseUpdateIncomeStreamRepository } from "@/features/inputs/income-streams/commands/update-income-stream/repository";
import { ListIncomeStreamsEndpoint } from "@/features/inputs/income-streams/queries/list-income-streams/endpoint";
import { ListIncomeStreamsQueryHandler } from "@/features/inputs/income-streams/queries/list-income-streams/handler";
import { SupabaseListIncomeStreamsRepository } from "@/features/inputs/income-streams/queries/list-income-streams/repository";
import { CreateLifeEventEndpoint } from "@/features/inputs/life-events/commands/create-life-event/endpoint";
import { CreateLifeEventCommandHandler } from "@/features/inputs/life-events/commands/create-life-event/handler";
import { SupabaseCreateLifeEventRepository } from "@/features/inputs/life-events/commands/create-life-event/repository";
import { DeleteLifeEventEndpoint } from "@/features/inputs/life-events/commands/delete-life-event/endpoint";
import { DeleteLifeEventCommandHandler } from "@/features/inputs/life-events/commands/delete-life-event/handler";
import { SupabaseDeleteLifeEventRepository } from "@/features/inputs/life-events/commands/delete-life-event/repository";
import { UpdateLifeEventEndpoint } from "@/features/inputs/life-events/commands/update-life-event/endpoint";
import { UpdateLifeEventCommandHandler } from "@/features/inputs/life-events/commands/update-life-event/handler";
import { SupabaseUpdateLifeEventRepository } from "@/features/inputs/life-events/commands/update-life-event/repository";
import { ListLifeEventsEndpoint } from "@/features/inputs/life-events/queries/list-life-events/endpoint";
import { ListLifeEventsQueryHandler } from "@/features/inputs/life-events/queries/list-life-events/handler";
import { SupabaseListLifeEventsRepository } from "@/features/inputs/life-events/queries/list-life-events/repository";
import { CreateMortgageEndpoint } from "@/features/inputs/mortgages/commands/create-mortgage/endpoint";
import { CreateMortgageCommandHandler } from "@/features/inputs/mortgages/commands/create-mortgage/handler";
import { SupabaseCreateMortgageRepository } from "@/features/inputs/mortgages/commands/create-mortgage/repository";
import { DeleteMortgageEndpoint } from "@/features/inputs/mortgages/commands/delete-mortgage/endpoint";
import { DeleteMortgageCommandHandler } from "@/features/inputs/mortgages/commands/delete-mortgage/handler";
import { SupabaseDeleteMortgageRepository } from "@/features/inputs/mortgages/commands/delete-mortgage/repository";
import { UpdateMortgageEndpoint } from "@/features/inputs/mortgages/commands/update-mortgage/endpoint";
import { UpdateMortgageCommandHandler } from "@/features/inputs/mortgages/commands/update-mortgage/handler";
import { SupabaseUpdateMortgageRepository } from "@/features/inputs/mortgages/commands/update-mortgage/repository";
import { ListMortgagesEndpoint } from "@/features/inputs/mortgages/queries/list-mortgages/endpoint";
import { ListMortgagesQueryHandler } from "@/features/inputs/mortgages/queries/list-mortgages/handler";
import { SupabaseListMortgagesRepository } from "@/features/inputs/mortgages/queries/list-mortgages/repository";
import { CreateRentalEndpoint } from "@/features/inputs/rentals/commands/create-rental/endpoint";
import { CreateRentalCommandHandler } from "@/features/inputs/rentals/commands/create-rental/handler";
import { SupabaseCreateRentalRepository } from "@/features/inputs/rentals/commands/create-rental/repository";
import { DeleteRentalEndpoint } from "@/features/inputs/rentals/commands/delete-rental/endpoint";
import { DeleteRentalCommandHandler } from "@/features/inputs/rentals/commands/delete-rental/handler";
import { SupabaseDeleteRentalRepository } from "@/features/inputs/rentals/commands/delete-rental/repository";
import { UpdateRentalEndpoint } from "@/features/inputs/rentals/commands/update-rental/endpoint";
import { UpdateRentalCommandHandler } from "@/features/inputs/rentals/commands/update-rental/handler";
import { SupabaseUpdateRentalRepository } from "@/features/inputs/rentals/commands/update-rental/repository";
import { ListRentalsEndpoint } from "@/features/inputs/rentals/queries/list-rentals/endpoint";
import { ListRentalsQueryHandler } from "@/features/inputs/rentals/queries/list-rentals/handler";
import { SupabaseListRentalsRepository } from "@/features/inputs/rentals/queries/list-rentals/repository";
import type { Database } from "@/types/supabase";

import {
  assertSupabaseEnv,
  cleanupUserData,
  createAdminClient,
  createTestUser,
  createUserClient,
  hasSupabaseEnv,
} from "./support/supabase";

type AuthSession = {
  requireUserId: () => Promise<string>;
};

type InputTableName =
  | "assets"
  | "children"
  | "expenses"
  | "income_streams"
  | "life_events"
  | "mortgages"
  | "rentals";

type CrudEndpoints<TCreate, TUpdatePatch, TRow> = {
  create: { handle: (request: TCreate) => Promise<TRow> };
  list: { handle: (request: Record<string, never>) => Promise<TRow[]> };
  update: { handle: (request: { id: string; patch: TUpdatePatch }) => Promise<TRow> };
  delete: { handle: (request: { id: string }) => Promise<{ id: string }> };
};

const createAuthSession = (client: SupabaseClient<Database>): AuthSession => ({
  requireUserId: async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      throw error ?? new Error("Unauthorized");
    }
    return data.user.id;
  },
});

const buildAssetEndpoints = (client: SupabaseClient<Database>, auth: AuthSession) => ({
  create: new CreateAssetEndpoint(
    new CreateAssetCommandHandler(new SupabaseCreateAssetRepository(client)),
    auth,
  ),
  update: new UpdateAssetEndpoint(
    new UpdateAssetCommandHandler(new SupabaseUpdateAssetRepository(client)),
    auth,
  ),
  delete: new DeleteAssetEndpoint(
    new DeleteAssetCommandHandler(new SupabaseDeleteAssetRepository(client)),
    auth,
  ),
  list: new ListAssetsEndpoint(
    new ListAssetsQueryHandler(new SupabaseListAssetsRepository(client)),
    auth,
  ),
});

const buildChildEndpoints = (client: SupabaseClient<Database>, auth: AuthSession) => ({
  create: new CreateChildEndpoint(
    new CreateChildCommandHandler(new SupabaseCreateChildRepository(client)),
    auth,
  ),
  update: new UpdateChildEndpoint(
    new UpdateChildCommandHandler(new SupabaseUpdateChildRepository(client)),
    auth,
  ),
  delete: new DeleteChildEndpoint(
    new DeleteChildCommandHandler(new SupabaseDeleteChildRepository(client)),
    auth,
  ),
  list: new ListChildrenEndpoint(
    new ListChildrenQueryHandler(new SupabaseListChildrenRepository(client)),
    auth,
  ),
});

const buildExpenseEndpoints = (client: SupabaseClient<Database>, auth: AuthSession) => ({
  create: new CreateExpenseEndpoint(
    new CreateExpenseCommandHandler(new SupabaseCreateExpenseRepository(client)),
    auth,
  ),
  update: new UpdateExpenseEndpoint(
    new UpdateExpenseCommandHandler(new SupabaseUpdateExpenseRepository(client)),
    auth,
  ),
  delete: new DeleteExpenseEndpoint(
    new DeleteExpenseCommandHandler(new SupabaseDeleteExpenseRepository(client)),
    auth,
  ),
  list: new ListExpensesEndpoint(
    new ListExpensesQueryHandler(new SupabaseListExpensesRepository(client)),
    auth,
  ),
});

const buildIncomeStreamEndpoints = (client: SupabaseClient<Database>, auth: AuthSession) => ({
  create: new CreateIncomeStreamEndpoint(
    new CreateIncomeStreamCommandHandler(new SupabaseCreateIncomeStreamRepository(client)),
    auth,
  ),
  update: new UpdateIncomeStreamEndpoint(
    new UpdateIncomeStreamCommandHandler(new SupabaseUpdateIncomeStreamRepository(client)),
    auth,
  ),
  delete: new DeleteIncomeStreamEndpoint(
    new DeleteIncomeStreamCommandHandler(new SupabaseDeleteIncomeStreamRepository(client)),
    auth,
  ),
  list: new ListIncomeStreamsEndpoint(
    new ListIncomeStreamsQueryHandler(new SupabaseListIncomeStreamsRepository(client)),
    auth,
  ),
});

const buildLifeEventEndpoints = (client: SupabaseClient<Database>, auth: AuthSession) => ({
  create: new CreateLifeEventEndpoint(
    new CreateLifeEventCommandHandler(new SupabaseCreateLifeEventRepository(client)),
    auth,
  ),
  update: new UpdateLifeEventEndpoint(
    new UpdateLifeEventCommandHandler(new SupabaseUpdateLifeEventRepository(client)),
    auth,
  ),
  delete: new DeleteLifeEventEndpoint(
    new DeleteLifeEventCommandHandler(new SupabaseDeleteLifeEventRepository(client)),
    auth,
  ),
  list: new ListLifeEventsEndpoint(
    new ListLifeEventsQueryHandler(new SupabaseListLifeEventsRepository(client)),
    auth,
  ),
});

const buildMortgageEndpoints = (client: SupabaseClient<Database>, auth: AuthSession) => ({
  create: new CreateMortgageEndpoint(
    new CreateMortgageCommandHandler(new SupabaseCreateMortgageRepository(client)),
    auth,
  ),
  update: new UpdateMortgageEndpoint(
    new UpdateMortgageCommandHandler(new SupabaseUpdateMortgageRepository(client)),
    auth,
  ),
  delete: new DeleteMortgageEndpoint(
    new DeleteMortgageCommandHandler(new SupabaseDeleteMortgageRepository(client)),
    auth,
  ),
  list: new ListMortgagesEndpoint(
    new ListMortgagesQueryHandler(new SupabaseListMortgagesRepository(client)),
    auth,
  ),
});

const buildRentalEndpoints = (client: SupabaseClient<Database>, auth: AuthSession) => ({
  create: new CreateRentalEndpoint(
    new CreateRentalCommandHandler(new SupabaseCreateRentalRepository(client)),
    auth,
  ),
  update: new UpdateRentalEndpoint(
    new UpdateRentalCommandHandler(new SupabaseUpdateRentalRepository(client)),
    auth,
  ),
  delete: new DeleteRentalEndpoint(
    new DeleteRentalCommandHandler(new SupabaseDeleteRentalRepository(client)),
    auth,
  ),
  list: new ListRentalsEndpoint(
    new ListRentalsQueryHandler(new SupabaseListRentalsRepository(client)),
    auth,
  ),
});

const runCrudRlsScenario = async <
  TCreate,
  TUpdatePatch,
  TRow extends { id: string; user_id: string },
>(
  name: string,
  table: InputTableName,
  endpointsA: CrudEndpoints<TCreate, TUpdatePatch, TRow>,
  endpointsB: CrudEndpoints<TCreate, TUpdatePatch, TRow>,
  createA: TCreate,
  createB: TCreate,
  updatePatch: TUpdatePatch,
  clientA: SupabaseClient<Database>,
  clientB: SupabaseClient<Database>,
  userAId: string,
  userBId: string,
  assertCreated: (row: TRow, userId: string) => void,
  assertUpdated: (row: TRow) => void,
) => {
  const createdA = await endpointsA.create.handle(createA);
  const createdB = await endpointsB.create.handle(createB);

  expect(createdA.id, `${name} create A should return id`).toBeDefined();
  expect(createdB.id, `${name} create B should return id`).toBeDefined();

  assertCreated(createdA, userAId);
  assertCreated(createdB, userBId);

  const listA = await endpointsA.list.handle({});
  expect(listA.some((row) => row.id === createdA.id)).toBe(true);
  expect(listA.some((row) => row.id === createdB.id)).toBe(false);

  const listB = await endpointsB.list.handle({});
  expect(listB.some((row) => row.id === createdB.id)).toBe(true);
  expect(listB.some((row) => row.id === createdA.id)).toBe(false);

  const updatedA = await endpointsA.update.handle({ id: createdA.id, patch: updatePatch });
  assertUpdated(updatedA);

  await expect(
    endpointsB.update.handle({ id: createdA.id, patch: updatePatch }),
  ).rejects.toBeTruthy();

  const { data: forbiddenRows, error: forbiddenError } = await clientA
    .from(table)
    .select("id")
    .eq("id", createdB.id);
  if (forbiddenError) {
    throw forbiddenError;
  }
  expect(forbiddenRows?.length ?? 0).toBe(0);

  await endpointsA.delete.handle({ id: createdA.id });

  const listAfterDelete = await endpointsA.list.handle({});
  expect(listAfterDelete.some((row) => row.id === createdA.id)).toBe(false);

  const { data: stillThere, error: stillThereError } = await clientB
    .from(table)
    .select("id")
    .eq("id", createdB.id)
    .maybeSingle();
  if (stillThereError) {
    throw stillThereError;
  }
  expect(stillThere?.id).toBe(createdB.id);
};

const describeIf = hasSupabaseEnv ? describe : describe.skip;

describeIf("Inputs CRUD + RLS (Endpoint/Handler + Supabase)", () => {
  let admin: ReturnType<typeof createAdminClient>;
  let userA: { id: string; email: string; password: string };
  let userB: { id: string; email: string; password: string };
  let clientA: SupabaseClient<Database>;
  let clientB: SupabaseClient<Database>;

  beforeAll(async () => {
    assertSupabaseEnv();
    admin = createAdminClient();
    userA = await createTestUser(admin, "inputs-a");
    userB = await createTestUser(admin, "inputs-b");
    clientA = await createUserClient(userA.email, userA.password);
    clientB = await createUserClient(userB.email, userB.password);
  });

  afterAll(async () => {
    if (!hasSupabaseEnv) {
      return;
    }
    await cleanupUserData(admin, userA.id);
    await cleanupUserData(admin, userB.id);
    await admin.auth.admin.deleteUser(userA.id);
    await admin.auth.admin.deleteUser(userB.id);
  });

  it("validates assets CRUD and RLS", async () => {
    const authA = createAuthSession(clientA);
    const authB = createAuthSession(clientB);
    const endpointsA = buildAssetEndpoints(clientA, authA);
    const endpointsB = buildAssetEndpoints(clientB, authB);

    await runCrudRlsScenario(
      "assets",
      "assets",
      endpointsA,
      endpointsB,
      { cash_balance: 10000, investment_balance: 50000, return_rate: 0.03 },
      { cash_balance: 15000, investment_balance: 60000, return_rate: 0.04 },
      { cash_balance: 12000 },
      clientA,
      clientB,
      userA.id,
      userB.id,
      (row, userId) => {
        expect(row.user_id).toBe(userId);
        expect(Number(row.cash_balance)).toBeGreaterThan(0);
      },
      (row) => {
        expect(Number(row.cash_balance)).toBe(12000);
      },
    );
  }, 20000);

  it("validates children CRUD and RLS", async () => {
    const authA = createAuthSession(clientA);
    const authB = createAuthSession(clientB);
    const endpointsA = buildChildEndpoints(clientA, authA);
    const endpointsB = buildChildEndpoints(clientB, authB);

    await runCrudRlsScenario(
      "children",
      "children",
      endpointsA,
      endpointsB,
      { label: "Child A", birth_year_month: "2030-01-01", due_year_month: null, note: null },
      { label: "Child B", birth_year_month: "2031-01-01", due_year_month: null, note: "note" },
      { label: "Child A+", note: "updated" },
      clientA,
      clientB,
      userA.id,
      userB.id,
      (row, userId) => {
        expect(row.user_id).toBe(userId);
        expect(row.label.length).toBeGreaterThan(0);
      },
      (row) => {
        expect(row.label).toBe("Child A+");
        expect(row.note).toBe("updated");
      },
    );
  }, 20000);

  it("validates expenses CRUD and RLS", async () => {
    const authA = createAuthSession(clientA);
    const authB = createAuthSession(clientB);
    const endpointsA = buildExpenseEndpoints(clientA, authA);
    const endpointsB = buildExpenseEndpoints(clientB, authB);

    await runCrudRlsScenario(
      "expenses",
      "expenses",
      endpointsA,
      endpointsB,
      {
        label: "Food",
        amount_monthly: 500,
        inflation_rate: 0,
        category: "living",
        start_year_month: "2025-01-01",
        end_year_month: null,
      },
      {
        label: "Travel",
        amount_monthly: 800,
        inflation_rate: 0.01,
        category: "leisure",
        start_year_month: "2026-01-01",
        end_year_month: null,
      },
      { amount_monthly: 650 },
      clientA,
      clientB,
      userA.id,
      userB.id,
      (row, userId) => {
        expect(row.user_id).toBe(userId);
        expect(Number(row.amount_monthly)).toBeGreaterThan(0);
      },
      (row) => {
        expect(Number(row.amount_monthly)).toBe(650);
      },
    );
  }, 20000);

  it("validates income streams CRUD and RLS", async () => {
    const authA = createAuthSession(clientA);
    const authB = createAuthSession(clientB);
    const endpointsA = buildIncomeStreamEndpoints(clientA, authA);
    const endpointsB = buildIncomeStreamEndpoints(clientB, authB);

    await runCrudRlsScenario(
      "income_streams",
      "income_streams",
      endpointsA,
      endpointsB,
      {
        label: "Salary",
        take_home_monthly: 3000,
        bonus_months: [6, 12],
        bonus_amount: 1000,
        change_year_month: null,
        bonus_amount_after: null,
        raise_rate: 0.01,
        start_year_month: "2025-01-01",
        end_year_month: null,
      },
      {
        label: "Freelance",
        take_home_monthly: 2000,
        bonus_months: [12],
        bonus_amount: 500,
        change_year_month: null,
        bonus_amount_after: null,
        raise_rate: 0.02,
        start_year_month: "2026-01-01",
        end_year_month: null,
      },
      { label: "Salary+" },
      clientA,
      clientB,
      userA.id,
      userB.id,
      (row, userId) => {
        expect(row.user_id).toBe(userId);
        expect(row.label.length).toBeGreaterThan(0);
      },
      (row) => {
        expect(row.label).toBe("Salary+");
      },
    );
  }, 20000);

  it("validates rentals CRUD and RLS", async () => {
    const authA = createAuthSession(clientA);
    const authB = createAuthSession(clientB);
    const endpointsA = buildRentalEndpoints(clientA, authA);
    const endpointsB = buildRentalEndpoints(clientB, authB);

    await runCrudRlsScenario(
      "rentals",
      "rentals",
      endpointsA,
      endpointsB,
      { rent_monthly: 1200, start_year_month: "2025-01-01", end_year_month: null },
      { rent_monthly: 1400, start_year_month: "2026-01-01", end_year_month: null },
      { rent_monthly: 1300 },
      clientA,
      clientB,
      userA.id,
      userB.id,
      (row, userId) => {
        expect(row.user_id).toBe(userId);
        expect(Number(row.rent_monthly)).toBeGreaterThan(0);
      },
      (row) => {
        expect(Number(row.rent_monthly)).toBe(1300);
      },
    );
  }, 20000);

  it("validates mortgages CRUD and RLS", async () => {
    const authA = createAuthSession(clientA);
    const authB = createAuthSession(clientB);
    const endpointsA = buildMortgageEndpoints(clientA, authA);
    const endpointsB = buildMortgageEndpoints(clientB, authB);

    await runCrudRlsScenario(
      "mortgages",
      "mortgages",
      endpointsA,
      endpointsB,
      {
        principal: 300000,
        annual_rate: 0.015,
        years: 35,
        start_year_month: "2025-01-01",
        building_price: 250000,
        land_price: 50000,
        down_payment: 20000,
        target_rental_id: null,
      },
      {
        principal: 280000,
        annual_rate: 0.02,
        years: 30,
        start_year_month: "2026-01-01",
        building_price: 220000,
        land_price: 60000,
        down_payment: 15000,
        target_rental_id: null,
      },
      { annual_rate: 0.02 },
      clientA,
      clientB,
      userA.id,
      userB.id,
      (row, userId) => {
        expect(row.user_id).toBe(userId);
        expect(Number(row.principal)).toBeGreaterThan(0);
      },
      (row) => {
        expect(Number(row.annual_rate)).toBe(0.02);
      },
    );
  }, 20000);

  it("validates life events CRUD and RLS", async () => {
    const authA = createAuthSession(clientA);
    const authB = createAuthSession(clientB);
    const endpointsA = buildLifeEventEndpoints(clientA, authA);
    const endpointsB = buildLifeEventEndpoints(clientB, authB);

    await runCrudRlsScenario(
      "life_events",
      "life_events",
      endpointsA,
      endpointsB,
      {
        label: "Trip",
        amount: 2000,
        year_month: "2026-06-01",
        repeat_interval_years: null,
        stop_after_occurrences: null,
        category: "travel",
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
        target_rental_id: null,
      },
      {
        label: "Car",
        amount: 3000,
        year_month: "2027-01-01",
        repeat_interval_years: null,
        stop_after_occurrences: null,
        category: "car",
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
        target_rental_id: null,
      },
      { amount: 2500 },
      clientA,
      clientB,
      userA.id,
      userB.id,
      (row, userId) => {
        expect(row.user_id).toBe(userId);
        expect(Number(row.amount)).toBeGreaterThan(0);
      },
      (row) => {
        expect(Number(row.amount)).toBe(2500);
      },
    );
  }, 20000);
});
