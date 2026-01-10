import type {
	CircleShape,
	DiamondShape,
	PathShape,
	Shape,
	SquareShape,
	TriangleShape,
} from "../atoms";
import { useAtomValue } from "jotai";
import { darkModeAtom } from "../atoms";

interface ShapeProps {
	shape: Shape;
	onMouseOver: () => void;
	onClick: () => void;
}

export const ShapeComponent = ({ shape, onMouseOver, onClick }: ShapeProps) => {
	const darkMode = useAtomValue(darkModeAtom);
	const strokeColor =
		shape.strokeColor === "default"
			? darkMode
				? "white"
				: "black"
			: shape.strokeColor;
	const fillColor =
		shape.fillColor === "default"
			? darkMode
				? "white"
				: "black"
			: shape.fillColor;
	switch (shape.type) {
		case "circle": {
			const circleShape = shape as CircleShape;
			return (
				<circle
					cx={circleShape.x}
					cy={circleShape.y}
					r={circleShape.radius}
					fill={fillColor}
					stroke={strokeColor}
					strokeWidth="2"
					onMouseOver={onMouseOver}
					onClick={onClick}
				/>
			);
		}
		case "square": {
			const squareShape = shape as SquareShape;
			return (
				<rect
					x={squareShape.x - squareShape.width / 2}
					y={squareShape.y - squareShape.height / 2}
					width={squareShape.width}
					height={squareShape.height}
					fill={fillColor}
					stroke={strokeColor}
					strokeWidth="2"
					onMouseOver={onMouseOver}
					onClick={onClick}
				/>
			);
		}
		case "triangle": {
			const triangleShape = shape as TriangleShape;
			const halfWidth = triangleShape.width / 2;
			const halfHeight = triangleShape.height / 2;
			const points = [
				`${triangleShape.x},${triangleShape.y - halfHeight}`, // top
				`${triangleShape.x - halfWidth},${triangleShape.y + halfHeight}`, // bottom left
				`${triangleShape.x + halfWidth},${triangleShape.y + halfHeight}`, // bottom right
			].join(" ");
			return (
				<polygon
					points={points}
					fill={fillColor}
					stroke={strokeColor}
					strokeWidth="2"
					onMouseOver={onMouseOver}
					onClick={onClick}
				/>
			);
		}
		case "diamond": {
			const diamondShape = shape as DiamondShape;
			const halfWidth = diamondShape.width / 2;
			const halfHeight = diamondShape.height / 2;
			const points = [
				`${diamondShape.x},${diamondShape.y - halfHeight}`, // top
				`${diamondShape.x + halfWidth},${diamondShape.y}`, // right
				`${diamondShape.x},${diamondShape.y + halfHeight}`, // bottom
				`${diamondShape.x - halfWidth},${diamondShape.y}`, // left
			].join(" ");
			return (
				<polygon
					points={points}
					fill={fillColor}
					stroke={strokeColor}
					strokeWidth="2"
					onMouseOver={onMouseOver}
					onClick={onClick}
				/>
			);
		}
		case "path": {
			const pathShape = shape as PathShape;
			return (
				<>
					{/* This is the transparent path that is used for erasing and selecting */}
					<path
						d={pathShape.d}
						fill="none"
						stroke="transparent"
						strokeWidth="20"
						strokeLinecap="round"
						strokeLinejoin="round"
						onMouseOver={onMouseOver}
						onClick={onClick}
					/>
					<path
						d={pathShape.d}
						fill="none"
						stroke={strokeColor}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						onMouseOver={onMouseOver}
						onClick={onClick}
					/>
				</>
			);
		}
		default: {
			return null;
		}
	}
};
