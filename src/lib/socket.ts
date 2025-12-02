// socket.ts
import { io } from "socket.io-client";

// 환경에 따라 서버 URL 결정
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3001"
    : `${window.location.protocol}//${window.location.hostname}:3001`);

export const socket = io(SOCKET_URL);
