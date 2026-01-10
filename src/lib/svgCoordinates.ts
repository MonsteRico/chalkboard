import type { ViewBox } from "../hooks/useViewBox";

export interface Point {
	x: number;
	y: number;
}

export const createSvgPointConverter = (
	svgRef: React.RefObject<SVGSVGElement | null>,
	svgPointRef: React.RefObject<SVGPoint | null>,
) => {
	return (clientX: number, clientY: number): Point | null => {
		if (!svgRef.current || !svgPointRef.current) return null;

		svgPointRef.current.x = clientX;
		svgPointRef.current.y = clientY;
		const loc = svgPointRef.current.matrixTransform(
			svgRef.current.getScreenCTM()?.inverse(),
		);

		if (!loc) return null;

		return { x: loc.x, y: loc.y };
	};
};

export const setupSvgPoint = (
	svgRef: React.RefObject<SVGSVGElement | null>,
	svgPointRef: React.RefObject<SVGPoint | null>,
) => {
	if (svgRef.current && !svgPointRef.current) {
		svgPointRef.current = svgRef.current.createSVGPoint();
	}
};
