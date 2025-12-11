import { z } from 'zod';

export const UserCreateSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email"),
    password: z
        .string()
        .min(8)
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number"),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
});

export type UserCreateDTO = z.infer<typeof UserCreateSchema>;
