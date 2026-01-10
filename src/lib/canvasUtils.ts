import type { ViewBox } from "../hooks/useViewBox";
import type { Point } from "./svgCoordinates";

export interface CanvasContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
}

export const setupCanvasTransform = (
	canvas: HTMLCanvasElement,
	viewBox: ViewBox,
): CanvasRenderingContext2D | null => {
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	// Reset transform and set up coordinate system to match SVG
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	// Scale and translate to match SVG viewBox
	const scaleX = canvas.width / viewBox.w;
	const scaleY = canvas.height / viewBox.h;
	ctx.scale(scaleX, scaleY);
	ctx.translate(-viewBox.x, -viewBox.y);

	// Set stroke style
	ctx.strokeStyle = "currentColor";
	ctx.lineWidth = 2 / Math.min(scaleX, scaleY);
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	return ctx;
};

export const setupCanvasDrawing = (
	canvas: HTMLCanvasElement,
	viewBox: ViewBox,
	strokeColor: string,
): CanvasRenderingContext2D | null => {
	const ctx = setupCanvasTransform(canvas, viewBox);
	if (!ctx) return null;

	ctx.strokeStyle = strokeColor;
	return ctx;
};

export const clearCanvas = (
	canvas: HTMLCanvasElement,
	viewBox: ViewBox,
): void => {
	const ctx = setupCanvasTransform(canvas, viewBox);
	if (!ctx) return;

	ctx.clearRect(viewBox.x, viewBox.y, viewBox.w, viewBox.h);
};

export const drawPoint = (
	ctx: CanvasRenderingContext2D,
	point: Point,
	previousPoint: Point | null,
): void => {
	if (previousPoint) {
		ctx.lineTo(point.x, point.y);
		ctx.stroke();
	} else {
		ctx.beginPath();
		ctx.moveTo(point.x, point.y);
	}
};

export const initializeCanvasDrawing = (
	canvas: HTMLCanvasElement,
	viewBox: ViewBox,
	startPoint: Point,
	strokeColor: string,
): void => {
	const ctx = setupCanvasDrawing(canvas, viewBox, strokeColor);
	if (!ctx) return;

	// Clear and start drawing
	ctx.clearRect(viewBox.x, viewBox.y, viewBox.w, viewBox.h);
	ctx.beginPath();
	ctx.moveTo(startPoint.x, startPoint.y);
};
