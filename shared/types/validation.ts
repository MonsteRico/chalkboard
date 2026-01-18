import { z } from "zod";
import type { SocketMessage } from "./messages";

/**
 * Zod schemas for runtime validation of WebSocket messages
 * These ensure type safety at runtime and prevent malformed messages from crashing clients
 */

// Tool schema
export const toolSchema = z.enum(["cursor", "pen", "eraser", "rectangle"]);

// Shape type schema
export const shapeTypeSchema = z.enum(["circle", "rectangle", "triangle", "diamond", "path"]);

// Base shape schema
const baseShapeSchema = z.object({
	id: z.string(),
	type: shapeTypeSchema,
	x: z.number(),
	y: z.number(),
	strokeColor: z.string(),
	fillColor: z.string(),
});

// Individual shape schemas
const circleShapeSchema = baseShapeSchema.extend({
	type: z.literal("circle"),
	radius: z.number(),
});

const rectangleShapeSchema = baseShapeSchema.extend({
	type: z.literal("rectangle"),
	width: z.number(),
	height: z.number(),
});

const triangleShapeSchema = baseShapeSchema.extend({
	type: z.literal("triangle"),
	width: z.number(),
	height: z.number(),
});

const diamondShapeSchema = baseShapeSchema.extend({
	type: z.literal("diamond"),
	width: z.number(),
	height: z.number(),
});

const pathShapeSchema = baseShapeSchema.extend({
	type: z.literal("path"),
	d: z.string(),
});

// Union shape schema
export const shapeSchema: z.ZodType<import("./shape").Shape> = z.discriminatedUnion("type", [
	circleShapeSchema,
	rectangleShapeSchema,
	triangleShapeSchema,
	diamondShapeSchema,
	pathShapeSchema,
]);

// User schema
export const userSchema = z.object({
	id: z.string(),
	displayName: z.string(),
	currentRoomId: z.string(),
	currentTool: toolSchema,
	cursorColor: z.string(),
	cursorPosition: z.object({
		x: z.number(),
		y: z.number(),
	}),
});

const initialStatePayloadSchema = z.object({
	shapes: z.array(shapeSchema),
	users: z.array(userSchema),
});

// Individual message schemas
const initialStateMessageSchema = z.object({
	type: z.literal("INITIAL_STATE"),
	payload: initialStatePayloadSchema,
});

const drawUpdateMessageSchema = z.object({
	type: z.literal("DRAW_UPDATE"),
	payload: z.string(),
});

const addShapeMessageSchema = z.object({
	type: z.literal("ADD_SHAPE"),
	payload: shapeSchema,
});

const removeShapeMessageSchema = z.object({
	type: z.literal("REMOVE_SHAPE"),
	payload: shapeSchema,
});

const updateShapeMessageSchema = z.object({
	type: z.literal("UPDATE_SHAPE"),
	payload: shapeSchema,
});

const clearCanvasMessageSchema = z.object({
	type: z.literal("CLEAR_CANVAS"),
});

const userJoinedMessageSchema = z.object({
	type: z.literal("USER_JOINED"),
	payload: z.object({
		displayName: z.string(),
		id: z.string(),
		cursorColor: z.string(),
		currentTool: z.string(),
	}),
});

const userLeftMessageSchema = z.object({
	type: z.literal("USER_LEFT"),
	payload: z.object({
		id: z.string(),
	}),
});

const updateDisplayNameMessageSchema = z.object({
	type: z.literal("UPDATE_DISPLAY_NAME"),
	payload: z.object({
		id: z.string(),
		displayName: z.string(),
	}),
});

const updateCursorColorMessageSchema = z.object({
	type: z.literal("UPDATE_CURSOR_COLOR"),
	payload: z.object({
		id: z.string(),
		cursorColor: z.string(),
	}),
});

const updateCursorPositionMessageSchema = z.object({
	type: z.literal("UPDATE_CURSOR_POSITION"),
	payload: z.object({
		id: z.string(),
		cursorPosition: z.object({
			x: z.number(),
			y: z.number(),
		}),
	}),
});

const connectMessageSchema = z.object({
	type: z.literal("CONNECT"),
	payload: z.object({
		id: z.string().optional(),
		displayName: z.string(),
		roomId: z.string(),
		cursorColor: z.string(),
		currentTool: z.string(),
	}),
});

// Main message schema - discriminated union
export const socketMessageSchema = z.discriminatedUnion("type", [
	connectMessageSchema,
	initialStateMessageSchema,
	drawUpdateMessageSchema,
	addShapeMessageSchema,
	removeShapeMessageSchema,
	updateShapeMessageSchema,
	clearCanvasMessageSchema,
	userJoinedMessageSchema,
	userLeftMessageSchema,
	updateDisplayNameMessageSchema,
	updateCursorColorMessageSchema,
	updateCursorPositionMessageSchema,
]) as z.ZodType<SocketMessage>;

/**
 * Validate a parsed JSON object as a SocketMessage
 * @param data - The parsed JSON data to validate
 * @returns The validated SocketMessage, or null if validation fails
 */
export function validateSocketMessage(data: unknown): SocketMessage | null {
	const result = socketMessageSchema.safeParse(data);
	if (result.success) {
		return result.data;
	}
	console.error("Message validation failed:", result.error);
	return null;
}
