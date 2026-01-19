import { type ServerWebSocket } from "bun";
import type { ClientData, Shape, SocketMessage, User } from "../shared/types";
import { validateSocketMessage } from "../shared/types";

// Map<RoomID, Map<UserID, WebSocket>> - Minimal user tracking for INITIAL_STATE and USER_JOINED
// This is separate from Bun's pub/sub which handles regular message broadcasting
const userSockets = new Map<string, Map<string, ServerWebSocket<ClientData>>>();

// Map<RoomID, Set<Shape>>
const shapes = new Map<string, Set<Shape>>();

// server.ts
const server = Bun.serve<ClientData>({
    port: 3000,
  fetch(req, server) {
    const url = new URL(req.url);
    // Support both /ws and /ws/{roomId} paths
    const pathMatch = url.pathname.match(/^\/ws(?:\/([^\/]+))?$/);
    if (pathMatch) {
      // Extract roomId from path, fallback to query param for backward compatibility, then "lobby"
      const roomIdFromPath = pathMatch[1];
      const roomId = roomIdFromPath || url.searchParams.get("roomId") || "lobby";
      
      // Upgrade the connection to a WebSocket with minimal data
      // User data will be sent in the initial CONNECT message
      const success = server.upgrade(req, {
        data: {
          id: "", // Will be set when CONNECT message is received
          displayName: "", // Will be set when CONNECT message is received
          roomId: roomId,
          cursorColor: "#3b82f6", // Default, will be updated from CONNECT message
          currentTool: "cursor" as ClientData["currentTool"], // Default, will be updated from CONNECT message
        },
      });
      return success ? undefined : new Response("Upgrade failed", { status: 400 });
    }
  },
  websocket: {
    open(ws) {
      const { roomId } = ws.data;
      
      // Subscribe to room for Bun's pub/sub (used for regular message broadcasting)
      ws.subscribe(roomId);
      
      // Wait for CONNECT message to set up user data
      // Connection is established but user is not registered yet
      console.log(`WebSocket connection opened for room ${roomId}, waiting for CONNECT message`);
    },
    message(ws, rawMessage) {
      // Parse and validate message structure
      try {
        const parsed = JSON.parse(rawMessage.toString());
        const message = validateSocketMessage(parsed);
        
        if (!message) {
          // Validation failed - log and ignore
          console.warn(`Invalid message from user ${ws.data.id || "unknown"} in room ${ws.data.roomId}`);
          return;
        }
        
        // Handle CONNECT message specially - this sets up the user
        if (message.type === "CONNECT") {
          const { id, displayName, roomId, cursorColor, currentTool } = message.payload;
          
          // Use provided ID or generate one
          const userId = id && id.trim() !== "" ? id : crypto.randomUUID();
          
          // Update socket data with user information
          ws.data.id = userId;
          ws.data.displayName = displayName;
          ws.data.roomId = roomId; // Allow room change via CONNECT
          ws.data.cursorColor = cursorColor;
          ws.data.currentTool = currentTool as ClientData["currentTool"];
          
          // Subscribe to the room (in case room changed)
          ws.subscribe(roomId);
          
          console.log(`${displayName} (${userId}) connected to room ${roomId}`);
          
          // Initialize room user map if needed
          if (!userSockets.has(roomId)) {
            userSockets.set(roomId, new Map());
          }
          
          const roomUsers = userSockets.get(roomId)!;
          
          // If a user with the same ID already exists in this room, remove the old connection
          // This handles page refreshes where the old connection hasn't closed yet
          const existingSocket = roomUsers.get(userId);
          if (existingSocket && existingSocket !== ws) {
            console.log(`Removing duplicate connection for user ${userId}`);
            existingSocket.close(1000, "Replaced by new connection");
          }
          
          // Add this socket to the room's user map
          roomUsers.set(userId, ws);

          // Notify others in the room about the new user (excluding the sender)
          const userJoinedMessage = JSON.stringify({
            type: "USER_JOINED",
            payload: { 
              displayName: ws.data.displayName, 
              id: ws.data.id, 
              cursorColor: ws.data.cursorColor, 
              currentTool: ws.data.currentTool 
            }
          });
          
          // Send to all other users in the room
          for (const [otherUserId, socket] of roomUsers.entries()) {
            if (otherUserId !== userId && socket.readyState === 1) { // 1 = OPEN
              socket.send(userJoinedMessage);
            }
          }

          // Notify the new web socket of all users in the room (including themselves)
          // Convert ClientData to User format (add currentRoomId and cursorPosition)
          const allUsersInRoom: User[] = Array.from(roomUsers.values())
            .map((socket) => ({
              ...socket.data,
              currentRoomId: socket.data.roomId,
              cursorPosition: { x: 0, y: 0 }
            }));
          
          ws.send(JSON.stringify({
            type: "INITIAL_STATE",
            payload: { 
              shapes: Array.from(shapes.get(roomId) || []), 
              users: allUsersInRoom
            }
          }));
          
          return; // Don't broadcast CONNECT message
        }
        
        // For all other messages, require user to be connected first
        if (!ws.data.id || ws.data.id === "") {
          console.warn("Received message from unconnected socket, ignoring");
          return;
        }
        

        if (message.type === "ADD_SHAPE") {
          shapes.get(ws.data.roomId)?.add(message.payload);
        }
        if (message.type === "REMOVE_SHAPE") {
          shapes.get(ws.data.roomId)?.delete(message.payload);
        }
        if (message.type === "UPDATE_SHAPE") {
          // Get or initialize the shapes Set for this room
          if (!shapes.has(ws.data.roomId)) {
            shapes.set(ws.data.roomId, new Set());
          }
          const roomShapes = shapes.get(ws.data.roomId)!;
          
          // Find and delete the old shape by ID, then add the updated one
          for (const shape of roomShapes) {
            if (shape.id === message.payload.id) {
              roomShapes.delete(shape);
              break;
            }
          }
          roomShapes.add(message.payload);
        }
        if (message.type === "CLEAR_CANVAS") {
          shapes.get(ws.data.roomId)?.clear();
        }
        // Broadcast validated message to the room, excluding the sender
        ws.publish(ws.data.roomId, JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to parse message from user ${ws.data.id || "unknown"}:`, error);
        // Silently ignore malformed messages
      }
    },
    close(ws) {
      const { roomId, id: userId } = ws.data;
      console.log(`${ws.data.displayName} left room ${roomId}`);
      
      // Remove from user tracking map
      const roomUsers = userSockets.get(roomId);
      if (roomUsers) {
        // Only remove if this is still the current socket for this user
        if (roomUsers.get(userId) === ws) {
          roomUsers.delete(userId);
          
          // Clean up empty room maps
          if (roomUsers.size === 0) {
            userSockets.delete(roomId);
          }
        }
      }
      
      // Notify others in the room using Bun's pub/sub
      // Note: publish excludes the sender, so this is safe
      ws.publish(roomId, JSON.stringify({
        type: "USER_LEFT",
        payload: { id: ws.data.id }
      }));
      ws.unsubscribe(roomId);
    },
  },
});

console.log(`Server running on port ${server.port}`);