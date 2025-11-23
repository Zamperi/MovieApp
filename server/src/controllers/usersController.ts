import { Request, Response } from 'express';
import { userService } from '../services/users.service';

export const usersController = {
    list: async (_req: Request, res: Response) => {
        try {
            const users = await userService.list(); // <-- kutsu funktio
            return res.status(200).json(users);
        } catch (err) {
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
    },
};
