import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Tables } from "@/types/supabase";
import { LifeEventSection } from "./LifeEventSection";

const { refresh } = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

const createLifeEventAction = vi.fn();
const deleteLifeEventAction = vi.fn();

vi.mock("@/features/inputs/life-events/commands/create-life-event/action", () => ({
  createLifeEventAction: (...args: unknown[]) => createLifeEventAction(...args),
}));
vi.mock("@/features/inputs/life-events/commands/delete-life-event/action", () => ({
  deleteLifeEventAction: (...args: unknown[]) => deleteLifeEventAction(...args),
}));

const openModal = () => {
  fireEvent.click(screen.getByRole("button", { name: "イベント追加" }));
};

const fillRequiredFields = (values: {
  label: string;
  amount: string;
  yearMonth: string;
  category: string;
}) => {
  fireEvent.change(screen.getByLabelText("ラベル"), { target: { value: values.label } });
  fireEvent.change(screen.getByLabelText("金額"), { target: { value: values.amount } });
  fireEvent.change(screen.getByLabelText("発生年月"), {
    target: { value: values.yearMonth },
  });
  fireEvent.change(screen.getByLabelText("カテゴリ"), { target: { value: values.category } });
};

describe("LifeEventSection", () => {
  const emptyEvents: Array<Tables<"life_events">> = [];

  beforeEach(() => {
    refresh.mockClear();
    createLifeEventAction.mockReset();
    deleteLifeEventAction.mockReset();
  });

  it("blocks retirement bonus category in modal", () => {
    render(<LifeEventSection events={emptyEvents} />);

    openModal();
    fillRequiredFields({
      label: "退職金",
      amount: "1000000",
      yearMonth: "2030-03",
      category: "retirement_bonus",
    });

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    expect(screen.getAllByText("退職金は専用フォームで登録してください。").length).toBeGreaterThan(
      0,
    );

    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(createLifeEventAction).not.toHaveBeenCalled();
  });

  it("submits repeating event settings", async () => {
    createLifeEventAction.mockResolvedValue({ ok: true, data: {} });

    render(<LifeEventSection events={emptyEvents} />);

    openModal();
    fillRequiredFields({
      label: "留学費用",
      amount: "500000",
      yearMonth: "2026-05",
      category: "travel",
    });
    fireEvent.change(screen.getByLabelText("繰り返し間隔（年）"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("繰り返し回数"), {
      target: { value: "3" },
    });

    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => {
      expect(createLifeEventAction).toHaveBeenCalledWith({
        label: "留学費用",
        amount: 500000,
        year_month: "2026-05-01",
        repeat_interval_years: 1,
        stop_after_occurrences: 3,
        category: "travel",
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      });
    });

    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("deletes selected event", async () => {
    deleteLifeEventAction.mockResolvedValue({ ok: true, data: null });

    const events: Array<Tables<"life_events">> = [
      {
        id: "event-1",
        user_id: "user-1",
        label: "旅行",
        amount: 200000,
        year_month: "2026-04-01",
        repeat_interval_years: null,
        stop_after_occurrences: null,
        category: "travel",
        auto_toggle_key: null,
        building_price: null,
        land_price: null,
        down_payment: null,
      },
    ];

    render(<LifeEventSection events={events} />);

    fireEvent.click(screen.getByRole("button", { name: "削除" }));

    await waitFor(() => {
      expect(deleteLifeEventAction).toHaveBeenCalledWith({ id: "event-1" });
    });

    await waitFor(() => {
      expect(refresh).toHaveBeenCalled();
    });
  });
});
