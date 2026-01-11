import { useCallback, useEffect, useState } from "react";

export interface ViewBox {
	x: number;
	y: number;
	w: number;
	h: number;
}

export const useViewBox = () => {
	const [viewBox, setViewBox] = useState<ViewBox>({
		x: 0,
		y: 0,
		w: window.innerWidth,
		h: window.innerHeight,
	});

	// Update viewBox dimensions when window resizes
	useEffect(() => {
		const handleResize = () => {
			setViewBox((prev) => ({
				...prev,
				w: window.innerWidth,
				h: window.innerHeight,
			}));
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handlePan = useCallback(
		(movementX: number, movementY: number) => {
			const scale = viewBox.w / window.innerWidth;
			setViewBox((prev) => ({
				...prev,
				x: prev.x - movementX * scale,
				y: prev.y - movementY * scale,
			}));
		},
		[viewBox.w],
	);

	const handleZoom = useCallback(
		(
			deltaY: number,
			clientX: number,
			clientY: number,
			getMouseInSvgSpace: (
				x: number,
				y: number,
			) => { x: number; y: number } | null,
		) => {
			const mouseInSvgSpace = getMouseInSvgSpace(clientX, clientY);
			if (!mouseInSvgSpace) return;

			const zoomFactor = deltaY > 0 ? 1.1 : 0.9;

			setViewBox((prev) => {
				// Calculate new dimensions
				const newW = prev.w * zoomFactor;
				const newH = prev.h * zoomFactor;

				// Calculate zoom center in SVG coordinates
				const zoomCenterX = mouseInSvgSpace.x;
				const zoomCenterY = mouseInSvgSpace.y;

				// Adjust viewBox position to zoom towards mouse cursor
				const scaleChange = newW / prev.w;
				const newX = zoomCenterX - (zoomCenterX - prev.x) * scaleChange;
				const newY = zoomCenterY - (zoomCenterY - prev.y) * scaleChange;

				return {
					x: newX,
					y: newY,
					w: newW,
					h: newH,
				};
			});
		},
		[],
	);

	const viewBoxString = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;

	return {
		viewBox,
		setViewBox,
		handlePan,
		handleZoom,
		viewBoxString,
	};
};
