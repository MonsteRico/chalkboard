import type { Shape as SerializableShape } from "../../../shared/types";
import {
	CircleShape,
	RectangleShape,
	TriangleShape,
	DiamondShape,
	PathShape,
	type Shape,
} from "@/atoms";

/**
 * Convert a serializable shape (from WebSocket) to a Shape class instance
 */
export function deserializeShape(serializable: SerializableShape): Shape {
	switch (serializable.type) {
		case "circle":
			const circle = new CircleShape({
				id: serializable.id,
				x: serializable.x,
				y: serializable.y,
				radius: serializable.radius,
			});
			circle.setStrokeColor(serializable.strokeColor);
			circle.setFillColor(serializable.fillColor);
			return circle;

		case "rectangle":
			const rect = new RectangleShape({
				id: serializable.id,
				x: serializable.x,
				y: serializable.y,
				width: serializable.width,
				height: serializable.height,
			});
			rect.setStrokeColor(serializable.strokeColor);
			rect.setFillColor(serializable.fillColor);
			return rect;

		case "triangle":
			const triangle = new TriangleShape({
				id: serializable.id,
				x: serializable.x,
				y: serializable.y,
				width: serializable.width,
				height: serializable.height,
			});
			triangle.setStrokeColor(serializable.strokeColor);
			triangle.setFillColor(serializable.fillColor);
			return triangle;

		case "diamond":
			const diamond = new DiamondShape({
				id: serializable.id,
				x: serializable.x,
				y: serializable.y,
				width: serializable.width,
				height: serializable.height,
			});
			diamond.setStrokeColor(serializable.strokeColor);
			diamond.setFillColor(serializable.fillColor);
			return diamond;

		case "path":
			const path = new PathShape({
				id: serializable.id,
				x: serializable.x,
				y: serializable.y,
				d: serializable.d,
			});
			path.setStrokeColor(serializable.strokeColor);
			path.setFillColor(serializable.fillColor);
			return path;
	}
}

/**
 * Convert an array of serializable shapes to Shape class instances
 */
export function deserializeShapes(shapes: SerializableShape[]): Shape[] {
	return shapes.map(deserializeShape);
}

/**
 * Convert a Shape class instance to a serializable shape (for WebSocket)
 */
export function serializeShape(shape: Shape): SerializableShape {
	switch (shape.type) {
		case "circle":
			return {
				id: shape.id,
				type: "circle",
				x: shape.x,
				y: shape.y,
				radius: shape.radius,
				strokeColor: shape.strokeColor,
				fillColor: shape.fillColor,
			};

		case "rectangle":
			return {
				id: shape.id,
				type: "rectangle",
				x: shape.x,
				y: shape.y,
				width: shape.width,
				height: shape.height,
				strokeColor: shape.strokeColor,
				fillColor: shape.fillColor,
			};

		case "triangle":
			return {
				id: shape.id,
				type: "triangle",
				x: shape.x,
				y: shape.y,
				width: shape.width,
				height: shape.height,
				strokeColor: shape.strokeColor,
				fillColor: shape.fillColor,
			};

		case "diamond":
			return {
				id: shape.id,
				type: "diamond",
				x: shape.x,
				y: shape.y,
				width: shape.width,
				height: shape.height,
				strokeColor: shape.strokeColor,
				fillColor: shape.fillColor,
			};

		case "path":
			return {
				id: shape.id,
				type: "path",
				x: shape.x,
				y: shape.y,
				d: shape.d,
				strokeColor: shape.strokeColor,
				fillColor: shape.fillColor,
			};
	}
}
