import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { PlusIcon, UsersIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Container from "./components/containter";
import NicknameSetModal from "./components/modals/NicknameSetModal";
import { RoomCreateModal } from "./components/modals/RoomCreateModal";
import RoomJoinModal from "./components/modals/RoomJoinModal";
import { useSocket } from "./components/providers/SocketProvider";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { cn } from "./lib/utils";
import type { Room } from "./types/room";

function RoomList() {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [nickname, setNickname] = useState("익명");
  const [rooms, setRooms] = useState<Room[]>();
  const [selectRoomId, setSelectRoomId] = useState<string | null>(null);

  const [isNicknameSetModalOpen, setIsNicknameSetModalOpen] = useState(false);
  const [isRoomJoinModalOpen, setIsRoomJoinModalOpen] = useState(false);
  const [isRoomCreateModalOpen, setIsRoomCreateModalOpen] = useState(false);

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

    function handleRoomJoined(roomId: string) {
      navigate({
        to: `/room/${roomId}`,
      });
    }

    function handleRoomJoinError(errorType: string) {
      if (errorType === "room-not-found") {
        toast.error("방을 찾을 수 없습니다.");
      } else if (errorType === "room-password-wrong") {
        toast.error("방의 비밀번호가 일치하지 않습니다.");
      } else {
        toast.error("방 참여에 실패했습니다.");
      }
    }

    socket?.on("room-list", handleGetRoomList);
    socket?.on("room-joined", handleRoomJoined);
    socket?.on("room-join-error", handleRoomJoinError);

    return () => {
      socket?.off("room-list", handleGetRoomList);
      socket?.off("room-joined", handleRoomJoined);
      socket?.off("room-join-error", handleRoomJoinError);
    };
  }, [socket, navigate]);

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
            <Card
              key={room.id}
              onClick={() => {
                setSelectRoomId(room.id);
                setIsRoomJoinModalOpen(true);
              }}
            >
              <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>
                  {room.creator.nickname}님이 생성
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <CardDescription className="w-full">
                  <div className="w-full flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <UsersIcon size={16} />
                      {room.users.length}명
                    </div>
                    <div>
                      {dayjs(room.createdAt).format("YYYY-MM-DD HH:mm")}
                    </div>
                  </div>
                </CardDescription>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>

      <NicknameSetModal
        open={isNicknameSetModalOpen}
        onOpenChange={setIsNicknameSetModalOpen}
        onChangeNickname={setNickname}
      />

      <RoomJoinModal
        roomId={selectRoomId}
        open={isRoomJoinModalOpen}
        onOpenChange={setIsRoomJoinModalOpen}
      />

      <RoomCreateModal
        open={isRoomCreateModalOpen}
        onOpenChange={setIsRoomCreateModalOpen}
      />
    </>
  );
}

export default RoomList;
