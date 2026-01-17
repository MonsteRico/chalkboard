interface DrawingCanvasProps {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const DrawingCanvas = ({ canvasRef }: DrawingCanvasProps) => {
	return (
		<canvas
			ref={canvasRef}
			className="pointer-events-none absolute inset-0"
			style={{ mixBlendMode: "normal" }}
		/>
	);
};
