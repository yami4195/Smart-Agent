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


const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(clerkMiddleware());


app.get("/", (_req, res) => {
    res.json({
    message: "Smart Agent API is running",
    });
});

app.get("/api/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is healthy"
    }); 
});

app.use("/api/users", UserRoutes);
app.use("/api/branches", BranchRoutes);
app.use("/api/forex", ForexRoutes);
app.use("/api/queues", QueueRoutes);
app.use("/api/notifications", NotificationRoutes);
app.use("/api/services", ServiceRoutes);

export default app;