import { Request, Response } from "express";
import { groupService } from "../services/groups.service";

export const groupController = {
    list: async (req: Request, res: Response) => {
        try {
            req.log.info("Listing groups");
            const groups = await groupService.list();
            req.log.info({ count: groups.length }, "Groups fetched successfully");
            return res.status(200).json(groups);
        } catch (error) {
            req.log.error({ err: error }, "Error while fetching groups");
            return res.status(500).json({
                error: "INTERNAL_SERVER_ERROR",
                message: "Error while fetching groups",
            });
        }
    },

    getGroup: async (req: Request, res: Response) => {
        try {
            const groupId = Number(req.params.groupId);

            if (!Number.isInteger(groupId) || groupId <= 0) {
                req.log.warn({ groupId: req.params.groupId }, "invalid group id");
                return res.status(400).json({
                    error: "BAD_REQUEST",
                    message: "Invalid group id",
                });
            }

            req.log.info({ groupId }, "Fetching group");

            const dto = await groupService.getById(groupId);

            if (!dto) {
                req.log.info({ groupId }, "Group not found");
                return res.status(404).json({
                    error: "GROUP_NOT_FOUND",
                    message: "Group not found",
                });
            }

            req.log.info({ groupId }, "Group fetched successfully");
            return res.status(200).json(dto);
        } catch (error) {
            req.log.error({ err: error }, "Error while fetching a group");
            return res.status(500).json({
                error: "INTERNAL_SERVER_ERROR",
                message: "Error while fetching a group",
            });
        }
    },
};
