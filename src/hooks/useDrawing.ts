import { useRef, useState, useEffect, useCallback } from "react";
import { useSetAtom } from "jotai";
import { shapesAtom, PathShape } from "../atoms";
import type { ViewBox } from "./useViewBox";
import type { Point } from "../lib/svgCoordinates";
import {
	initializeCanvasDrawing,
	drawPoint,
	clearCanvas,
	setupCanvasDrawing,
} from "../lib/canvasUtils";
import { pointsToPathData } from "../lib/pathUtils";

export const useDrawing = (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	svgRef: React.RefObject<SVGSVGElement | null>,
	viewBox: ViewBox,
	darkMode: boolean,
) => {
	const [isDrawing, setIsDrawing] = useState(false);
	const drawingPointsRef = useRef<Point[]>([]);
	const setShapes = useSetAtom(shapesAtom);

	// Setup canvas size
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const updateCanvasSize = () => {
			if (svgRef.current) {
				const rect = svgRef.current.getBoundingClientRect();
				canvas.width = rect.width;
				canvas.height = rect.height;
			}
		};

		updateCanvasSize();
		window.addEventListener("resize", updateCanvasSize);
		return () => window.removeEventListener("resize", updateCanvasSize);
	}, [canvasRef, svgRef]);

	const startDrawing = useCallback(
		(startPoint: Point) => {
			setIsDrawing(true);
			drawingPointsRef.current = [startPoint];

			const canvas = canvasRef.current;
			if (!canvas) return;

			const strokeColor = darkMode ? "white" : "black";
			initializeCanvasDrawing(canvas, viewBox, startPoint, strokeColor);
		},
		[canvasRef, viewBox, darkMode],
	);

	const continueDrawing = useCallback(
		(point: Point) => {
			if (!isDrawing) return;

			drawingPointsRef.current.push(point);

			const canvas = canvasRef.current;
			if (!canvas) return;

			const strokeColor = darkMode ? "white" : "black";
			const ctx = setupCanvasDrawing(canvas, viewBox, strokeColor);
			if (!ctx) return;

			const prevPoint =
				drawingPointsRef.current[drawingPointsRef.current.length - 2];
			drawPoint(ctx, point, prevPoint);
		},
		[isDrawing, canvasRef, viewBox, darkMode],
	);

	const finishDrawing = useCallback(() => {
		if (!isDrawing) return;

		setIsDrawing(false);

		const points = drawingPointsRef.current;
		if (points.length > 0) {
			// Convert drawing points to SVG path
			const pathData = pointsToPathData(points);

			// Create path shape
			const pathShape = new PathShape({
				id: crypto.randomUUID(),
				x: points[0].x,
				y: points[0].y,
				d: pathData,
			});

			// Save to shapes
			setShapes((prev) => [...prev, pathShape]);

			// Clear canvas
			const canvas = canvasRef.current;
			if (canvas) {
				clearCanvas(canvas, viewBox);
			}

			drawingPointsRef.current = [];
		}
	}, [isDrawing, canvasRef, viewBox, setShapes]);

	return {
		isDrawing,
		startDrawing,
		continueDrawing,
		finishDrawing,
	};
};
