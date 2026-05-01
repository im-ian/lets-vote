import { useEffect } from "react";
import { useSocket } from "@/components/providers/SocketProvider";

export function useSocketEvent<T = any>(
  eventName: string,
  handler: (data: T) => void,
  deps: React.DependencyList = []
) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on(eventName, handler);

    return () => {
      socket.off(eventName, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, eventName, handler, ...deps]);
}

type EventHandlers = Record<string, (data: any) => void>;

export function useSocketEvents(
  handlers: EventHandlers,
  deps: React.DependencyList = []
) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    Object.entries(handlers).forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });
    };
  }, [socket, isConnected, ...deps]);
}
