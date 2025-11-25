// socket.ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:3001");

export const SocketEvent = {
  LOBBY: "lobby",
  JOIN_REQUEST_ROOM: "join-request-room",
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  JOINED_ROOM: "joined-room",
  JOIN_ROOM_ERROR: "join-room-error",
  CREATE_ROOM: "create-room",
  GET_ROOM_LIST: "get-room-list",
  SET_NICKNAME: "set-nickname",
  GET_ROOM_INFO: "get-room-info",
  SET_ROOM_SUBJECT: "set-room-subject",
  SET_ROOM_RULES: "set-room-rules",
  SELECT_OPTION: "select-option",
  VOTE: "vote",
  VOTE_START: "vote-start",
  VOTE_ADD_OPTION: "vote-add-option",
} as const;
