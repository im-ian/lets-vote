import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { SocketEvent } from "./src/constants/socket";
import serde from "./src/lib/serde";
import type { Room, RoomRules, RoomWithUserCount } from "./src/types/room";
import type { User } from "./src/types/user";

const app = express();
app.use(cors());

const users: Record<
  string,
  {
    nickname: string;
    clientId?: string;
  }
> = {};
const rooms: Room[] = [];
const clientToSocket: Record<string, string> = {}; // clientId -> socketId 매핑

const defaultRoomRules: RoomRules = {
  voteType: "user",
  anonymity: false,
  limitTime: 15,
  multiple: false,
  notifyWhenVoteChanged: false,
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
  },
});

const getRoomList = async (): Promise<RoomWithUserCount[]> => {
  const sortedRooms = [...rooms].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  return Promise.all(
    sortedRooms.map(async (room) => {
      const sockets = await io.in(room.id).fetchSockets();
      return {
        ...room,
        userCount: sockets.length,
      };
    })
  );
};

// 특정 방의 유저 목록을 업데이트하는 헬퍼 함수
const updateRoomUsers = async (roomId: string, leftUserId: string) => {
  const roomIndex = rooms.findIndex((r) => r.id === roomId);
  if (roomIndex === -1) return;

  const room = rooms[roomIndex];
  const sockets = await io.in(roomId).fetchSockets();
  const roomUsers = sockets.map((s) => ({
    id: s.id,
    nickname: users[s.id]?.nickname || "익명",
  }));

  const leftUser = {
    id: leftUserId,
    nickname: users[leftUserId]?.nickname || "익명",
  };

  // 나간 유저가 어드민이고 방에 남은 사람이 있으면 다음 사람을 어드민으로 지정
  if (room.creator.id === leftUserId && roomUsers.length > 0) {
    room.creator = roomUsers[0];
    console.log(`New admin for room ${room.name}: ${roomUsers[0].nickname}`);

    // 업데이트된 방 정보 전송
    io.to(roomId).emit(SocketEvent.LEAVE_ROOM, {
      leftUser,
      users: roomUsers,
      room: serde.serializeRoom(room),
    });
  } else {
    io.to(roomId).emit(SocketEvent.LEAVE_ROOM, {
      leftUser,
      users: roomUsers,
    });
  }
};

// 빈 방들을 정리하는 헬퍼 함수
const cleanupEmptyRooms = async () => {
  const roomsToRemove: string[] = [];

  for (const room of rooms) {
    const sockets = await io.in(room.id).fetchSockets();
    if (sockets.length === 0) {
      roomsToRemove.push(room.id);
      console.log(`Removing empty room: ${room.name} (${room.id})`);
    }
  }

  // 빈 방들을 rooms 배열에서 제거
  for (const roomId of roomsToRemove) {
    const index = rooms.findIndex((r) => r.id === roomId);
    if (index !== -1) {
      rooms.splice(index, 1);
    }
  }

  // 방 목록이 변경되었으면 모든 클라이언트에 알림
  if (roomsToRemove.length > 0) {
    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  }
};

io.on("connection", async (socket) => {
  console.log("User connected:", socket.id);

  const interval = setInterval(() => {
    socket.emit("ping");
  }, 3000);

  users[socket.id] = {
    nickname: "익명",
  };

  // 클라이언트 ID 등록 처리
  socket.on("register-client", async (clientId: string) => {
    console.log(`Registering client ${clientId} for socket ${socket.id}`);

    // 이미 같은 clientId로 연결된 소켓이 있으면 처리
    const oldSocketId = clientToSocket[clientId];
    if (oldSocketId && oldSocketId !== socket.id) {
      console.log(
        `Found old connection for client ${clientId}: ${oldSocketId}`
      );

      // 기존 소켓이 속한 방들 확인
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        const oldRooms: string[] = [];
        oldSocket.rooms.forEach((roomId) => {
          if (roomId !== oldSocketId) {
            oldRooms.push(roomId);
          }
        });

        // 각 방의 유저 목록 업데이트
        for (const roomId of oldRooms) {
          await updateRoomUsers(roomId, oldSocketId);
        }

        // 기존 소켓 강제 종료
        oldSocket.disconnect(true);
        delete users[oldSocketId];
      }

      await cleanupEmptyRooms();
    }

    // 새 매핑 저장
    clientToSocket[clientId] = socket.id;
    users[socket.id].clientId = clientId;
  });

  socket.on(SocketEvent.LOBBY, async () => {
    // 유저가 속한 방 목록 저장 (socket.id 제외)
    const userRooms: string[] = [];
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        userRooms.push(roomId);
      }
    });

    // 모든 방에서 나가기
    userRooms.forEach((roomId) => {
      socket.leave(roomId);
    });

    // 각 방의 남은 유저들에게 업데이트된 유저 목록 전송
    for (const roomId of userRooms) {
      await updateRoomUsers(roomId, socket.id);
    }

    // 빈 방 정리
    await cleanupEmptyRooms();

    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
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
      subject: "투표 주제를 입력해주세요.",
      password: roomPassword,
      creator: {
        id: socket.id,
        nickname: users[socket.id].nickname || "익명",
      },
      rules: defaultRoomRules,
      vote: {},
      createdAt: new Date(),
      voteStartedAt: null,
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

    io.to(roomId).emit(
      SocketEvent.VOTE,
      serde.serializeVote(room.vote),
      options
    );
  });

  socket.on(SocketEvent.SET_ROOM_SUBJECT, async (roomId, subject) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    rooms[roomIndex].subject = subject;
    io.to(roomId).emit(SocketEvent.SET_ROOM_SUBJECT, subject);
  });

  socket.on(SocketEvent.SET_ROOM_RULES, async (roomId, rules) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    const previousVoteType = rooms[roomIndex].rules.voteType;
    rooms[roomIndex].rules = rules;

    // voteType이 변경되면 기존 투표 데이터 및 타이머 초기화
    if (previousVoteType !== rules.voteType) {
      rooms[roomIndex].vote = {};
      rooms[roomIndex].voteStartedAt = null;
    }

    io.to(roomId).emit(SocketEvent.SET_ROOM_RULES, rules);
  });

  socket.on(SocketEvent.VOTE_START, async (roomId, options: string[]) => {
    const roomIndex = rooms.findIndex((room) => room.id === roomId);
    if (roomIndex === -1) return;

    rooms[roomIndex].vote = {};
    options.forEach((option) => {
      rooms[roomIndex].vote[option] = new Set();
    });
    rooms[roomIndex].voteStartedAt = new Date();

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

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    // 유저가 속한 방 목록 저장 (socket.id 제외)
    const userRooms: string[] = [];
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        userRooms.push(roomId);
      }
    });

    // 각 방의 남은 유저들에게 업데이트된 유저 목록 전송 (users 삭제 전에)
    for (const roomId of userRooms) {
      await updateRoomUsers(roomId, socket.id);
    }

    // clientToSocket 매핑 정리
    const clientId = users[socket.id]?.clientId;
    if (clientId && clientToSocket[clientId] === socket.id) {
      delete clientToSocket[clientId];
    }

    delete users[socket.id];
    clearInterval(interval);

    // 빈 방 정리
    await cleanupEmptyRooms();

    io.emit(SocketEvent.GET_ROOM_LIST, await getRoomList());
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
