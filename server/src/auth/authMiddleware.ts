import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getAccessTokenFromCookies } from "./tokenUtils";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "";

export interface AuthRequest extends Request {
    userId?: number;
    email?: string;
}

function unauthorized(res: Response, message: string) {
    return res.status(401).json({
        error: "UNAUTHORIZED",
        message,
    });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const tokenFromCookie = getAccessTokenFromCookies(req);
    const authHeader = req.headers.authorization;

    let token: string | undefined;

    if (tokenFromCookie) {
        token = tokenFromCookie;
    } else if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring("Bearer ".length);
    }

    // Testit odottavat aina JSON-bodya 401:ssa: { error: "UNAUTHORIZED", message: string }
    if (!token) {
        return unauthorized(res, "Missing or invalid authentication");
    }

    try {
        const decoded = jwt.verify(token, ACCESS_SECRET);

        if (typeof decoded === "string") {
            return unauthorized(res, "Missing or invalid authentication");
        }

        const payload = decoded as JwtPayload & {
            sub?: number;
            email?: string;
        };

        if (typeof payload.sub !== "number" || typeof payload.email !== "string") {
            return unauthorized(res, "Missing or invalid authentication");
        }

        req.userId = payload.sub;
        req.email = payload.email;

        return next();
    } catch {
        return unauthorized(res, "Missing or invalid authentication");
    }
}
