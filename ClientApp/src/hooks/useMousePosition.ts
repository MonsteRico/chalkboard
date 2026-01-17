import { useEffect, useRef, useState } from "react";
import { createSvgPointConverter, setupSvgPoint } from "../lib/svgCoordinates";

export interface MousePosition {
	x: number;
	y: number;
}

export const useMousePosition = (
	svgRef: React.RefObject<SVGSVGElement | null>,
) => {
	const mousePositionRef = useRef<MousePosition>({ x: 0, y: 0 });
	const [mousePositionDisplay, setMousePositionDisplay] =
		useState<MousePosition>({ x: 0, y: 0 });
	const svgPointRef = useRef<SVGPoint | null>(null);

	// Initialize SVG point once
	useEffect(() => {
		setupSvgPoint(svgRef, svgPointRef);
	}, [svgRef]);

	// Throttled mouse position update for display (only updates UI periodically)
	useEffect(() => {
		let rafId: number;
		const updateDisplay = () => {
			setMousePositionDisplay({ ...mousePositionRef.current });
			rafId = requestAnimationFrame(updateDisplay);
		};
		rafId = requestAnimationFrame(updateDisplay);
		return () => cancelAnimationFrame(rafId);
	}, []);

	const updateMousePosition = (clientX: number, clientY: number) => {
		const converter = createSvgPointConverter(svgRef, svgPointRef);
		const point = converter(clientX, clientY);
		if (point) {
			mousePositionRef.current = point;
		}
	};

	const getMousePosition = () => mousePositionRef.current;

	const getMouseInSvgSpace = (clientX: number, clientY: number) => {
		const converter = createSvgPointConverter(svgRef, svgPointRef);
		return converter(clientX, clientY);
	};

	return {
		mousePositionDisplay,
		updateMousePosition,
		getMousePosition,
		getMouseInSvgSpace,
	};
};
