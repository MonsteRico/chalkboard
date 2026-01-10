import type { Point } from "./svgCoordinates";

export const pointsToPathData = (points: Point[]): string => {
	if (points.length === 0) return "";

	let pathData = `M ${points[0].x} ${points[0].y}`;
	for (let i = 1; i < points.length; i++) {
		pathData += ` L ${points[i].x} ${points[i].y}`;
	}

	return pathData;
};
