import { z } from "zod";

export const createNovelSchema = z.object({
  userId:      z.string().min(1),
  name:        z.string().min(2, "Tên truyện tối thiểu 2 ký tự").max(200).trim(),
  author:      z.string().min(2, "Tên tác giả tối thiểu 2 ký tự").max(100).trim(),
  status:      z.enum(["pending", "completed"], { message: "Trạng thái không hợp lệ" }),
  genres:      z.array(z.string()).min(1, "Chọn ít nhất một thể loại"),
  description: z.string().max(2000).trim().optional(),
});

export type CreateNovelData = z.infer<typeof createNovelSchema>;
