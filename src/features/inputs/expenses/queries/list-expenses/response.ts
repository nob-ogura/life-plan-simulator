import type { Tables } from "@/types/supabase";

export type ListExpensesResponse = Array<Tables<"expenses">>;
