import { z } from "zod";

export const topupSchema = z.object({
  amount: z.number().int().positive("Số lượng phải lớn hơn 0"),
});

export type TopupData = z.infer<typeof topupSchema>;
