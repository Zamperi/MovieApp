import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const userRepo = {
    list: () => {
        return prisma.user.findMany({
            orderBy: { id: 'desc' },
            take: 50,
        });
    },

    create: (data: Prisma.UserCreateInput) => {
        return prisma.user.create({ data });
    },

    findByEmail: (email: string) => {
        return prisma.user.findFirst({
            where: { email }
        });
    }
};