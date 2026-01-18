import { useEffect, useRef } from "react";

/**
 * A hook that debounces a callback function.
 * The callback will be called after the specified delay when the value changes.
 * 
 * @param callback - The callback function to debounce
 * @param value - The value to watch for changes
 * @param delay - The debounce delay in milliseconds (default: 500)
 */
export function useDebounce<T>(
	callback: (value: T) => void,
	value: T,
	delay: number = 500,
) {
	const timeoutRef = useRef<number | null>(null);
	const callbackRef = useRef(callback);

	// Keep callback ref up to date
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		// Clear existing timeout
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
		}

		// Set new timeout
		timeoutRef.current = setTimeout(() => {
			callbackRef.current(value);
		}, delay);

		// Cleanup on unmount or when value/delay changes
		return () => {
			if (timeoutRef.current !== null) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [value, delay]);
}
