/**
 * Shape type definitions
 * These represent the serializable form of shapes sent over WebSocket
 */

export type ShapeType =
	| "circle"
	| "rectangle"
	| "triangle"
	| "diamond"
	| "path";

/**
 * Base shape properties common to all shapes
 */
export interface BaseShapeData {
	id: string;
	type: ShapeType;
	x: number;
	y: number;
	strokeColor: string;
	fillColor: string;
}

/**
 * Circle shape data
 */
export interface CircleShapeData extends BaseShapeData {
	type: "circle";
	radius: number;
}

/**
 * Rectangle shape data
 */
export interface RectangleShapeData extends BaseShapeData {
	type: "rectangle";
	width: number;
	height: number;
}

/**
 * Triangle shape data
 */
export interface TriangleShapeData extends BaseShapeData {
	type: "triangle";
	width: number;
	height: number;
}

/**
 * Diamond shape data
 */
export interface DiamondShapeData extends BaseShapeData {
	type: "diamond";
	width: number;
	height: number;
}

/**
 * Path shape data
 */
export interface PathShapeData extends BaseShapeData {
	type: "path";
	d: string; // SVG path data
}

/**
 * Union type representing any shape
 */
export type Shape =
	| CircleShapeData
	| RectangleShapeData
	| TriangleShapeData
	| DiamondShapeData
	| PathShapeData;
