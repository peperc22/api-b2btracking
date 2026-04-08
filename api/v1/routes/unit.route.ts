import { Router } from "express";
import { lastKnownPosController } from "../controllers/lastKnownPos.controller";
import { lastKnownOdometerController } from "../controllers/lastKnownOdometer.controller";
import { lastKnownIgnitionController } from "../controllers/lastKnownIgnition.controller";

const unitRoutes = Router();

unitRoutes.get("/last-known-position", lastKnownPosController);
unitRoutes.get("/last-known-odometer", lastKnownOdometerController);
unitRoutes.get("/last-known-ignition", lastKnownIgnitionController);

export default unitRoutes;
