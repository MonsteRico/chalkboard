import { useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { RectangleShape, type Shape, shapesAtom } from "../atoms";
import type { Point } from "../lib/svgCoordinates";
import { serializeShape } from "../lib/shapeUtils";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

export const useDrawRectangle = (
	_svgRef: React.RefObject<SVGSVGElement | null>,
) => {
	const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
	const setShapes = useSetAtom(shapesAtom);
	const [startPoint, setStartPoint] = useState<Point | null>(null);
	const [endPoint, setEndPoint] = useState<Point | null>(null);
	const rectangleRef = useRef<RectangleShape | null>(null);
	const { sendUpdate } = useWebSocketContext();


	const startDrawingRectangle = useCallback(
		(startPoint: Point) => {
			setIsDrawingRectangle(true);
			setStartPoint(startPoint);
			setEndPoint(startPoint);

			rectangleRef.current = new RectangleShape({
				id: crypto.randomUUID(),
				x: startPoint.x,
				y: startPoint.y,
				width: 0,
				height: 0,
			});
			setShapes((prev) => [...prev, rectangleRef.current as Shape]);
			const shape = rectangleRef.current as Shape;
			sendUpdate({
				type: "ADD_SHAPE",
				payload: serializeShape(shape),
			});
		},
		[setShapes, sendUpdate],
	);

	const continueDrawingRectangle = useCallback(
		(endPoint: Point, keepSquare: boolean) => {
			setEndPoint(endPoint);
			if (!rectangleRef.current || !startPoint) return;
			if (keepSquare) {
				const size = Math.min(
					endPoint.x - startPoint.x,
					endPoint.y - startPoint.y,
				);
				rectangleRef.current.width = size;
				rectangleRef.current.height = size;
			} else {
				rectangleRef.current.width = endPoint.x - startPoint.x;
				rectangleRef.current.height = endPoint.y - startPoint.y;
			}
			setShapes((prev) =>
				prev.map((shape) =>
					shape.id === rectangleRef.current?.id
						? (rectangleRef.current as Shape)
						: shape,
				),
			);
			const shape = rectangleRef.current as Shape;
			sendUpdate({
				type: "UPDATE_SHAPE",
				payload: serializeShape(shape),
			});
		},
		[startPoint, setShapes, sendUpdate],
	);

	const finishDrawingRectangle = useCallback(() => {
		if (!startPoint || !endPoint) return;

		if (!rectangleRef.current) return;

		setIsDrawingRectangle(false);
		setStartPoint(null);
		setEndPoint(null);
		rectangleRef.current = null;
	}, [startPoint, endPoint]);

	return {
		isDrawingRectangle,
		startDrawingRectangle,
		continueDrawingRectangle,
		finishDrawingRectangle,
	};
};
