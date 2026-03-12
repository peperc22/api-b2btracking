import { Router } from "express";
import { lastKnownPosController } from "../controllers/lastKnownPos.controller";
import { lastKnownOdometerController } from "../controllers/lastKnownOdometer.controller";

const unitRoutes = Router();

unitRoutes.get("/last-known-position", lastKnownPosController);
unitRoutes.get("/last-known-odometer", lastKnownOdometerController);

export default unitRoutes;
