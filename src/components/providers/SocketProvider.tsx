// SocketContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { SocketEvent, socket } from "../../lib/socket";

const SocketContext = createContext({
  socket,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected");

      // 고유 클라이언트 ID 생성 또는 가져오기
      let clientId = localStorage.getItem("clientId");
      if (!clientId) {
        clientId = uuidv4();
        localStorage.setItem("clientId", clientId);
      }

      // 서버에 클라이언트 ID 전송
      socket.emit("register-client", clientId);

      const nickname = sessionStorage.getItem("nickname");
      if (nickname) {
        socket.emit(SocketEvent.SET_NICKNAME, nickname);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
