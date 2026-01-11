import { useAtom, useAtomValue } from "jotai";
import { useCallback, useRef, useState } from "react";
import { darkModeAtom, type Shape, shapesAtom, toolAtom } from "./atoms";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { Whiteboard } from "./components/Whiteboard";
import { DebugOverlay } from "./DebugOverlay";
import { useDrawing } from "./hooks/useDrawing";
import { useDrawRectangle } from "./hooks/useDrawRectangle";
import { useErasing } from "./hooks/useErasing";
import { useMousePosition } from "./hooks/useMousePosition";
import { useViewBox } from "./hooks/useViewBox";
import { getCursor, MIDDLE_CLICK } from "./lib/eventHandlers";
import { ToolsOverlay } from "./ToolsOverlay";

function App() {
	const [darkMode] = useAtom(darkModeAtom);
	const tool = useAtomValue(toolAtom);
	const [isPanning, setIsPanning] = useState(false);

	const svgRef = useRef<SVGSVGElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { viewBox, handlePan, handleZoom, viewBoxString } = useViewBox();
	const { mousePositionDisplay, updateMousePosition, getMouseInSvgSpace } =
		useMousePosition(svgRef);
	const { isDrawing, startDrawing, continueDrawing, finishDrawing } =
		useDrawing(canvasRef, svgRef, viewBox, darkMode);
	const { isErasing, startErasing, stopErasing, eraseShape } = useErasing(
		svgRef,
		viewBox,
	);
	const {
		isDrawingRectangle,
		startDrawingRectangle,
		continueDrawingRectangle,
		finishDrawingRectangle,
	} = useDrawRectangle(svgRef);

	const onMouseDown = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			if (MIDDLE_CLICK(e)) {
				setIsPanning(true);
				return;
			}
			if (tool === "pen") {
				const point = getMouseInSvgSpace(e.clientX, e.clientY);
				if (point) {
					startDrawing(point);
				}
			}
			if (tool === "eraser") {
				startErasing();
			}
			if (tool === "rectangle") {
				const point = getMouseInSvgSpace(e.clientX, e.clientY);
				if (point) {
					startDrawingRectangle(point);
				}
			}
		},
		[
			tool,
			startDrawing,
			startErasing,
			startDrawingRectangle,
			getMouseInSvgSpace,
		],
	);

	const onMouseUp = useCallback(() => {
		setIsPanning(false);

		stopErasing();

		finishDrawingRectangle();

		finishDrawing();
	}, [finishDrawing, stopErasing, finishDrawingRectangle]);

	const onMouseMove = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			// Update mouse position
			updateMousePosition(e.clientX, e.clientY);

			// Handle drawing
			if (isDrawing && tool === "pen") {
				const point = getMouseInSvgSpace(e.clientX, e.clientY);
				if (point) {
					continueDrawing(point);
				}
			}

			if (isDrawingRectangle) {
				const keepSquare = e.shiftKey;

				const point = getMouseInSvgSpace(e.clientX, e.clientY);
				if (point) {
					continueDrawingRectangle(point, keepSquare);
				}
			}

			// Handle panning
			if (MIDDLE_CLICK(e)) {
				handlePan(e.movementX, e.movementY);
			}
		},
		[
			isDrawing,
			isDrawingRectangle,
			tool,
			updateMousePosition,
			getMouseInSvgSpace,
			continueDrawing,
			handlePan,
			continueDrawingRectangle,
		],
	);

	const onWheel = useCallback(
		(e: React.WheelEvent<SVGSVGElement>) => {
			e.preventDefault();
			handleZoom(e.deltaY, e.clientX, e.clientY, getMouseInSvgSpace);
		},
		[handleZoom, getMouseInSvgSpace],
	);

	const cursor = getCursor(isPanning, tool);

	const onShapeMouseOver = useCallback(
		(shape: Shape) => {
			if (tool === "eraser" && isErasing) {
				eraseShape(shape);
			}
		},
		[tool, isErasing, eraseShape],
	);

	const onShapeClick = useCallback((shape: Shape) => {
		console.log("shape click", shape);
	}, []);

	const shapes = useAtomValue(shapesAtom);
	return (
		<main
			className={`h-screen w-screen overflow-hidden bg-background ${darkMode ? "dark" : ""}`}
		>
			<DebugOverlay
				viewBox={viewBox}
				mousePositionDisplay={mousePositionDisplay}
			/>
			<div className="relative h-full w-full">
				<Whiteboard
					viewBox={viewBox}
					viewBoxString={viewBoxString}
					shapes={shapes}
					svgRef={svgRef}
					onMouseDown={onMouseDown}
					onMouseUp={onMouseUp}
					onMouseMove={onMouseMove}
					onMouseLeave={onMouseUp}
					onWheel={onWheel}
					cursor={cursor}
					onShapeMouseOver={onShapeMouseOver}
					onShapeClick={onShapeClick}
				/>
				<DrawingCanvas canvasRef={canvasRef} />
			</div>
			<ToolsOverlay />
		</main>
	);
}

export default App;
