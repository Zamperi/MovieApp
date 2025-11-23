import { groupRepo } from "../repositories/group.repo";

export const groupService = {
    list: () => groupRepo.list(),
}