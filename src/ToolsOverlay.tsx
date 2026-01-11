import {
	CursorIcon,
	Eraser,
	Pen01Icon,
	Rectangle,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import { useAtom } from "jotai";
import { type Tool, toolAtom } from "./atoms";
import { Button } from "./components/ui/button";
import { ButtonGroup } from "./components/ui/button-group";

export const ToolsOverlay = () => {
	return (
		<ButtonGroup className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
			<ToolButton icon={CursorIcon} tool="cursor" />
			<ToolButton icon={Pen01Icon} tool="pen" />
			<ToolButton icon={Eraser} tool="eraser" />
			<ToolButton icon={Rectangle} tool="rectangle" />
		</ButtonGroup>
	);
};

const ToolButton = ({
	icon,
	tool,
}: {
	icon: HugeiconsIconProps["icon"];
	tool: Tool;
}) => {
	const [currentTool, setTool] = useAtom(toolAtom);
	return (
		<Button
			className="size-12 hover:cursor-pointer hover:bg-primary/50"
			onClick={() => setTool(tool)}
		>
			<HugeiconsIcon
				fill={currentTool === tool ? "currentColor" : "none"}
				icon={icon}
				className="size-6 p-0"
			/>
		</Button>
	);
};
