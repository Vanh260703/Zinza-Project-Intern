import { z } from "zod";

export const topupSchema = z.object({
  amount: z.number().int().positive("Số lượng phải lớn hơn 0"),
});

export type TopupData = z.infer<typeof topupSchema>;

export const resolveSuspenseSchema = z.object({
  status: z.enum(["resolved", "accepted", "refunded"]),
  resolutionNote: z.string().min(1, "Cần ghi chú lý do xử lý"),
  creditUserId: z.string().uuid().optional(),
  creditAmount: z.number().int().positive().optional(),
});

export type ResolveSuspenseData = z.infer<typeof resolveSuspenseSchema>;
