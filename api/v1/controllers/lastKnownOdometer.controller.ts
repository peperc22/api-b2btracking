import type { Response } from "express";
import type { IAuthRequest } from "../interfaces/auth.interface";
import {
  groupLastKnownOdometer,
  lastKnownOdometer,
} from "../../../core/v1/modules/unit/lastOdometer";

export const lastKnownOdometerController = async (
  req: IAuthRequest,
  res: Response,
) => {
  const { ref } = req.user!;
  const { name, group } = req.query;

  if (name) {
    try {
      const data = await lastKnownOdometer(ref, String(name));

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (group) {
    try {
      const data = await groupLastKnownOdometer(ref, String(group));

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};
