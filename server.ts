import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import type { Room } from "./src/types/room";

const app = express();
app.use(cors());

const users: Record<
  string,
  {
    nickname: string;
    joinedRoom: string | null;
  }
> = {};
const rooms: Room[] = [];

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const interval = setInterval(() => {
    socket.emit("ping");
  }, 3000);

  users[socket.id] = {
    nickname: "익명",
    joinedRoom: null,
  };

  socket.on("set-nickname", (nickname) => {
    users[socket.id].nickname = nickname;
    console.log(`${socket.id} has change nickname to ${nickname}`);
    io.emit("nickname", users);
  });

  socket.on("get-room-list", () => {
    socket.emit("room-list", rooms);
  });

  socket.on("create-room", (roomName, roomPassword) => {
    const uuid = uuidv4();
    rooms.push({
      id: uuid,
      name: roomName,
      password: roomPassword,
      creator: {
        id: socket.id,
        nickname: users[socket.id].nickname || "익명",
      },
      users: [socket.id],
      createdAt: new Date(),
    });
    console.log(`${socket.id} has created room ${roomName}`);
    socket.join(uuid);
    socket.emit("room-joined", uuid);
    io.emit("room-list", rooms);
  });

  socket.on("join-room", (roomId, roomPassword) => {
    const room = rooms.find((room) => room.id === roomId);
    if (!room) {
      socket.emit("room-join-error", "room-not-found");
      return;
    }
    if (room.password !== roomPassword) {
      socket.emit("room-join-error", "room-password-wrong");
      return;
    }
    if (!room.users.includes(socket.id)) {
      room.users.push(socket.id);
    }
    socket.join(roomId);
    socket.emit("room-joined", roomId);
    io.emit("room-list", rooms);
  });

  // socket.on("pong", () => {
  // 	console.log("Received pong from:", socket.id);
  // });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
    clearInterval(interval);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
