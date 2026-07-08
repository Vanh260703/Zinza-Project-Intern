import { z } from "zod";

// Login

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register

export const registerSchema = z
  .object({
    name: z.string().min(2, "Tên ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Vui lòng chọn giới tính" }),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot password

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Update profle

export const updateProfileSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(50).trim().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

// Reset password by token (từ email link)

export const resetPasswordByTokenSchema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordByTokenFormData = z.infer<typeof resetPasswordByTokenSchema>;

// Reset password (đổi mật khẩu trong profile)

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1),
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
