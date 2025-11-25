import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { SocketEvent } from "./src/lib/socket";
import type { Room, RoomWithUserCount } from "./src/types/room";

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

const getRoomList = async (): Promise<RoomWithUserCount[]> => {
  return Promise.all(
    rooms.map(async (room) => {
      const sockets = await io.in(room.id).fetchSockets();
      return {
        ...room,
        userCount: sockets.length,
      };
    }),
  );
};

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  const interval = setInterval(() => {
    socket.emit("ping");
  }, 3000);

  users[socket.id] = {
    nickname: "익명",
    joinedRoom: null,
  };

  socket.on(SocketEvent.SET_NICKNAME, (nickname: string) => {
    users[socket.id].nickname = nickname;
    console.log(`${socket.id} has change nickname to ${nickname}`);
    io.emit("nickname", users);
  });

  socket.on(SocketEvent.GET_ROOM_LIST, async () => {
    socket.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });

  socket.on(SocketEvent.CREATE_ROOM, async (roomName, roomPassword) => {
    const uuid = uuidv4();
    rooms.push({
      id: uuid,
      name: roomName,
      password: roomPassword,
      creator: {
        id: socket.id,
        nickname: users[socket.id].nickname || "익명",
      },
      createdAt: new Date(),
    });
    console.log(`${socket.id} has created room ${roomName}`);
    socket.join(uuid);
    socket.emit(SocketEvent.JOINED_ROOM, uuid);
    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });

  socket.on(SocketEvent.JOIN_ROOM, async (roomId, roomPassword) => {
    const room = rooms.find((room) => room.id === roomId);
    if (!room) {
      socket.emit(SocketEvent.JOIN_ROOM_ERROR, "room-not-found");
      return;
    }
    if (room.password !== roomPassword) {
      socket.emit(SocketEvent.JOIN_ROOM_ERROR, "room-password-wrong");
      return;
    }
    socket.join(roomId);
    socket.emit(SocketEvent.JOINED_ROOM, roomId);
    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
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
