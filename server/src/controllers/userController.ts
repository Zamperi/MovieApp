import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { userService } from "../services/users.service";
import { UserCreateDTO } from "../schemas/user.schema";
import {
    createAccessToken,
    createAndStoreRefreshToken,
    validateRefreshToken,
    setAuthCookies,
    clearAuthCookies,
    getRefreshTokenFromCookies,
} from "../auth/tokenUtils";

export const userController = {
    // POST /api/users/login
    login: async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body as {
                email?: string;
                password?: string;
            };

            if (!email || !password) {
                return res.status(400).json("email or password missing");
            }

            const user = await userService.findByEmail(email);
            if (!user) {
                return res.status(401).json("Invalid credentials");
            }

            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            if (!passwordMatch) {
                return res.status(401).json("Invalid credentials");
            }

            // revoke vanhat refresh-tokenit (valinnainen, mutta hyvä)
            await prisma.refreshToken.updateMany({
                where: { userId: user.id, revoked: false },
                data: { revoked: true },
            });

            const accessToken = createAccessToken({
                userId: user.id,
                email: user.email,
            });

            const refreshToken = await createAndStoreRefreshToken(user.id);

            setAuthCookies(res, accessToken, refreshToken);

            return res.status(200).json({
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json("Internal server error");
        }
    },

    // POST /api/users/register
    register: async (req: Request, res: Response) => {
        try {
            const dto = req.body as UserCreateDTO & { password: string };
            const { email, password } = dto;

            if (!email || !password) {
                return res.status(400).json("email or password missing");
            }

            const existing = await userService.findByEmail(email);
            if (existing) {
                return res.status(409).json("Email already in use");
            }

            const passwordHash = await bcrypt.hash(password, 10);

            const user = await userService.create({
                ...dto,
                passwordHash,
            } as any);

            return res.status(201).json({
                id: user.id,
                email: user.email,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json("Internal server error");
        }
    },

    // POST /api/users/refresh
    refreshToken: async (req: Request, res: Response) => {
        try {
            const rawRefresh = getRefreshTokenFromCookies(req);
            if (!rawRefresh) {
                return res.status(401).json("Missing refresh token");
            }

            const stored = await validateRefreshToken(rawRefresh);
            if (!stored || !stored.user) {
                return res.status(401).json("Invalid refresh token");
            }

            // rotaatio: mitätöi käytetty token
            await prisma.refreshToken.update({
                where: { id: stored.id },
                data: { revoked: true },
            });

            const user = stored.user;

            const accessToken = createAccessToken({
                userId: user.id,
                email: user.email,
            });

            const newRefreshToken = await createAndStoreRefreshToken(user.id);

            setAuthCookies(res, accessToken, newRefreshToken);

            return res.status(200).json({ ok: true });
        } catch (error) {
            console.error(error);
            return res.status(500).json("Internal server error");
        }
    },

    // POST /api/users/logout
    logout: async (req: Request, res: Response) => {
        try {
            const rawRefresh = getRefreshTokenFromCookies(req);

            if (rawRefresh) {
                const stored = await validateRefreshToken(rawRefresh);
                if (stored) {
                    await prisma.refreshToken.update({
                        where: { id: stored.id },
                        data: { revoked: true },
                    });
                }
            }

            clearAuthCookies(res);

            return res.status(200).json({ message: "Logged out" });
        } catch (error) {
            console.error(error);
            return res.status(500).json("Internal server error");
        }
    },
};
