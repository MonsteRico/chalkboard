interface DrawingCanvasProps {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const DrawingCanvas = ({ canvasRef }: DrawingCanvasProps) => {
	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 pointer-events-none"
			style={{ mixBlendMode: "normal" }}
		/>
	);
};
