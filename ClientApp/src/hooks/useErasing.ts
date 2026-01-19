import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { type Shape, shapesAtom } from "../atoms";
import type { ViewBox } from "./useViewBox";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { serializeShape } from "@/lib/shapeUtils";

export const useErasing = (
	_svgRef: React.RefObject<SVGSVGElement | null>,
	_viewBox: ViewBox,
) => {
	const [isErasing, setIsErasing] = useState(false);
	const setShapes = useSetAtom(shapesAtom);
	const { sendUpdate } = useWebSocketContext();
	
	const eraseShape = useCallback(
		(shape: Shape) => {
			if (!isErasing) return;
			sendUpdate({
				type: "REMOVE_SHAPE",
				payload: serializeShape(shape),
			});
			setShapes((prev) => prev.filter((s) => s.id !== shape.id));
		},
		[isErasing, setShapes, sendUpdate],
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
