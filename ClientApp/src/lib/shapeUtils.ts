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
		case "circle": {
			const circle = shape as CircleShape;
			return {
				id: circle.id,
				type: "circle",
				x: circle.x,
				y: circle.y,
				radius: circle.radius,
				strokeColor: circle.strokeColor,
				fillColor: circle.fillColor,
			};
		}

		case "rectangle": {
			const rect = shape as RectangleShape;
			return {
				id: rect.id,
				type: "rectangle",
				x: rect.x,
				y: rect.y,
				width: rect.width,
				height: rect.height,
				strokeColor: rect.strokeColor,
				fillColor: rect.fillColor,
			};
		}

		case "triangle": {
			const triangle = shape as TriangleShape;
			return {
				id: triangle.id,
				type: "triangle",
				x: triangle.x,
				y: triangle.y,
				width: triangle.width,
				height: triangle.height,
				strokeColor: triangle.strokeColor,
				fillColor: triangle.fillColor,
			};
		}

		case "diamond": {
			const diamond = shape as DiamondShape;
			return {
				id: diamond.id,
				type: "diamond",
				x: diamond.x,
				y: diamond.y,
				width: diamond.width,
				height: diamond.height,
				strokeColor: diamond.strokeColor,
				fillColor: diamond.fillColor,
			};
		}

		case "path": {
			const path = shape as PathShape;
			return {
				id: path.id,
				type: "path",
				x: path.x,
				y: path.y,
				d: path.d,
				strokeColor: path.strokeColor,
				fillColor: path.fillColor,
			};
		}
	}
}
