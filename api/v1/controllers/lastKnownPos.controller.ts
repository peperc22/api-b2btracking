import type { Response } from "express";
import {
  groupLastKnownPosition,
  lastKnownPosition,
} from "../../../core/v1/modules/unit/lastPos";
import type { IAuthRequest } from "../interfaces/auth.interface";

export const lastKnownPosController = async (
  req: IAuthRequest,
  res: Response,
) => {
  const { ref } = req.user!;
  const { name, group } = req.query;

  if (name) {
    try {
      const data = await lastKnownPosition(ref, String(name));

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  if (group) {
    try {
      const data = await groupLastKnownPosition(ref, String(group));

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
