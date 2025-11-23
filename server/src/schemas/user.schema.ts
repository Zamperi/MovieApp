import { z } from 'zod';

export const UserCreateSchema = z.object({
    username: z.string().min(1),
    email: z.string().email(),
});

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
