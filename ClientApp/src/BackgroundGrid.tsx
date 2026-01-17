export const BackgroundGrid = () => {
	return (
		<>
			<defs>
				<pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
					<path
						d="M 50 0 L 0 0 0 50"
						fill="none"
						stroke="gray"
						strokeWidth="0.5"
					/>
				</pattern>
			</defs>

			{/* Large rect covering infinite canvas area - viewBox will show only visible portion */}
			<rect
				x="-10000"
				y="-10000"
				width="20000"
				height="20000"
				fill="url(#grid)"
			/>
		</>
	);
};
