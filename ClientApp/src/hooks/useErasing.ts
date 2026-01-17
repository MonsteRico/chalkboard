import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { type Shape, shapesAtom } from "../atoms";
import type { ViewBox } from "./useViewBox";

export const useErasing = (
	_svgRef: React.RefObject<SVGSVGElement | null>,
	_viewBox: ViewBox,
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
