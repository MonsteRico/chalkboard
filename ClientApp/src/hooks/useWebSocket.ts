// Create a websocket connection to the backend server
// If the url has "/room/......." join the room specified

import { shapesAtom, connectionStatusAtom } from "@/atoms";
import { addUser, getUserById, localUserAtom, removeUser, updateCursorColor, updateCursorPosition, updateDisplayName, usersAtom } from "@/lib/usersAtoms";
import { deserializeShape, deserializeShapes } from "@/lib/shapeUtils";
import type { SocketMessage, Tool } from "../../../shared/types";
import { validateSocketMessage } from "../../../shared/types";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Re-export SocketMessage for use in WebSocketContext
export type { SocketMessage };

// Else, don't specify a room and it will auto join the lobby
export function useWebSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const errorNotifiedRef = useRef(false);
  const wasConnectedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const [localUser, setLocalUser] = useAtom(localUserAtom);
  const setUsers = useSetAtom(usersAtom);
  const setShapes = useSetAtom(shapesAtom);
  const setConnectionStatus = useSetAtom(connectionStatusAtom);
  
  useEffect(() => {    
    const roomId = window.location.pathname.split('/room/')[1] || "lobby";
    
    // CRITICAL: Check for valid user ID FIRST before any socket operations
    // If ID is missing, generate it and update the atom, then return early
    // The effect will re-run when localUser.id changes, and then we can connect
    let userId = localUser.id;
    if (!userId || userId.trim() === "") {
      // Clean up any existing socket that might have been created without an ID
      if (socketRef.current) {
        const ws = socketRef.current;
        // Remove error handler to prevent error toast
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, "User ID not ready");
        }
        socketRef.current = null;
      }
      
      // Generate ID if we don't have one stored in ref
      userId = userIdRef.current || crypto.randomUUID();
      userIdRef.current = userId;
      
      // Update atom synchronously - this will trigger effect re-run with valid ID
      setLocalUser((prev) => {
        if (!prev.id || prev.id.trim() === "") {
          return { ...prev, id: userId };
        }
        return prev;
      });
      
      // Don't attempt connection yet - wait for the effect to re-run with valid ID
      console.log("Waiting for user ID to be set before connecting");
      return;
    }
    
    // Store the existing ID in ref
    userIdRef.current = userId;
    
    // NOW we can check socket state and prevent multiple connection attempts
    // Only skip if already connected or connecting
    // If CLOSED (3) or CLOSING (2), we can create a new connection
    if (socketRef.current) {
      const state = socketRef.current.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        console.log("WebSocket already connecting/connected, skipping");
        return;
      }
      // Clean up closed/closing socket
      if (state === WebSocket.CLOSED || state === WebSocket.CLOSING) {
        socketRef.current = null;
      }
    }
    
    console.log("useWebSocket", roomId, localUser.displayName, localUser.cursorColor, userId);
    
    // Reset flags
    errorNotifiedRef.current = false;
    wasConnectedRef.current = false;
    
    // Set status to connecting
    setConnectionStatus('connecting');
    
    // Connect with roomId in path (cleaner than query params)
    // Use environment variable or default to localhost:3000 for development
    const wsUrl = import.meta.env.VITE_WS_URL || (typeof window !== 'undefined' 
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
      : 'ws://localhost:3000/ws');
    const ws = new WebSocket(`${wsUrl}/${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected, sending CONNECT message");
      
      // Send CONNECT message with user data after connection opens
      const connectMessage: SocketMessage = {
        type: "CONNECT",
        payload: {
          id: userId,
          displayName: localUser.displayName,
          roomId: roomId,
          cursorColor: localUser.cursorColor,
          currentTool: localUser.currentTool,
        }
      };
      
      ws.send(JSON.stringify(connectMessage));
      
      // Connection is established, but we'll wait for INITIAL_STATE before showing success
      wasConnectedRef.current = true;
      errorNotifiedRef.current = false; // Reset flag on successful connection
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Don't show error toast if this is a connection that was closed before it could open
      // (e.g., during cleanup or when ID wasn't ready)
      // Only show error if the socket was actually attempting to connect
      if (ws.readyState === WebSocket.CLOSED && !wasConnectedRef.current) {
        // Connection closed before opening - likely due to cleanup or ID setup
        // Don't show error toast for this case
        console.log("WebSocket closed before opening, likely due to setup - ignoring error");
        return;
      }
      
      setConnectionStatus('local');
      // Only show notification once per connection attempt
      if (!errorNotifiedRef.current) {
        errorNotifiedRef.current = true;
        toast.warning("Unable to connect to server. You are now in local board mode.", {
          description: "Your changes will be saved locally. You can join a room later when the server is available.",
          duration: 6000,
        });
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed", event.code, event.reason);
      // Only set to local if it wasn't a clean close (code 1000)
      if (event.code !== 1000) {
        setConnectionStatus('local');
        // Show notification if we haven't already shown one
        // If we were connected, show "connection lost", otherwise onerror already handled it
        if (!errorNotifiedRef.current) {
          errorNotifiedRef.current = true;
          if (wasConnectedRef.current) {
            toast.warning("Connection lost. You are now in local board mode.", {
              description: "Your changes will be saved locally. You can reconnect when the server is available.",
              duration: 6000,
            });
          } else {
            toast.warning("Unable to connect to server. You are now in local board mode.", {
              description: "Your changes will be saved locally. You can join a room later when the server is available.",
              duration: 6000,
            });
          }
        }
      }
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = validateSocketMessage(parsed);
        
        if (!data) {
          // Validation failed - log and ignore
          console.warn("Received invalid message from server, ignoring");
          return;
        }
        
        switch(data.type) {
          case 'DRAW_UPDATE':
            // TODO: Implement draw update handling
            break;
          case "USER_JOINED":
            // Don't process our own join (server should not send it, but be safe)
            if (data.payload.id !== userIdRef.current) {
              toast.success(`${data.payload.displayName} joined the room`);
              addUser({ 
                id: data.payload.id, 
                displayName: data.payload.displayName, // Already decoded by backend
                currentRoomId: roomId, 
                currentTool: data.payload.currentTool as Tool, 
                cursorColor: data.payload.cursorColor, // Already decoded by backend
                cursorPosition: { x: 0, y: 0 } 
              });
            }
            break;
          case "USER_LEFT":
            const user = getUserById(data.payload.id);
            if (user) {
              toast.error(`${user.displayName} left the room`);
            }
            removeUser(data.payload.id);
            break;
          case "UPDATE_DISPLAY_NAME":
            const userBeforeUpdate = getUserById(data.payload.id);
            if (userBeforeUpdate && userBeforeUpdate.displayName !== data.payload.displayName) {
              toast.success(`${userBeforeUpdate.displayName} updated their display name to ${data.payload.displayName}`);
            }
            updateDisplayName(data.payload.id, data.payload.displayName);
            break;
          case "UPDATE_CURSOR_COLOR":
            const userBeforeColorUpdate = getUserById(data.payload.id);
            if (userBeforeColorUpdate && userBeforeColorUpdate.cursorColor !== data.payload.cursorColor) {
              toast.success(`${userBeforeColorUpdate.displayName} updated their cursor color to ${data.payload.cursorColor}`);
            }
            updateCursorColor(data.payload.id, data.payload.cursorColor);
            break;
          case "UPDATE_CURSOR_POSITION":
            // Silently update cursor position - no toast notification for frequent updates
            updateCursorPosition(data.payload.id, data.payload.cursorPosition);
            break;
          case "INITIAL_STATE":
            // Convert serializable shapes to Shape class instances
            setShapes(deserializeShapes(data.payload.shapes));
            // Replace users completely - INITIAL_STATE is authoritative
            setUsers(data.payload.users);
            // Now we're fully connected - show success toast
            setConnectionStatus('connected');
            toast.success(`Connected to room: ${roomId}`);
            break;
          case "CONNECT":
            // CONNECT is only sent by client, not received
            // If we receive it, something is wrong
            console.warn("Received CONNECT message from server, this should not happen");
            break;
          case "ADD_SHAPE":
            setShapes((prev) => [...prev, deserializeShape(data.payload)]);
            break;
          case "REMOVE_SHAPE":
            setShapes((prev) => prev.filter((shape) => shape.id !== data.payload.id));
            break;
          case "UPDATE_SHAPE":
            setShapes((prev) => prev.map((shape) => shape.id === data.payload.id ? deserializeShape(data.payload) : shape));
            break;
          case "CLEAR_CANVAS":
            setShapes([]);
            toast.info("Canvas cleared");
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    return () => {
      if (socketRef.current === ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close(1000, "Component unmounting");
      }
      // Clear users when disconnecting to prevent stale data
      setUsers([]);
    };
  }, [localUser.id, setConnectionStatus, setShapes, setUsers]);

  const sendUpdate = (message: SocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
    // Silently ignore if not connected (local mode)
  };

  return { sendUpdate };
}