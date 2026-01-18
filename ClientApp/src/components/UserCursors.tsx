import { useAtomValue } from "jotai";
import { usersAtom, localUserAtom } from "@/lib/usersAtoms";

/**
 * Component that renders other users' cursors on the whiteboard
 * Shows a colored circle at their cursor position with their display name above it
 */
export function UserCursors() {
	const users = useAtomValue(usersAtom);
	const localUser = useAtomValue(localUserAtom);

	// Filter out the local user - we don't need to show our own cursor
	const otherUsers = users.filter((user) => user.id !== localUser.id);

	if (otherUsers.length === 0) {
		return null;
	}

	return (
		<g className="user-cursors">
			{otherUsers.map((user) => {
				// Don't render if cursor position is at origin (likely not initialized)
				if (user.cursorPosition.x === 0 && user.cursorPosition.y === 0) {
					return null;
				}

				return (
					<g key={user.id} className="user-cursor">
						{/* Display name text above the cursor */}
						<text
							x={user.cursorPosition.x}
							y={user.cursorPosition.y - 12}
							fill={user.cursorColor}
							fontSize="12"
							fontWeight="500"
							textAnchor="middle"
							className="pointer-events-none select-none"
							style={{
								textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
								fill: user.cursorColor,
							}}
						>
							{user.displayName}
						</text>
						{/* Cursor circle */}
						<circle
							cx={user.cursorPosition.x}
							cy={user.cursorPosition.y}
							r="6"
							fill={user.cursorColor}
							stroke="white"
							strokeWidth="1.5"
							className="pointer-events-none"
							style={{
								filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))",
							}}
						/>
					</g>
				);
			})}
		</g>
	);
}
