import { prisma } from '../lib/prisma';
import { userRepo } from '../repositories/user.repo';
import { UserCreateDTO } from '../schemas/user.schema';

export const userService = {
    list: () => userRepo.list(),
}