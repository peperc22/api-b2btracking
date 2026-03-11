import type { IAuthRequest } from "../interfaces/auth.interface.ts";
import type { NextFunction, Response } from "express";
import { verify } from "bun-jwt";
import { getSecret } from "../../../core/v1/services/aws/secretsManager.ts";

let JWT_SECRET: string;

export const initAuthMiddleware = async (): Promise<void> => {
    const secret = await getSecret("prod/db/JWT");
    if (!secret?.JWT_SECRET_DBHANDLER) {
        throw new Error("JWT secret not found in secrets manager");
    }

    JWT_SECRET = secret.JWT_SECRET_DBHANDLER;
}

export const authMiddleware = async (
    req: IAuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ") 
        ? authHeader.slice(7)
        : authHeader;
    
    if (!token) {
        res.status(401).json({ error: "No token provided" })
        return;
    }

    try {
        const decoded = await verify(token, JWT_SECRET);

        const currentTime = Math.floor(Date.now() / 1000);

        if (decoded.iat && decoded.exp < currentTime) {
            res.status(401).json({ error: "Token expired" });
            return;
        }

        if (!decoded.ref) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
}