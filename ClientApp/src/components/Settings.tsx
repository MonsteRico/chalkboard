import { Close, Settings01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { darkModeAtom } from "@/atoms";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useDebounce } from "@/hooks/useDebounce";
import { localUserAtom } from "@/lib/usersAtoms";

const DEBOUNCE_DELAY = 500; // 500ms debounce delay

export function Settings() {
	const [localUser, setLocalUser] = useAtom(localUserAtom);
	const darkMode = useAtomValue(darkModeAtom);
	const { sendUpdate } = useWebSocketContext();
	// Debounced callbacks for WebSocket updates
	const handleDisplayNameUpdate = useCallback(
		(value: string) => {
			sendUpdate({ type: 'UPDATE_DISPLAY_NAME', payload: { id: localUser.id, displayName: value } });
		},
		[sendUpdate, localUser.id],
	);

	const handleCursorColorUpdate = useCallback(
		(value: string) => {
			sendUpdate({ type: 'UPDATE_CURSOR_COLOR', payload: { id: localUser.id, cursorColor: value } });
		},
		[sendUpdate, localUser.id],
	);

	// Use debounce hook for both values
	useDebounce(handleDisplayNameUpdate, localUser.displayName, DEBOUNCE_DELAY);
	useDebounce(handleCursorColorUpdate, localUser.cursorColor, DEBOUNCE_DELAY);


	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-4 right-4 z-10"
				>
					<HugeiconsIcon
						icon={Settings01Icon}
						className="size-5 text-primary"
					/>
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className={`w-[400px] sm:w-[540px] bg-card ${darkMode ? "dark" : ""}`}>
				<SheetClose asChild>
					<Button variant="ghost" size="icon" className="absolute right-4 top-4">
						<HugeiconsIcon icon={Close} className="size-4 text-primary" />
					</Button>
				</SheetClose>
				<SheetHeader>
					<SheetTitle className="text-primary">Settings</SheetTitle>
					<SheetDescription className="text-muted-foreground">
						Manage your preferences and board settings.
					</SheetDescription>
				</SheetHeader>
				<div className="mt-6 space-y-6">
					{/* User Settings Section */}
					<div className="space-y-4">
						<div>
							<h3 className="text-base font-semibold text-primary">User Settings</h3>
							<p className="text-sm text-muted-foreground">
								Customize your display name and cursor appearance.
							</p>
						</div>
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="display-name" className="text-primary">Display Name</Label>
								<Input
									id="display-name"
									type="text"
									value={localUser.displayName}
									onChange={(e) => setLocalUser({ ...localUser, displayName: e.target.value })}
									placeholder="Enter your display name"
									className="bg-input text-accent-foreground"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="cursor-color" className="text-primary">Cursor Color</Label>
								<div className="flex items-center gap-3">
									<Input
										id="cursor-color"
										type="color"
										value={localUser.cursorColor}
										onChange={(e) => setLocalUser({ ...localUser, cursorColor: e.target.value })}
										className="h-10 w-20 cursor-pointer bg-input text-accent-foreground"
									/>
									<Input
										type="text"
										value={localUser.cursorColor}
										onChange={(e) => {
											const value = e.target.value;
											setLocalUser({ ...localUser, cursorColor: value });
										}}
										placeholder="#3b82f6"
										className="flex-1 bg-input text-accent-foreground"
									/>
								</div>
							</div>
						</div>
					</div>

					<Separator />

					{/* Board Settings Section */}
					<div className="space-y-4">
						<div>
							<h3 className="text-base font-semibold text-primary">Board Settings</h3>
							<p className="text-sm text-muted-foreground">
								Configure board-wide preferences.
							</p>
						</div>
						{/* Empty for now */}
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
