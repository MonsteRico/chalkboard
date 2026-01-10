import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type Tool = "cursor" | "pen" | "eraser" | "rectangle";

export const toolAtom = atom<Tool>("cursor");

export const darkModeAtom = atomWithStorage<boolean>(
	"darkMode",
	true,
	undefined,
	{
		getOnInit: true,
	},
);

export type ShapeType = "circle" | "square" | "triangle" | "diamond" | "path";

abstract class BaseShape {
	id: string;
	type: ShapeType;
	x: number;
	y: number;
	strokeColor: string;
	fillColor: string;

	constructor({
		id,
		type,
		x,
		y,
	}: {
		id: string;
		type: ShapeType;
		x: number;
		y: number;
	}) {
		this.id = id;
		this.type = type;
		this.x = x;
		this.y = y;
		this.strokeColor = "default";
		this.fillColor = "default";
	}

	abstract collisionDetectionFn(mouseX: number, mouseY: number): boolean;

	setStrokeColor(strokeColor: string) {
		this.strokeColor = strokeColor;
	}
    

	setFillColor(fillColor: string) {
		this.fillColor = fillColor;
	}
}

export class CircleShape extends BaseShape {
	radius: number;

	constructor({
		id,
		x,
		y,
		radius,
	}: { id: string; x: number; y: number; radius: number }) {
		super({ id, type: "circle", x, y });
		this.radius = radius;
	}

	collisionDetectionFn(mouseX: number, mouseY: number): boolean {
		return (
			Math.sqrt((mouseX - this.x) ** 2 + (mouseY - this.y) ** 2) <= this.radius
		);
	}
}

export class SquareShape extends BaseShape {
	width: number;
	height: number;

	constructor({
		id,
		x,
		y,
		width,
		height,
	}: { id: string; x: number; y: number; width: number; height: number }) {
		super({ id, type: "square", x, y });
		this.width = width;
		this.height = height;
	}

	collisionDetectionFn(mouseX: number, mouseY: number): boolean {
		return (
			mouseX >= this.x - this.width / 2 &&
			mouseX <= this.x + this.width / 2 &&
			mouseY >= this.y - this.height / 2 &&
			mouseY <= this.y + this.height / 2
		);
	}
}

export class TriangleShape extends BaseShape {
	width: number;
	height: number;

	constructor({
		id,
		x,
		y,
		width,
		height,
	}: { id: string; x: number; y: number; width: number; height: number }) {
		super({ id, type: "triangle", x, y });
		this.width = width;
		this.height = height;
	}

	collisionDetectionFn(mouseX: number, mouseY: number): boolean {
		return (
			mouseX >= this.x - this.width / 2 &&
			mouseX <= this.x + this.width / 2 &&
			mouseY >= this.y - this.height / 2 &&
			mouseY <= this.y + this.height / 2
		);
	}
}

export class DiamondShape extends BaseShape {
	width: number;
	height: number;

	constructor({
		id,
		x,
		y,
		width,
		height,
	}: { id: string; x: number; y: number; width: number; height: number }) {
		super({ id, type: "diamond", x, y });
		this.width = width;
		this.height = height;
	}

	collisionDetectionFn(mouseX: number, mouseY: number): boolean {
		return (
			mouseX >= this.x - this.width / 2 &&
			mouseX <= this.x + this.width / 2 &&
			mouseY >= this.y - this.height / 2 &&
			mouseY <= this.y + this.height / 2
		);
	}
}

export class PathShape extends BaseShape {
	d: string; // SVG path data

	constructor({
		id,
		x,
		y,
		d,
	}: { id: string; x: number; y: number; d: string }) {
		super({ id, type: "path", x, y });
		this.d = d;
	}

	collisionDetectionFn(mouseX: number, mouseY: number): boolean {
		// Check the distance from the mouse to any point on the path. If the distance is less than the stroke width, return true.
        return false;
	}
}

export type Shape =
	| CircleShape
	| SquareShape
	| TriangleShape
	| DiamondShape
	| PathShape;

export const shapesAtom = atom<Shape[]>([]);
