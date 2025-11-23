import { prisma } from '../lib/prisma';
import { movieRepo } from '../repositories/movie.repo';
import { MovieCreateDTO } from '../schemas/movie.schema';

export const movieService = {
    list: () => movieRepo.list(),

    get: async (id: number) => {
        return movieRepo.findById(id); // palauttaa Movie | null
    },

    create: (dto: MovieCreateDTO) =>
        prisma.$transaction(async () => {
            // esim. duplikaattitarkistus tähän tarvittaessa
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
