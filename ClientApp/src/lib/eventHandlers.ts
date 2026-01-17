import type { Tool } from "../atoms";

export const MIDDLE_CLICK = (e: React.MouseEvent) => e && e.buttons === 4;

export const getCursor = (isPanning: boolean, tool: Tool): string => {
	if (isPanning) return "grabbing";
	if (tool === "pen") return "crosshair";
	return "default";
};
