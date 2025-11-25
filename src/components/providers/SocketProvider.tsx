// SocketContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
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
