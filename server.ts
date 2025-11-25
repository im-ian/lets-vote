import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import type { Room } from "./src/types/room";

const app = express();
app.use(cors());

const nicknames: Record<string, string> = {};
const rooms: Room[] = [];

const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173", // Vite default port
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("User connected:", socket.id);

	const interval = setInterval(() => {
		socket.emit("ping");
	}, 3000);

	nicknames[socket.id] = "익명";

	socket.on("set-nickname", (nickname) => {
		nicknames[socket.id] = nickname;
		console.log(`${socket.id} has change nickname to ${nickname}`);
		io.emit("nickname", nicknames);
	});

	socket.on("get-room-list", () => {
		socket.emit("room-list", rooms);
	});

	socket.on("create-room", (roomName, roomPassword) => {
		const uuid = uuidv4();
		rooms.push({
			id: uuid,
			name: roomName,
			password: roomPassword,
			admin: socket.id,
			users: [],
		});
		console.log(`${socket.id} has created room ${roomName}`);
		io.emit("room-list", rooms);
	});

	// socket.on("pong", () => {
	// 	console.log("Received pong from:", socket.id);
	// });

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
		delete nicknames[socket.id];
		clearInterval(interval);
	});
});

const PORT = 3001;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
