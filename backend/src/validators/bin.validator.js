import { z } from 'zod';

export const updateBinStatusSchema = z.object({
  status: z.enum(['active', 'maintenance', 'full', 'collected']),
});