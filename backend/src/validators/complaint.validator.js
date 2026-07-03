import { z } from 'zod';

export const createComplaintSchema = z.object({
  type: z.enum(['overflow', 'missed_pickup', 'illegal_dumping', 'bin_damage', 'other']).default('other'),
  description: z.string().min(5).max(500),
  coordinates: z
    .array(z.number())
    .length(2)
    .refine(([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90, {
      message: 'Coordinates must be [lng, lat] within valid bounds',
    }),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'reported', 'assigned', 'cleaned', 'closed', 'rejected']),
});

export const nearbyQuerySchema = z.object({
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  radiusKm: z.coerce.number().min(0.1).max(100).default(5),
});
