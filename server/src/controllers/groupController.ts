import { Request, Response } from "express";
import { groupService } from "../services/groups.service";
import type { AuthRequest } from "../auth/authMiddleware";
import { CreateGroupRequestDTO, DeleteGroupResponseDTO, GroupIdParamsDTO } from "../schemas/groups.schema";

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

    createGroup: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.userId;

            if (!userId) {
                return res.status(401).json("Missing token");
            }

            const parsed = CreateGroupRequestDTO.safeParse(req.body);
            if (!parsed.success) {
                req.log.warn({ issues: parsed.error.issues }, "invalid create group payload");
                return res.status(400).json({
                    error: "BAD_REQUEST",
                    message: "Invalid groupName or isPublic",
                });
            }

            const { groupName, isPublic } = parsed.data;

            req.log.info({ userId, groupName, isPublic }, "Creating a group");
            const dto = await groupService.createGroup(userId, groupName, isPublic);

            req.log.info({ groupId: dto.groupId }, "Group created successfully");
            return res.status(201).json(dto);
        } catch (error) {
            req.log.error({ err: error }, "Error while creating a group");
            return res.status(500).json({
                error: "INTERNAL_SERVER_ERROR",
                message: "Error while creating a group",
            });
        }
    },

    deleteGroup: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) return res.status(401).json("Missing token");

            const parsed = GroupIdParamsDTO.safeParse(req.params);
            if (!parsed.success) {
                return res.status(400).json({ error: "BAD_REQUEST", message: "Invalid group id" });
            }

            const { groupId } = parsed.data;

            const result = await groupService.softDeleteGroup(userId, groupId);

            if (result.status === 404) {
                return res.status(404).json({ error: "GROUP_NOT_FOUND", message: "Group not found" });
            }
            if (result.status === 403) {
                return res.status(403).json({ error: "FORBIDDEN", message: "Requester is not a group owner" });
            }

            const out = DeleteGroupResponseDTO.parse(result.dto);
            return res.status(200).json(out);
        } catch (error) {
            req.log.error({ err: error }, "Error while deleting a group");
            return res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "Error while deleting a group" });
        }
    },

    joinRequestGroup: async () => {

    },

    approveJoinRequestGroup: async () => {},
    declineJoinRequestGroup: async () => {},

    leavegroup: async() => {

    }
};
