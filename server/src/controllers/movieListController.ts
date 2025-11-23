import { Request, Response } from 'express';
import { movieList } from '../services/movieLists.service';

export const movieListController = {
    popular: async (req: Request, res: Response) => {
        try {
            const response = await movieList.popular();
            res.status(200).json(response);
        } catch (error) {
            return res.status(503).json('Error while fetching popular movies from external API');
        }
    },

    upcoming: async (req: Request, res: Response) => {
        try{
            const response = await movieList.upcoming();
            res.status(200).json(response);
        } catch(error) {
            return res.status(503).json('Error while fetching upcoming movies from external API');
        }
    },

    nowPlaying: async (req: Request, res: Response) => {
        try{
            const response = await movieList.nowPlaying();
            res.status(200).json(response);
        } catch(error) {
            return res.status(503).json('Error while fetching new releases from external API');
        }
    },

    topRated: async (req: Request, res: Response) => {
        try{
            const response = await movieList.topRated();
            res.status(200).json(response);
        } catch(error) {
            return res.status(503).json('Error while fetching top rated movies from external API');
        }
    },
}