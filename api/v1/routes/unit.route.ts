import { Router } from "express";
import { lastKnownPosController } from "../controllers/lastKnownPos.controller";

const unitRoutes = Router();

unitRoutes.get(
  "/by-name/:unitName/last-known-position",
  lastKnownPosController,
);

export default unitRoutes;
