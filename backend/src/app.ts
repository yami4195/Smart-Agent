import express from "express";
import cors from "cors";
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from "@clerk/express";
import UserRoutes from './routes/user.routes';
import BranchRoutes from './routes/branch.routes';
import ForexRoutes from './routes/forex.routes';
import QueueRoutes from './routes/queue.routes';
import NotificationRoutes from './routes/notification.routes';
import ServiceRoutes from './routes/service.routes' ;
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";




import { errorHandler } from "./middlewares/errorHandler";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "*";
app.use(
  cors({
    origin: corsOrigin.includes(",") ? corsOrigin.split(",").map((o) => o.trim()) : corsOrigin,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(clerkMiddleware());

const swaggerDocument = YAML.load(path.join(__dirname, "../openapi.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Smart Agent API is running Successfully!!",
    });
});

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        message: "Server is healthy",
    }); 
});

app.use("/api/users", UserRoutes);
app.use("/api/branches", BranchRoutes);
app.use("/api/forex", ForexRoutes);
app.use("/api/queues", QueueRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/services", ServiceRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;