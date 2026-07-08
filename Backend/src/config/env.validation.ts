import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  // ── Server ──────────────────────────────────────────────
  @IsOptional()
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsOptional()
  @IsNumber()
  @Min(1)
  PORT: number;

  // ── Database ─────────────────────────────────────────────
  @IsString()
  DATABASE_URL: string;

  // ── Auth ─────────────────────────────────────────────────
  @IsString()
  JWT_SECRET_KEY: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  REFRESH_TOKEN_EXPIRES_IN_DAYS: number;

  @IsOptional()
  @IsString()
  ACCESS_TOKEN_EXPIRES_IN: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  RESET_TOKEN_EXPIRES_IN_MINUTES: number;

  // ── Frontend / CORS ───────────────────────────────────────
  @IsString()
  FRONTEND_URL: string;

  @IsOptional()
  @IsString()
  CLIENT_URL: string;

  // ── Redis ─────────────────────────────────────────────────
  @IsString()
  REDIS_URL: string;

  // ── Mail ─────────────────────────────────────────────────
  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASSWORD: string;

  // ── Cloudinary ────────────────────────────────────────────
  @IsString()
  CLOUDINARY_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;

  // ── SePay ────────────────────────────────────────────────
  @IsString()
  SEPAY_SECRET_KEY: string;

  // ── Bank / VietQR ─────────────────────────────────────────
  @IsString()
  BANK_ID: string;

  @IsString()
  BANK_ACCOUNT_NO: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n');
    throw new Error(`❌ Env validation failed:\n${messages}`);
  }

  return validated;
}
