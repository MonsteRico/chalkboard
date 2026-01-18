import type { Tool } from "./tool";

/**
 * User data structure
 * Represents a user in a room
 */
export interface User {
	id: string;
	displayName: string;
	currentRoomId: string;
	currentTool: Tool;
	cursorColor: string;
	cursorPosition: { x: number; y: number };
}

/**
 * Client data structure used by the backend
 * This is what's stored in the WebSocket connection data
 */
export interface ClientData {
	id: string;
	displayName: string;
	roomId: string;
	cursorColor: string;
	currentTool: Tool;
}
