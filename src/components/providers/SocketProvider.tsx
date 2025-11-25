// SocketContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../../lib/socket";

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
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
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
