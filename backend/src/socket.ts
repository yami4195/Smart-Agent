import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    // 1. Join specific branch room (for branch queue live updates & employee notification bar)
    socket.on("join:branch", (branchId: string) => {
      if (branchId) {
        socket.join(`branch:${branchId}`);
      }
    });

    socket.on("leave:branch", (branchId: string) => {
      if (branchId) {
        socket.leave(`branch:${branchId}`);
      }
    });

    // 2. Join customer room (for personalized notifications: served, cancelled, no-show, ready)
    socket.on("join:user", (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // 3. Join employee room (for direct teller assignments & individual stats)
    socket.on("join:employee", (employeeId: string) => {
      if (employeeId) {
        socket.join(`employee:${employeeId}`);
      }
    });

    socket.on("disconnect", () => {
      // Clean socket disconnect handling
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized. Please call initSocket first.");
  }
  return io;
};

/**
 * Emit event to all employees/listeners watching a specific branch
 */
export const emitToBranch = (branchId: string, event: string, data: any): void => {
  if (io && branchId) {
    io.to(`branch:${branchId}`).emit(event, data);
  }
};

/**
 * Emit event to a specific customer/user
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to a specific employee
 */
export const emitToEmployee = (employeeId: string, event: string, data: any): void => {
  if (io && employeeId) {
    io.to(`employee:${employeeId}`).emit(event, data);
  }
};

/**
 * Emit event globally
 */
export const emitGlobal = (event: string, data: any): void => {
  if (io) {
    io.emit(event, data);
  }
};

export default {
  initSocket,
  getIO,
  emitToBranch,
  emitToUser,
  emitToEmployee,
  emitGlobal,
};
