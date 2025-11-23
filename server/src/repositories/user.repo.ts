import { prisma } from '../lib/prisma';

export const userRepo = {
    list: () => {
        return prisma.user.findMany({
            orderBy: { id: 'desc' },
            take: 50,
        });
    },
};
