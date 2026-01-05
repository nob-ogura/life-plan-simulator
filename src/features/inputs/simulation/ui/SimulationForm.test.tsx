import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UI_TEXT } from "@/shared/constants/messages";
import type { AuthContextValue } from "@/shared/cross-cutting/auth";
import { useAuth } from "@/shared/cross-cutting/auth";
import { createMockSession, createMockUser } from "@/test/factories/auth";
import type { Tables } from "@/types/supabase";

import { SimulationForm } from "./SimulationForm";

const { refresh } = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock("@/shared/cross-cutting/auth", () => ({
  useAuth: vi.fn(),
}));

const createSimulationSettingsAction = vi.fn();
const updateSimulationSettingsAction = vi.fn();
const resetSimulationSettingsAction = vi.fn();

vi.mock("@/features/inputs/simulation-settings/commands/create-simulation-settings/action", () => ({
  createSimulationSettingsAction: (...args: unknown[]) => createSimulationSettingsAction(...args),
}));

vi.mock("@/features/inputs/simulation-settings/commands/update-simulation-settings/action", () => ({
  updateSimulationSettingsAction: (...args: unknown[]) => updateSimulationSettingsAction(...args),
}));

vi.mock("@/features/inputs/simulation-settings/commands/reset-simulation-settings/action", () => ({
  resetSimulationSettingsAction: (...args: unknown[]) => resetSimulationSettingsAction(...args),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe("SimulationForm", () => {
  const baseDefaults = {
    start_offset_months: "",
    end_age: "100",
    mortgage_transaction_cost_rate: "",
    real_estate_tax_rate: "",
    real_estate_evaluation_rate: "",
  };

  beforeEach(() => {
    refresh.mockClear();
    createSimulationSettingsAction.mockReset();
    updateSimulationSettingsAction.mockReset();
    resetSimulationSettingsAction.mockReset();
    const authValue: AuthContextValue = {
      session: createMockSession({ user: createMockUser({ id: "user-1" }) }),
      isReady: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    mockedUseAuth.mockReturnValue(authValue);
  });

  it("converts numeric strings to numbers and omits empty fields", async () => {
    createSimulationSettingsAction.mockResolvedValue({ ok: true, data: {} });

    render(<SimulationForm defaultValues={baseDefaults} settingsId={null} />);

    fireEvent.change(screen.getByLabelText("開始オフセット（月）"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("終了年齢"), {
      target: { value: "90" },
    });
    fireEvent.change(screen.getByLabelText("諸経費率"), {
      target: { value: "1.05" },
    });

    fireEvent.click(screen.getByRole("button", { name: UI_TEXT.REGISTER }));

    await waitFor(() => {
      expect(createSimulationSettingsAction).toHaveBeenCalledWith({
        start_offset_months: 2,
        end_age: 90,
        mortgage_transaction_cost_rate: 1.05,
      });
    });
  });

  it("resets fields when reset action succeeds", async () => {
    const resetData = {
      id: "settings-1",
      user_id: "user-1",
      start_offset_months: 0,
      end_age: 100,
      mortgage_transaction_cost_rate: 1.03,
      real_estate_tax_rate: 0.014,
      real_estate_evaluation_rate: 0.7,
      pension_amount_single: 65000,
      pension_amount_spouse: 130000,
      created_at: "2026-01-02T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
    } satisfies Tables<"simulation_settings">;

    resetSimulationSettingsAction.mockResolvedValue({ ok: true, data: resetData });

    render(
      <SimulationForm
        defaultValues={{
          start_offset_months: "4",
          end_age: "85",
          mortgage_transaction_cost_rate: "1.2",
          real_estate_tax_rate: "0.02",
          real_estate_evaluation_rate: "0.8",
        }}
        settingsId="settings-1"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "初期値に戻す" }));

    await waitFor(() => {
      expect(resetSimulationSettingsAction).toHaveBeenCalledWith({});
    });

    await waitFor(() => {
      expect(screen.getByLabelText("開始オフセット（月）")).toHaveValue("0");
      expect(screen.getByLabelText("終了年齢")).toHaveValue("100");
      expect(screen.getByLabelText("諸経費率")).toHaveValue("1.03");
      expect(screen.getByLabelText("固定資産税率")).toHaveValue("0.014");
      expect(screen.getByLabelText("評価額掛目")).toHaveValue("0.7");
    });

    expect(refresh).toHaveBeenCalled();
  });
});
