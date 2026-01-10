import { useState, useCallback } from "react";
import { useSetAtom } from "jotai";
import { shapesAtom, type Shape } from "../atoms";
import type { ViewBox } from "./useViewBox";
import type { Point } from "../lib/svgCoordinates";

export const useErasing = (
	svgRef: React.RefObject<SVGSVGElement | null>,
	viewBox: ViewBox,
) => {
	const [isErasing, setIsErasing] = useState(false);
	const setShapes = useSetAtom(shapesAtom);

	const eraseShape = useCallback(
		(shape: Shape) => {
			if (!isErasing) return;

			setShapes((prev) => prev.filter((s) => s.id !== shape.id));
		},
		[isErasing, setShapes],
	);

	const startErasing = useCallback(() => {
		setIsErasing(true);
	}, []);

	const stopErasing = useCallback(() => {
		setIsErasing(false);
	}, []);

	return {
		isErasing,
		startErasing,
		stopErasing,
		eraseShape,
	};
};
