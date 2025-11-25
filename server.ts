import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import serde from "./src/lib/serde";
import { SocketEvent } from "./src/lib/socket";
import type { Room, RoomRules, RoomWithUserCount } from "./src/types/room";
import type { User } from "./src/types/user";

const app = express();
app.use(cors());

const users: Record<
  string,
  {
    nickname: string;
  }
> = {};
const rooms: Room[] = [];

const defaultRoomRules: RoomRules = {
  voteType: "user",
  anonymity: false,
  limitTime: 15,
  multiple: false,
};

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
  };

  socket.on(SocketEvent.LOBBY, async () => {
    const userRoomList = await io.in(socket.id).fetchSockets();
    userRoomList.forEach((room) => {
      socket.leave(room.id);
    });
    socket.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });

  socket.on(SocketEvent.GET_ROOM_LIST, async () => {
    socket.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });

  socket.on(SocketEvent.SET_NICKNAME, (nickname: string) => {
    users[socket.id].nickname = nickname;
    console.log(`${socket.id} has change nickname to ${nickname}`);
    socket.emit(SocketEvent.SET_NICKNAME, nickname);
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
      rules: defaultRoomRules,
      vote: {},
      createdAt: new Date(),
    });
    console.log(`${socket.id} has created room ${roomName}`);
    socket.join(uuid);
    socket.emit(SocketEvent.JOINED_ROOM, uuid);
    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });

  socket.on(SocketEvent.JOIN_REQUEST_ROOM, async (roomId, roomPassword) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) {
      socket.emit(SocketEvent.JOIN_ROOM_ERROR, "room-not-found");
      return;
    }
    if (rooms[roomIndex].password !== roomPassword) {
      socket.emit(SocketEvent.JOIN_ROOM_ERROR, "room-password-wrong");
      return;
    }
    socket.emit(SocketEvent.JOINED_ROOM, roomId);
    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });

  socket.on(SocketEvent.JOIN_ROOM, async (roomId) => {
    socket.join(roomId);

    const sockets = await io.in(roomId).fetchSockets();
    const allUsers = sockets.map((s) => ({
      id: s.id,
      nickname: users[s.id].nickname,
    }));

    io.to(roomId).emit(SocketEvent.JOIN_ROOM, {
      user: {
        id: socket.id,
        nickname: users[socket.id].nickname,
      } as User,
      users: allUsers,
    });
    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });

  socket.on(SocketEvent.GET_ROOM_INFO, async (roomId) => {
    const sockets = await io.in(roomId).fetchSockets();
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    const room = rooms[roomIndex];

    io.to(roomId).emit(SocketEvent.GET_ROOM_INFO, {
      users: sockets.map((socket) => ({
        id: socket.id,
        nickname: users[socket.id].nickname,
      })),
      room: serde.serializeRoom(room),
    });
  });

  socket.on(SocketEvent.VOTE, async (roomId, options: string[]) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    const room = rooms[roomIndex];

    Object.keys(room.vote).forEach((option) => {
      room.vote[option].delete(socket.id);
    });

    options.forEach((option) => {
      if (!room.vote[option]) room.vote[option] = new Set();
      room.vote[option].add(socket.id);
    });

    io.to(roomId).emit(SocketEvent.VOTE, serde.serializeVote(room.vote));
  });

  socket.on(SocketEvent.SET_ROOM_RULES, async (roomId, rules) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    rooms[roomIndex].rules = rules;
    io.to(roomId).emit(SocketEvent.SET_ROOM_RULES, rules);
  });

  socket.on(SocketEvent.VOTE_START, async (roomId, options: string[]) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    rooms[roomIndex].vote = {};
    options.forEach((option) => {
      rooms[roomIndex].vote[option] = new Set();
    });
    io.to(roomId).emit(SocketEvent.VOTE_START);
  });

  socket.on(SocketEvent.VOTE_ADD_OPTION, async (roomId, option: string) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    rooms[roomIndex].vote[option] = new Set();
    io.to(roomId).emit(SocketEvent.VOTE_ADD_OPTION, option);
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
