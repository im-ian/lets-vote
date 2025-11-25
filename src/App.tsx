import {
	createRootRoute,
	createRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";

import RoomList from "./RoomList.tsx";

const rootRoute = createRootRoute();
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => <RoomList />,
});
const routeTree = rootRoute.addChildren([indexRoute]);
const router = createRouter({ routeTree });

export default function App() {
	return <RouterProvider router={router} />;
}
