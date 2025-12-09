import { Request, Response } from 'express';
import { people } from '../services/people.service';

export const peopleController = {
    trending: async (_req: Request, res: Response) => {
        try {
            const response = await people.trending();
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json('Error while fetching trending people');
        }
    },

    getPerson: async(req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            if(!id) return res.status(400).json({ error: 'Invalid id' });

            const response = await people.getPerson(id);
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json('Error while fetching person');
        }
    }
}