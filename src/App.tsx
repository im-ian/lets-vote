import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

import RoomList from "./RoomList.tsx";

import RoomPage from "./RoomPage.tsx";

const rootRoute = createRootRoute();
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <RoomList />,
});

const roomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/room/$roomId",
  component: () => <RoomPage />,
});

const routeTree = rootRoute.addChildren([indexRoute, roomRoute]);
const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
