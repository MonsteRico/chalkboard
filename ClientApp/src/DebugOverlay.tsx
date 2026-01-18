import { useAtom, useAtomValue } from "jotai";
import { darkModeAtom, toolAtom } from "./atoms";
import { localUserAtom, usersAtom } from "./lib/usersAtoms";

export const DebugOverlay = ({
	viewBox,
	mousePositionDisplay,
}: {
	viewBox: { x: number; y: number; w: number; h: number };
	mousePositionDisplay: { x: number; y: number };
}) => {
	const [darkMode, setDarkMode] = useAtom(darkModeAtom);
	const tool = useAtomValue(toolAtom);
	const localUser = useAtomValue(localUserAtom);
	const users = useAtomValue(usersAtom);
	return (
		<>
		<div className="absolute top-0 left-0 z-10 bg-black/50 p-2 text-white text-xs">
			<p>
				View Box: x:{viewBox.x.toFixed(0)} y:{viewBox.y.toFixed(0)} w:
				{viewBox.w.toFixed(0)} h:{viewBox.h.toFixed(0)}
			</p>
			<p>
				Mouse: x:{mousePositionDisplay.x.toFixed(0)} y:
				{mousePositionDisplay.y.toFixed(0)}
			</p>
			<input
				type="checkbox"
				checked={darkMode}
				onChange={() => setDarkMode(!darkMode)}
				className="h-4 w-4"
			/>
			<label htmlFor="darkMode">Dark Mode</label>
			<p>Tool: {tool}</p>
			<p>Local User: {localUser.displayName}</p>
			<p>Local User Cursor Color: {localUser.cursorColor}</p>
			<p>Local User ID: {localUser.id}</p>
			<p>Local User Current Room ID: {localUser.currentRoomId}</p>
			<p>Local User Current Tool: {localUser.currentTool}</p>
			<p>Local User Cursor Position: {localUser.cursorPosition.x.toFixed(0)}, {localUser.cursorPosition.y.toFixed(0)}</p>
		</div>
		<div className="absolute top-0 right-0 z-10 bg-black/50 p-2 text-white text-xs">
			<p>Debug View Users: {users.length}</p>
			{users.map((user) => (
				<p key={user.id}>{user.displayName} - {user.id} - {user.currentRoomId} - {user.currentTool} - {user.cursorColor}</p>
			))}
		</div>
		</>
	);
};
