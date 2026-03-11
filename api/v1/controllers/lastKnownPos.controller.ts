import type { Response } from "express";
import { lastKnownPosition } from "../../../core/v1/modules/unit/lastPos";
import type { IAuthRequest } from "../interfaces/auth.interface";

export const lastKnownPosController = async (
  req: IAuthRequest,
  res: Response,
) => {
  const { ref } = req.user!;

  const unit = req.query.name as string;
  if (!unit) return res.status(400).json({ error: "unit name is required" });

  try {
    const data = await lastKnownPosition(ref, unit);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
