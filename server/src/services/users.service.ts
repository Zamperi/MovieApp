import bcrypt from 'bcrypt';
import { userRepo } from '../repositories/user.repo';
import { UserCreateDTO } from '../schemas/user.schema';

export const userService = {
    list: () => userRepo.list(),

    create: async (dto: UserCreateDTO) => {
        const passwordHash = await bcrypt.hash(dto.password, 10)

        const data = {
            username: dto.username,
            email: dto.email,
            passwordHash,
            firstname: dto.firstname,
            lastname: dto.lastname,
        }

        return userRepo.create(data);
    },

    findByEmail: (email: string) => {
        return userRepo.findByEmail(email);
    }
};
