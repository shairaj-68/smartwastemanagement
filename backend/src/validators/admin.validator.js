import { z } from 'zod';

export const assignWorkerSchema = z.object({
  complaintId: z.string().min(1),
  workerId: z.string().min(1),
});
