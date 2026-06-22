import { NextApiRequest } from "next";
import { Server as IOServer } from "socket.io";
import { Server as NetServer } from "http";
import { Socket as NetSocket } from "net";

export type NextApiResponseServerIO = any & {
  socket: NetSocket & {
    server: NetServer & {
      io: IOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...");
    const io = new IOServer(res.socket.server as any, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket client connected:", socket.id);

      socket.on("join", (userId: string) => {
        socket.join(userId);
        console.log(`Socket user joined room: ${userId}`);
      });

      socket.on("send-message", (message: any) => {
        console.log("Socket broadcasting message to receiver room:", message.receiverId);
        // Emit to the receiver's room
        socket.to(message.receiverId).emit("new-message", message);
      });

      socket.on("typing", (data: { senderId: string; receiverId: string; isTyping: boolean }) => {
        socket.to(data.receiverId).emit("typing-status", data);
      });

      socket.on("disconnect", () => {
        console.log("Socket client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default socketHandler;
