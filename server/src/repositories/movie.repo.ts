import { prisma } from '../lib/prisma';
import { MovieCreateDTO } from '../schemas/movie.schema';

export const movieRepo = {
    list: () =>
        prisma.movie.findMany({
            orderBy: { id: 'desc' },
            take: 50,
        }),

    findById: (id: number) =>
        prisma.movie.findUnique({
            where: { id },
        }),
    create: (data: MovieCreateDTO) =>
        prisma.movie.create({ data }),

    update: (id: number, data: Partial<MovieCreateDTO>) =>
        prisma.movie.update({ 
            where: { id }, 
            data 
        }),

    remove: (id: number) =>
        prisma.movie.delete({
            where: { id },
        }),
};
