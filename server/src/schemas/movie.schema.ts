import { z } from 'zod';

export const MovieCreateSchema = z.object({
  title: z.string().min(1),
  tmdbId: z.number().min(1),
  release_date: z.string().optional(),
  overview: z.string().optional(),
  poster_path: z.string().optional(),
  backdrop_path: z.string().optional(),
  runtime: z.number().optional(),
  genres: z.string().array().optional(),
});

export type MovieCreateDTO = z.infer<typeof MovieCreateSchema>;
