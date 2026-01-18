import { createContext, useContext, type ReactNode } from "react";
import { useWebSocket, type SocketMessage } from "@/hooks/useWebSocket";

type WebSocketContextType = {
  sendUpdate: (message: SocketMessage) => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { sendUpdate } = useWebSocket();
  
  return (
    <WebSocketContext.Provider value={{ sendUpdate }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider");
  }
  return context;
}
