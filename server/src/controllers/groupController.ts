import { Request, Response } from 'express';
import { groupService } from '../services/groups.service';

export const groupController = {
    list: async (_req: Request, res: Response) => {
        try {
            const groups = await groupService.list();
            return res.status(200).json(groups);
        } catch (error) {
            console.error();
            return res.status(500).json('Error while fetching groups');
        }
    },
    
}