import { z } from "zod";

export const createChapterSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1, "Tiêu đề không được để trống").max(200).trim(),
  content: z
    .string()
    .min(1, "Nội dung không được để trống")
    .trim()
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 50,
      "Nội dung chương phải có ít nhất 50 từ"
    ),
  candyPrice: z.number().int().min(0).optional(),
});

export type CreateChapterData = z.infer<typeof createChapterSchema>;

export const updateChapterSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(200).trim().optional(),
  content: z
    .string()
    .min(1, "Nội dung không được để trống")
    .trim()
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 50,
      "Nội dung chương phải có ít nhất 50 từ"
    )
    .optional(),
  candyPrice: z.number().int().min(0).optional(),
});

export type UpdateChapterData = z.infer<typeof updateChapterSchema>;
