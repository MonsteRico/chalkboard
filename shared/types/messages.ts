import type { Shape } from "./shape";
import type { User } from "./user";

/**
 * WebSocket message types
 * These are the messages sent between client and server
 */

export type SocketMessage =
	| { type: "CONNECT"; payload: { id?: string; displayName: string; roomId: string; cursorColor: string; currentTool: string } }
	| { type: "INITIAL_STATE"; payload: { shapes: Shape[]; users: User[] } }
	| { type: "DRAW_UPDATE"; payload: string }
	| { type: "ADD_SHAPE"; payload: Shape }
	| { type: "REMOVE_SHAPE"; payload: Shape }
	| { type: "UPDATE_SHAPE"; payload: Shape }
	| { type: "CLEAR_CANVAS" }
	| { type: "USER_JOINED"; payload: { displayName: string; id: string; cursorColor: string; currentTool: string } }
	| { type: "USER_LEFT"; payload: { id: string } }
	| { type: "UPDATE_DISPLAY_NAME"; payload: { id: string; displayName: string } }
	| { type: "UPDATE_CURSOR_COLOR"; payload: { id: string; cursorColor: string } }
	| { type: "UPDATE_CURSOR_POSITION"; payload: { id: string; cursorPosition: { x: number; y: number } } };

/**
 * Helper type to extract payload type from a message type
 */
export type MessagePayload<T extends SocketMessage["type"]> = Extract<
	SocketMessage,
	{ type: T }
> extends { payload: infer P }
	? P
	: never;
