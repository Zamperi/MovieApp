import { prisma } from '../lib/prisma';
import { fetchTmdbMovieById } from '../lib/tmdbMovie';
import { movieRepo } from '../repositories/movie.repo';
import { MovieCreateDTO } from '../schemas/movie.schema';

export const movieService = {
    list: () => movieRepo.list(),

    getById: (id: number) => movieRepo.findById(id),

    getOrFetchByTmdbId: async (tmdbId: number) => {
        const cached = await movieRepo.findByTmdbId(tmdbId);
        if(cached) return cached

        const dto = await fetchTmdbMovieById(tmdbId);

        return prisma.$transaction(async()=>{
            const created = movieRepo.create(dto);
            return created;
        });
        
    },

    create: (dto: MovieCreateDTO) =>
        prisma.$transaction(async () => {
            return movieRepo.create(dto);
        }),

    update: (id: number, data: Partial<MovieCreateDTO>) =>
        prisma.$transaction(async () => {
            return movieRepo.update(id, data);
        }),

    remove: (id: number) =>
        prisma.$transaction(async () => {
            const exists = await movieRepo.findById(id);
            if (!exists) return false;
            await movieRepo.remove(id);
            return true;
        }),
};
