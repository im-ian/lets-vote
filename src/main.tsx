import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SocketProvider } from "./components/providers/socket-provider.tsx";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import App from "./RoomList.tsx";

import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SocketProvider>
			<ThemeProvider defaultTheme="dark" storageKey="ui-theme">
				<App />
				<Toaster />
			</ThemeProvider>
		</SocketProvider>
	</StrictMode>,
);
