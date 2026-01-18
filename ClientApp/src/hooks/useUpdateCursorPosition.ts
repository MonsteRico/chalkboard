import { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import { localUserAtom } from "@/lib/usersAtoms";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import type { useMousePosition } from "./useMousePosition";

/**
 * Hook that sends cursor position updates to the server at 30fps
 * Uses requestAnimationFrame throttled to ~33ms intervals (30fps)
 */
export function useUpdateCursorPosition(
	getMousePosition: ReturnType<typeof useMousePosition>["getMousePosition"]
) {
	const { sendUpdate } = useWebSocketContext();
	const localUser = useAtomValue(localUserAtom);
	const lastSentRef = useRef<{ x: number; y: number } | null>(null);
	const rafIdRef = useRef<number | null>(null);
	const lastUpdateTimeRef = useRef<number>(0);
	const TARGET_FPS = 30;
	const FRAME_INTERVAL_MS = 1000 / TARGET_FPS; // ~33.33ms

	useEffect(() => {
		// Only send updates if we have a user ID and are connected
		if (!localUser.id || localUser.id.trim() === "") {
			return;
		}

		let isActive = true;
		
		// Initialize timestamp to allow first update immediately
		lastUpdateTimeRef.current = performance.now();

		const sendCursorUpdate = (timestamp: number) => {
			if (!isActive) return;

			const elapsed = timestamp - lastUpdateTimeRef.current;

			// Only send update if enough time has passed (throttle to 30fps)
			if (elapsed >= FRAME_INTERVAL_MS) {
				const currentPosition = getMousePosition();
				
				// Only send if position has changed (or first update)
				if (
					!lastSentRef.current ||
					lastSentRef.current.x !== currentPosition.x ||
					lastSentRef.current.y !== currentPosition.y
				) {
					sendUpdate({
						type: "UPDATE_CURSOR_POSITION",
						payload: {
							id: localUser.id,
							cursorPosition: currentPosition,
						},
					});

					lastSentRef.current = { ...currentPosition };
					lastUpdateTimeRef.current = timestamp;
				}
			}

			// Continue the animation loop
			rafIdRef.current = requestAnimationFrame(sendCursorUpdate);
		};

		// Start the animation loop
		rafIdRef.current = requestAnimationFrame(sendCursorUpdate);

		return () => {
			isActive = false;
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
		};
	}, [localUser.id, getMousePosition, sendUpdate]);
}
