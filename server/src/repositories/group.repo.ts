import { prisma } from '../lib/prisma';

export const groupRepo = {
    list: () => prisma.group.findMany({
        orderBy: { id: 'desc'},
        take: 50,
    })
}