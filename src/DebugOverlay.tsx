import { useAtom, useAtomValue } from "jotai";
import { darkModeAtom, toolAtom } from "./atoms";

export const DebugOverlay = ({ viewBox, mousePositionDisplay }: { viewBox: { x: number, y: number, w: number, h: number }, mousePositionDisplay: { x: number, y: number } }) => {
	const [darkMode, setDarkMode] = useAtom(darkModeAtom);
    const tool = useAtomValue(toolAtom);
	return (
			<div className="absolute top-0 left-0 z-10 bg-black/50 p-2 text-white text-xs">
				<p>
					View Box: x:{viewBox.x.toFixed(0)} y:{viewBox.y.toFixed(0)} w:
					{viewBox.w.toFixed(0)} h:{viewBox.h.toFixed(0)}
				</p>
				<p>
					Mouse: x:{mousePositionDisplay.x.toFixed(0)} y:
					{mousePositionDisplay.y.toFixed(0)}
				</p>
                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="w-4 h-4" />
                <label htmlFor="darkMode">Dark Mode</label>
                <p>Tool: {tool}</p>
			</div>
	);
};