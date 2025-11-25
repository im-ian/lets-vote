import { PlusIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "./components/containter";
import NicknameSetModal from "./components/modals/NicknameSetModal";
import { RoomCreateModal } from "./components/modals/RoomCreateModal";
import { useSocket } from "./components/providers/socket-provider";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle } from "./components/ui/card";
import { cn } from "./lib/utils";
import type { Room } from "./types/room";

function RoomList() {
	const { socket, isConnected } = useSocket();

	const [nickname, setNickname] = useState("익명");
	const [rooms, setRooms] = useState<Room[]>();

	const [isRoomCreateModalOpen, setIsRoomCreateModalOpen] = useState(false);
	const [isNicknameSetModalOpen, setIsNicknameSetModalOpen] = useState(false);

	useEffect(() => {
		socket?.emit("get-room-list");

		const nickname = sessionStorage.getItem("nickname");
		if (nickname) {
			setNickname(nickname);
			socket?.emit("set-nickname", nickname);
		}

		function handleGetRoomList(rooms: Room[]) {
			setRooms(rooms);
		}

		socket?.on("room-list", handleGetRoomList);
		socket?.on("room-created", handleGetRoomList);

		return () => {
			socket?.off("room-list", handleGetRoomList);
			socket?.off("room-created", handleGetRoomList);
		};
	}, [socket]);

	return (
		<>
			<Container>
				<div className="flex items-end justify-between gap-2">
					<Button
						variant="ghost"
						className="flex items-center gap-2 px-0"
						onClick={() => setIsNicknameSetModalOpen(true)}
					>
						<Avatar>
							<AvatarFallback>{nickname[0]}</AvatarFallback>
						</Avatar>
						{nickname}
					</Button>
					<div className="flex items-center gap-2">
						<Button onClick={() => setIsRoomCreateModalOpen(true)}>
							<PlusIcon />방 만들기
						</Button>
						<Button
							className={cn(isConnected ? "bg-yellow-500" : "bg-white-500")}
							size="icon"
						>
							<ZapIcon />
						</Button>
					</div>
				</div>

				<div className="mt-4 space-y-3">
					{rooms?.map((room) => (
						<Card key={room.id}>
							<CardHeader>
								<CardTitle>{room.name}</CardTitle>
							</CardHeader>
						</Card>
					))}
				</div>
			</Container>

			<NicknameSetModal
				open={isNicknameSetModalOpen}
				onOpenChange={setIsNicknameSetModalOpen}
				onChangeNickname={setNickname}
			/>

			<RoomCreateModal
				open={isRoomCreateModalOpen}
				onOpenChange={setIsRoomCreateModalOpen}
			/>
		</>
	);
}

export default RoomList;
