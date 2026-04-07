import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email(),
  password: z.string().min(8).max(128),
  role: z.enum(['citizen', 'worker', 'admin']).optional(),
  phone: z.string().max(30).optional().default(''),
  address: z.string().max(200).optional().default(''),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});
