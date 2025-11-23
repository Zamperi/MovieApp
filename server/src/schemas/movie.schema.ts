import { z } from 'zod';

export const MovieCreateSchema = z.object({
  title: z.string().min(1),
  overview: z.string().optional(),
});

export type MovieCreateDTO = z.infer<typeof MovieCreateSchema>;
