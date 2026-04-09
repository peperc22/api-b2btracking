import express from "express";
import dotenv from "dotenv";
import unitRoutes from "./routes/unit.route";
import { authMiddleware, initAuthMiddleware } from "./middlewares/auth.middleware";

dotenv.config();

const main = async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());

    await initAuthMiddleware();
    app.use(authMiddleware);

    app.use("/api/v1/unit", unitRoutes);

    app.listen(port, () => {
        console.debug(`server is running on port ${port}`);
    });
};

main();
