import { groupLastKnownIgnition, lastKnownIgnition } from "../../../core/v1/modules/unit/lastIgnition";
import type { IAuthRequest } from "../interfaces/auth.interface";
import type { Response } from "express";

export const lastKnownIgnitionController = async  (
    req: IAuthRequest,
    res: Response
) => {
    const { ref } = req.user!;
    const { name, group } = req.query;

    if (name) {
        try {
            const data = await lastKnownIgnition(ref, String(name));

            return res.status(200).json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    if (group) {
        try {
            const data = await groupLastKnownIgnition(ref, String(group));

            return res.status(200).json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}