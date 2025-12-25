import { describe, expect, it, vi } from "vitest";

import { CreateAssetEndpoint } from "@/features/inputs/assets/commands/create-asset/endpoint";
import { CreateAssetCommandHandler } from "@/features/inputs/assets/commands/create-asset/handler";
import { DeleteAssetEndpoint } from "@/features/inputs/assets/commands/delete-asset/endpoint";
import { DeleteAssetCommandHandler } from "@/features/inputs/assets/commands/delete-asset/handler";
import { UpdateAssetEndpoint } from "@/features/inputs/assets/commands/update-asset/endpoint";
import { UpdateAssetCommandHandler } from "@/features/inputs/assets/commands/update-asset/handler";
import { ListAssetsEndpoint } from "@/features/inputs/assets/queries/list-assets/endpoint";
import { ListAssetsQueryHandler } from "@/features/inputs/assets/queries/list-assets/handler";
import { CreateChildEndpoint } from "@/features/inputs/children/commands/create-child/endpoint";
import { CreateChildCommandHandler } from "@/features/inputs/children/commands/create-child/handler";
import { DeleteChildEndpoint } from "@/features/inputs/children/commands/delete-child/endpoint";
import { DeleteChildCommandHandler } from "@/features/inputs/children/commands/delete-child/handler";
import { UpdateChildEndpoint } from "@/features/inputs/children/commands/update-child/endpoint";
import { UpdateChildCommandHandler } from "@/features/inputs/children/commands/update-child/handler";
import { ListChildrenEndpoint } from "@/features/inputs/children/queries/list-children/endpoint";
import { ListChildrenQueryHandler } from "@/features/inputs/children/queries/list-children/handler";
import { CreateExpenseEndpoint } from "@/features/inputs/expenses/commands/create-expense/endpoint";
import { CreateExpenseCommandHandler } from "@/features/inputs/expenses/commands/create-expense/handler";
import { DeleteExpenseEndpoint } from "@/features/inputs/expenses/commands/delete-expense/endpoint";
import { DeleteExpenseCommandHandler } from "@/features/inputs/expenses/commands/delete-expense/handler";
import { UpdateExpenseEndpoint } from "@/features/inputs/expenses/commands/update-expense/endpoint";
import { UpdateExpenseCommandHandler } from "@/features/inputs/expenses/commands/update-expense/handler";
import { ListExpensesEndpoint } from "@/features/inputs/expenses/queries/list-expenses/endpoint";
import { ListExpensesQueryHandler } from "@/features/inputs/expenses/queries/list-expenses/handler";
import { CreateIncomeStreamEndpoint } from "@/features/inputs/income-streams/commands/create-income-stream/endpoint";
import { CreateIncomeStreamCommandHandler } from "@/features/inputs/income-streams/commands/create-income-stream/handler";
import { DeleteIncomeStreamEndpoint } from "@/features/inputs/income-streams/commands/delete-income-stream/endpoint";
import { DeleteIncomeStreamCommandHandler } from "@/features/inputs/income-streams/commands/delete-income-stream/handler";
import { UpdateIncomeStreamEndpoint } from "@/features/inputs/income-streams/commands/update-income-stream/endpoint";
import { UpdateIncomeStreamCommandHandler } from "@/features/inputs/income-streams/commands/update-income-stream/handler";
import { ListIncomeStreamsEndpoint } from "@/features/inputs/income-streams/queries/list-income-streams/endpoint";
import { ListIncomeStreamsQueryHandler } from "@/features/inputs/income-streams/queries/list-income-streams/handler";
import { CreateLifeEventEndpoint } from "@/features/inputs/life-events/commands/create-life-event/endpoint";
import { CreateLifeEventCommandHandler } from "@/features/inputs/life-events/commands/create-life-event/handler";
import { DeleteLifeEventEndpoint } from "@/features/inputs/life-events/commands/delete-life-event/endpoint";
import { DeleteLifeEventCommandHandler } from "@/features/inputs/life-events/commands/delete-life-event/handler";
import { UpdateLifeEventEndpoint } from "@/features/inputs/life-events/commands/update-life-event/endpoint";
import { UpdateLifeEventCommandHandler } from "@/features/inputs/life-events/commands/update-life-event/handler";
import { ListLifeEventsEndpoint } from "@/features/inputs/life-events/queries/list-life-events/endpoint";
import { ListLifeEventsQueryHandler } from "@/features/inputs/life-events/queries/list-life-events/handler";
import { CreateMortgageEndpoint } from "@/features/inputs/mortgages/commands/create-mortgage/endpoint";
import { CreateMortgageCommandHandler } from "@/features/inputs/mortgages/commands/create-mortgage/handler";
import { DeleteMortgageEndpoint } from "@/features/inputs/mortgages/commands/delete-mortgage/endpoint";
import { DeleteMortgageCommandHandler } from "@/features/inputs/mortgages/commands/delete-mortgage/handler";
import { UpdateMortgageEndpoint } from "@/features/inputs/mortgages/commands/update-mortgage/endpoint";
import { UpdateMortgageCommandHandler } from "@/features/inputs/mortgages/commands/update-mortgage/handler";
import { ListMortgagesEndpoint } from "@/features/inputs/mortgages/queries/list-mortgages/endpoint";
import { ListMortgagesQueryHandler } from "@/features/inputs/mortgages/queries/list-mortgages/handler";
import { CreateRentalEndpoint } from "@/features/inputs/rentals/commands/create-rental/endpoint";
import { CreateRentalCommandHandler } from "@/features/inputs/rentals/commands/create-rental/handler";
import { DeleteRentalEndpoint } from "@/features/inputs/rentals/commands/delete-rental/endpoint";
import { DeleteRentalCommandHandler } from "@/features/inputs/rentals/commands/delete-rental/handler";
import { UpdateRentalEndpoint } from "@/features/inputs/rentals/commands/update-rental/endpoint";
import { UpdateRentalCommandHandler } from "@/features/inputs/rentals/commands/update-rental/handler";
import { ListRentalsEndpoint } from "@/features/inputs/rentals/queries/list-rentals/endpoint";
import { ListRentalsQueryHandler } from "@/features/inputs/rentals/queries/list-rentals/handler";

const userId = "user-1";

const childInput = {
  label: "Child",
  birth_year_month: "2030-01-01",
  due_year_month: null,
  note: null,
};

const incomeStreamInput = {
  label: "Salary",
  take_home_monthly: 3000,
  bonus_months: [6, 12],
  bonus_amount: 1000,
  change_year_month: null,
  bonus_amount_after: null,
  raise_rate: 0.01,
  start_year_month: "2025-01-01",
  end_year_month: null,
};

const expenseInput = {
  label: "Food",
  amount_monthly: 500,
  inflation_rate: 0,
  category: "living",
  start_year_month: "2025-01-01",
  end_year_month: null,
};

const rentalInput = {
  rent_monthly: 1200,
  start_year_month: "2025-01-01",
  end_year_month: null,
};

const assetInput = {
  cash_balance: 10000,
  investment_balance: 50000,
  return_rate: 0.03,
};

const mortgageInput = {
  principal: 300000,
  annual_rate: 0.015,
  years: 35,
  start_year_month: "2025-01-01",
  building_price: 250000,
  land_price: 50000,
  down_payment: 20000,
  target_rental_id: null,
};

const lifeEventInput = {
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
};

const childRow = { id: "child-1", user_id: userId, ...childInput };
const incomeStreamRow = { id: "income-1", user_id: userId, ...incomeStreamInput };
const expenseRow = { id: "expense-1", user_id: userId, ...expenseInput };
const rentalRow = { id: "rental-1", user_id: userId, ...rentalInput };
const assetRow = { id: "asset-1", user_id: userId, ...assetInput };
const mortgageRow = { id: "mortgage-1", user_id: userId, ...mortgageInput };
const lifeEventRow = { id: "life-1", user_id: userId, ...lifeEventInput };

type EndpointCase = {
  name: string;
  Endpoint: unknown;
  request: Record<string, unknown>;
  expectedCommand: Record<string, unknown>;
  response: unknown;
};

type HandlerCase = {
  name: string;
  Handler: unknown;
  repoMethod: string;
  command: Record<string, unknown>;
  response: unknown;
};

const endpointCases: EndpointCase[] = [
  {
    name: "children create",
    Endpoint: CreateChildEndpoint,
    request: childInput,
    expectedCommand: { userId, ...childInput },
    response: childRow,
  },
  {
    name: "children update",
    Endpoint: UpdateChildEndpoint,
    request: { id: "child-1", patch: { label: "Updated" } },
    expectedCommand: { userId, id: "child-1", patch: { label: "Updated" } },
    response: { ...childRow, label: "Updated" },
  },
  {
    name: "children delete",
    Endpoint: DeleteChildEndpoint,
    request: { id: "child-1" },
    expectedCommand: { userId, id: "child-1" },
    response: { id: "child-1" },
  },
  {
    name: "children list",
    Endpoint: ListChildrenEndpoint,
    request: {},
    expectedCommand: { userId },
    response: [childRow],
  },
  {
    name: "income streams create",
    Endpoint: CreateIncomeStreamEndpoint,
    request: incomeStreamInput,
    expectedCommand: { userId, ...incomeStreamInput },
    response: incomeStreamRow,
  },
  {
    name: "income streams update",
    Endpoint: UpdateIncomeStreamEndpoint,
    request: { id: "income-1", patch: { label: "Updated" } },
    expectedCommand: { userId, id: "income-1", patch: { label: "Updated" } },
    response: { ...incomeStreamRow, label: "Updated" },
  },
  {
    name: "income streams delete",
    Endpoint: DeleteIncomeStreamEndpoint,
    request: { id: "income-1" },
    expectedCommand: { userId, id: "income-1" },
    response: { id: "income-1" },
  },
  {
    name: "income streams list",
    Endpoint: ListIncomeStreamsEndpoint,
    request: {},
    expectedCommand: { userId },
    response: [incomeStreamRow],
  },
  {
    name: "expenses create",
    Endpoint: CreateExpenseEndpoint,
    request: expenseInput,
    expectedCommand: { userId, ...expenseInput },
    response: expenseRow,
  },
  {
    name: "expenses update",
    Endpoint: UpdateExpenseEndpoint,
    request: { id: "expense-1", patch: { amount_monthly: 650 } },
    expectedCommand: { userId, id: "expense-1", patch: { amount_monthly: 650 } },
    response: { ...expenseRow, amount_monthly: 650 },
  },
  {
    name: "expenses delete",
    Endpoint: DeleteExpenseEndpoint,
    request: { id: "expense-1" },
    expectedCommand: { userId, id: "expense-1" },
    response: { id: "expense-1" },
  },
  {
    name: "expenses list",
    Endpoint: ListExpensesEndpoint,
    request: {},
    expectedCommand: { userId },
    response: [expenseRow],
  },
  {
    name: "rentals create",
    Endpoint: CreateRentalEndpoint,
    request: rentalInput,
    expectedCommand: { userId, ...rentalInput },
    response: rentalRow,
  },
  {
    name: "rentals update",
    Endpoint: UpdateRentalEndpoint,
    request: { id: "rental-1", patch: { rent_monthly: 1400 } },
    expectedCommand: { userId, id: "rental-1", patch: { rent_monthly: 1400 } },
    response: { ...rentalRow, rent_monthly: 1400 },
  },
  {
    name: "rentals delete",
    Endpoint: DeleteRentalEndpoint,
    request: { id: "rental-1" },
    expectedCommand: { userId, id: "rental-1" },
    response: { id: "rental-1" },
  },
  {
    name: "rentals list",
    Endpoint: ListRentalsEndpoint,
    request: {},
    expectedCommand: { userId },
    response: [rentalRow],
  },
  {
    name: "assets create",
    Endpoint: CreateAssetEndpoint,
    request: assetInput,
    expectedCommand: { userId, ...assetInput },
    response: assetRow,
  },
  {
    name: "assets update",
    Endpoint: UpdateAssetEndpoint,
    request: { id: "asset-1", patch: { cash_balance: 12000 } },
    expectedCommand: { userId, id: "asset-1", patch: { cash_balance: 12000 } },
    response: { ...assetRow, cash_balance: 12000 },
  },
  {
    name: "assets delete",
    Endpoint: DeleteAssetEndpoint,
    request: { id: "asset-1" },
    expectedCommand: { userId, id: "asset-1" },
    response: { id: "asset-1" },
  },
  {
    name: "assets list",
    Endpoint: ListAssetsEndpoint,
    request: {},
    expectedCommand: { userId },
    response: [assetRow],
  },
  {
    name: "mortgages create",
    Endpoint: CreateMortgageEndpoint,
    request: mortgageInput,
    expectedCommand: { userId, ...mortgageInput },
    response: mortgageRow,
  },
  {
    name: "mortgages update",
    Endpoint: UpdateMortgageEndpoint,
    request: { id: "mortgage-1", patch: { years: 30 } },
    expectedCommand: { userId, id: "mortgage-1", patch: { years: 30 } },
    response: { ...mortgageRow, years: 30 },
  },
  {
    name: "mortgages delete",
    Endpoint: DeleteMortgageEndpoint,
    request: { id: "mortgage-1" },
    expectedCommand: { userId, id: "mortgage-1" },
    response: { id: "mortgage-1" },
  },
  {
    name: "mortgages list",
    Endpoint: ListMortgagesEndpoint,
    request: {},
    expectedCommand: { userId },
    response: [mortgageRow],
  },
  {
    name: "life events create",
    Endpoint: CreateLifeEventEndpoint,
    request: lifeEventInput,
    expectedCommand: { userId, ...lifeEventInput },
    response: lifeEventRow,
  },
  {
    name: "life events update",
    Endpoint: UpdateLifeEventEndpoint,
    request: { id: "life-1", patch: { amount: 2500 } },
    expectedCommand: { userId, id: "life-1", patch: { amount: 2500 } },
    response: { ...lifeEventRow, amount: 2500 },
  },
  {
    name: "life events delete",
    Endpoint: DeleteLifeEventEndpoint,
    request: { id: "life-1" },
    expectedCommand: { userId, id: "life-1" },
    response: { id: "life-1" },
  },
  {
    name: "life events list",
    Endpoint: ListLifeEventsEndpoint,
    request: {},
    expectedCommand: { userId },
    response: [lifeEventRow],
  },
];

const handlerCases: HandlerCase[] = [
  {
    name: "children create",
    Handler: CreateChildCommandHandler,
    repoMethod: "insert",
    command: { userId, ...childInput },
    response: childRow,
  },
  {
    name: "children update",
    Handler: UpdateChildCommandHandler,
    repoMethod: "update",
    command: { userId, id: "child-1", patch: { label: "Updated" } },
    response: { ...childRow, label: "Updated" },
  },
  {
    name: "children delete",
    Handler: DeleteChildCommandHandler,
    repoMethod: "delete",
    command: { userId, id: "child-1" },
    response: { id: "child-1" },
  },
  {
    name: "children list",
    Handler: ListChildrenQueryHandler,
    repoMethod: "fetch",
    command: { userId },
    response: [childRow],
  },
  {
    name: "income streams create",
    Handler: CreateIncomeStreamCommandHandler,
    repoMethod: "insert",
    command: { userId, ...incomeStreamInput },
    response: incomeStreamRow,
  },
  {
    name: "income streams update",
    Handler: UpdateIncomeStreamCommandHandler,
    repoMethod: "update",
    command: { userId, id: "income-1", patch: { label: "Updated" } },
    response: { ...incomeStreamRow, label: "Updated" },
  },
  {
    name: "income streams delete",
    Handler: DeleteIncomeStreamCommandHandler,
    repoMethod: "delete",
    command: { userId, id: "income-1" },
    response: { id: "income-1" },
  },
  {
    name: "income streams list",
    Handler: ListIncomeStreamsQueryHandler,
    repoMethod: "fetch",
    command: { userId },
    response: [incomeStreamRow],
  },
  {
    name: "expenses create",
    Handler: CreateExpenseCommandHandler,
    repoMethod: "insert",
    command: { userId, ...expenseInput },
    response: expenseRow,
  },
  {
    name: "expenses update",
    Handler: UpdateExpenseCommandHandler,
    repoMethod: "update",
    command: { userId, id: "expense-1", patch: { amount_monthly: 650 } },
    response: { ...expenseRow, amount_monthly: 650 },
  },
  {
    name: "expenses delete",
    Handler: DeleteExpenseCommandHandler,
    repoMethod: "delete",
    command: { userId, id: "expense-1" },
    response: { id: "expense-1" },
  },
  {
    name: "expenses list",
    Handler: ListExpensesQueryHandler,
    repoMethod: "fetch",
    command: { userId },
    response: [expenseRow],
  },
  {
    name: "rentals create",
    Handler: CreateRentalCommandHandler,
    repoMethod: "insert",
    command: { userId, ...rentalInput },
    response: rentalRow,
  },
  {
    name: "rentals update",
    Handler: UpdateRentalCommandHandler,
    repoMethod: "update",
    command: { userId, id: "rental-1", patch: { rent_monthly: 1400 } },
    response: { ...rentalRow, rent_monthly: 1400 },
  },
  {
    name: "rentals delete",
    Handler: DeleteRentalCommandHandler,
    repoMethod: "delete",
    command: { userId, id: "rental-1" },
    response: { id: "rental-1" },
  },
  {
    name: "rentals list",
    Handler: ListRentalsQueryHandler,
    repoMethod: "fetch",
    command: { userId },
    response: [rentalRow],
  },
  {
    name: "assets create",
    Handler: CreateAssetCommandHandler,
    repoMethod: "insert",
    command: { userId, ...assetInput },
    response: assetRow,
  },
  {
    name: "assets update",
    Handler: UpdateAssetCommandHandler,
    repoMethod: "update",
    command: { userId, id: "asset-1", patch: { cash_balance: 12000 } },
    response: { ...assetRow, cash_balance: 12000 },
  },
  {
    name: "assets delete",
    Handler: DeleteAssetCommandHandler,
    repoMethod: "delete",
    command: { userId, id: "asset-1" },
    response: { id: "asset-1" },
  },
  {
    name: "assets list",
    Handler: ListAssetsQueryHandler,
    repoMethod: "fetch",
    command: { userId },
    response: [assetRow],
  },
  {
    name: "mortgages create",
    Handler: CreateMortgageCommandHandler,
    repoMethod: "insert",
    command: { userId, ...mortgageInput },
    response: mortgageRow,
  },
  {
    name: "mortgages update",
    Handler: UpdateMortgageCommandHandler,
    repoMethod: "update",
    command: { userId, id: "mortgage-1", patch: { years: 30 } },
    response: { ...mortgageRow, years: 30 },
  },
  {
    name: "mortgages delete",
    Handler: DeleteMortgageCommandHandler,
    repoMethod: "delete",
    command: { userId, id: "mortgage-1" },
    response: { id: "mortgage-1" },
  },
  {
    name: "mortgages list",
    Handler: ListMortgagesQueryHandler,
    repoMethod: "fetch",
    command: { userId },
    response: [mortgageRow],
  },
  {
    name: "life events create",
    Handler: CreateLifeEventCommandHandler,
    repoMethod: "insert",
    command: { userId, ...lifeEventInput },
    response: lifeEventRow,
  },
  {
    name: "life events update",
    Handler: UpdateLifeEventCommandHandler,
    repoMethod: "update",
    command: { userId, id: "life-1", patch: { amount: 2500 } },
    response: { ...lifeEventRow, amount: 2500 },
  },
  {
    name: "life events delete",
    Handler: DeleteLifeEventCommandHandler,
    repoMethod: "delete",
    command: { userId, id: "life-1" },
    response: { id: "life-1" },
  },
  {
    name: "life events list",
    Handler: ListLifeEventsQueryHandler,
    repoMethod: "fetch",
    command: { userId },
    response: [lifeEventRow],
  },
];

describe("CRUD endpoints", () => {
  endpointCases.forEach(({ name, Endpoint, request, expectedCommand, response }) => {
    it(`delegates ${name} to handler with auth user`, async () => {
      const handler = { execute: vi.fn().mockResolvedValue(response) };
      const auth = { requireUserId: vi.fn().mockResolvedValue(userId) };

      const endpointCtor = Endpoint as new (
        handler: Record<string, unknown>,
        auth: Record<string, unknown>,
      ) => {
        handle: (request: Record<string, unknown>) => Promise<unknown>;
      };
      const endpoint = new endpointCtor(handler, auth);
      const result = await endpoint.handle(request);

      expect(auth.requireUserId).toHaveBeenCalledTimes(1);
      expect(handler.execute).toHaveBeenCalledWith(expectedCommand);
      expect(result).toBe(response);
    });
  });
});

describe("CRUD handlers", () => {
  handlerCases.forEach(({ name, Handler, repoMethod, command, response }) => {
    it(`delegates ${name} to repository`, async () => {
      const repository = {
        [repoMethod]: vi.fn().mockResolvedValue(response),
      } as Record<string, unknown>;

      const handlerCtor = Handler as new (
        repository: Record<string, unknown>,
      ) => {
        execute: (command: Record<string, unknown>) => Promise<unknown>;
      };
      const handler = new handlerCtor(repository);
      const result = await handler.execute(command);

      expect(repository[repoMethod]).toHaveBeenCalledWith(command);
      expect(result).toBe(response);
    });
  });
});
