import type { Shape } from "../atoms";
import { BackgroundGrid } from "../BackgroundGrid";
import { ShapeComponent } from "./Shape";
import { UserCursors } from "./UserCursors";

interface WhiteboardProps {
	viewBoxString: string;
	shapes: Shape[];
	svgRef: React.RefObject<SVGSVGElement | null>;
	onMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
	onMouseUp: () => void;
	onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
	onMouseLeave: () => void;
	onWheel: (e: React.WheelEvent<SVGSVGElement>) => void;
	onShapeMouseOver: (shape: Shape) => void;
	onShapeClick: (shape: Shape) => void;
	cursor: string;
}

export const Whiteboard = ({
	viewBoxString,
	shapes,
	svgRef,
	onMouseDown,
	onMouseUp,
	onMouseMove,
	onMouseLeave,
	onShapeMouseOver,
	onShapeClick,
	onWheel,
	cursor,
}: WhiteboardProps) => {
	return (
		<svg
			ref={svgRef}
			width="100%"
			height="100%"
			viewBox={viewBoxString}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
			style={{ cursor }}
			onWheel={onWheel}
			className="absolute inset-0"
		>
			<BackgroundGrid />
			{/* Render shapes */}
			{shapes.map((shape) => (
				<ShapeComponent
					key={shape.id}
					shape={shape}
					onMouseOver={() => onShapeMouseOver(shape)}
					onClick={() => onShapeClick(shape)}
				/>
			))}
			{/* Render other users' cursors */}
			<UserCursors />
		</svg>
	);
};
