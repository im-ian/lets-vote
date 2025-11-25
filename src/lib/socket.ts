// socket.ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:3001");

export const SocketEvent = {
  JOIN_REQUEST_ROOM: "join-request-room",
  JOIN_ROOM: "join-room",
  JOINED_ROOM: "joined-room",
  JOIN_ROOM_ERROR: "join-room-error",
  CREATE_ROOM: "create-room",
  GET_ROOM_LIST: "get-room-list",
  SET_NICKNAME: "set-nickname",
} as const;
