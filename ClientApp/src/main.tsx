import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { WebSocketProvider } from "./contexts/WebSocketContext.tsx";

// biome-ignore lint/style/noNonNullAssertion: vite
createRoot(document.getElementById("root")!).render(
	<WebSocketProvider>
		<App />
	</WebSocketProvider>

);
