import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { Response } from "express";
import { prisma } from "../lib/prisma";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "";
const ACCESS_EXPIRES_MIN = Number(process.env.JWT_ACCESS_EXPIRES_MIN ?? "15");
const REFRESH_EXPIRES_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? "7");
const IS_PROD = process.env.NODE_ENV === "production";

// JWT access-token
export function createAccessToken(payload: { userId: number; email: string }) {
    return jwt.sign(
        { sub: payload.userId, email: payload.email },
        ACCESS_SECRET,
        { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
    );
}

// Luo refresh-token ja tallenna hash kantaan
export async function createAndStoreRefreshToken(userId: number) {
    const tokenId = crypto.randomUUID();
    const secret = crypto.randomBytes(64).toString("hex");

    const rawToken = `${tokenId}.${secret}`;
    const tokenHash = await bcrypt.hash(secret, 12);

    const expiresAt = new Date(
        Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    await prisma.refreshToken.create({
        data: {
            tokenId,
            tokenHash,
            userId,
            expiresAt,
        },
    });

    return rawToken; // tämä menee selaimelle cookieen
}

// Hakee refresh-token rivin ja validoi sen
export async function validateRefreshToken(rawToken: string) {
    const parts = rawToken.split(".");
    if (parts.length !== 2) return null;

    const [tokenId, secret] = parts;

    const stored = await prisma.refreshToken.findUnique({
        where: { tokenId },
        include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        return null;
    }

    const ok = await bcrypt.compare(secret, stored.tokenHash);
    if (!ok) return null;

    return stored;
}

// Cookie-apurit
const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

export function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
) {
    res.cookie(ACCESS_COOKIE, accessToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "strict",
        maxAge: ACCESS_EXPIRES_MIN * 60 * 1000,
    });

    res.cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "strict",
        maxAge: REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie(ACCESS_COOKIE, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "strict",
    });
    res.clearCookie(REFRESH_COOKIE, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: "strict",
    });
}

export function getRefreshTokenFromCookies(req: any): string | undefined {
    return req.cookies?.[REFRESH_COOKIE];
}

export function getAccessTokenFromCookies(req: any): string | undefined {
    return req.cookies?.[ACCESS_COOKIE];
}
