import { Request, Response } from 'express';
import { movieService } from '../services/movies.service';
import { MovieCreateDTO } from '../schemas/movie.schema';

export const moviesController = {
    list: async (_req: Request, res: Response) => {
        try {
            const movies = await movieService.list();
            return res.status(200).json(movies);
        } catch (error) {
            return res.status(500).json('Failed to fetch movies');
        }
    },

    get: async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const movie = await movieService.get(id);
            if (!movie) return res.status(404).json({ error: 'Not found' });
            return res.json(movie);
        } catch (error) {
            return res.status(500);
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const dto = req.body as MovieCreateDTO;
            const data = await movieService.create(dto);
            return res.status(201).json(data);
        } catch (error) {
            return res.status(500);
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
            const updated = await movieService.update(id, req.body);
            return res.json(updated);
        } catch (error) {
            return res.status(500);
        }
    },

    remove: async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

            const ok = await movieService.remove(id);
            if (!ok) return res.status(404).json({ error: 'Not found' });
            return res.status(204).end();
        } catch (error) {
            return res.status(500);
        }
    },
};
