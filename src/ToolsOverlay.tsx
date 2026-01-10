import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react';
import { Button } from "./components/ui/button";
import { ButtonGroup } from "./components/ui/button-group";
import { CursorIcon, Eraser, Eraser01Icon, Pen01Icon, Rectangle, } from "@hugeicons/core-free-icons";
import { toolAtom, type Tool } from './atoms';
import { useAtom } from 'jotai';

export const ToolsOverlay = () => {
	return (
        <ButtonGroup className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
            <ToolButton icon={CursorIcon} tool="cursor" />
            <ToolButton icon={Pen01Icon} tool="pen" />
            <ToolButton icon={Eraser} tool="eraser" />
            <ToolButton icon={Rectangle} tool="rectangle" />
        </ButtonGroup>
	);
};

const ToolButton = ({ icon, tool }: { icon: HugeiconsIconProps['icon'], tool: Tool }) => {
    const [currentTool, setTool] = useAtom(toolAtom);
	return (
		<Button className="size-12 hover:bg-primary/50 hover:cursor-pointer" onClick={() => setTool(tool)}>
			<HugeiconsIcon fill={currentTool === tool ? "currentColor" : "none"} icon={icon} className="p-0 size-6" />
		</Button>
	);
};