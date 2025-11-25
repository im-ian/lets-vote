import { useParams } from "@tanstack/react-router";
import { CheckIcon, CogIcon, UsersIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";
import Container from "./components/containter";
import { useTimer } from "./components/hooks/useTimer";
import VoteWinnerModal from "./components/modals/VoteWinnerModal";
import { useSocket } from "./components/providers/SocketProvider";
import RoomRuleSheet from "./components/sheets/RoomRuleSheet";
import RoomUserListSheet from "./components/sheets/RoomUserListSheet";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import serde from "./lib/serde";
import { SocketEvent } from "./lib/socket";
import { cn } from "./lib/utils";
import type {
  Room,
  RoomRules,
  SerializeRoom,
  SerializeVote,
} from "./types/room";
import type { User } from "./types/user";

function RoomPage() {
  const { roomId } = useParams({ from: "/room/$roomId" });
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedOption, setSelectedOption] = useState<string[]>([]);

  const {
    seconds: remainingTime,
    start: timerStart,
    reset: timerReset,
  } = useTimer(room?.rules.limitTime || 15);

  const [isUserListSheetOpen, setIsUserListSheetOpen] = useState(false);
  const [isRoomRuleSheetOpen, setIsRoomRuleSheetOpen] = useState(false);
  const [isVoteWinnerModalOpen, setIsVoteWinnerModalOpen] = useState(false);

  function handleSetRoomRules(rules: RoomRules) {
    if (!socket || !isConnected) return;
    setRoom((prevRoom) => {
      if (!prevRoom) return null;
      return { ...prevRoom, rules };
    });
    socket.emit(SocketEvent.SET_ROOM_RULES, roomId, rules);
  }

  function handleClickSelection(option: string) {
    if (!socket || !isConnected) return;

    let newSelectedOptions: string[] = [];

    if (room?.rules.multiple) {
      if (selectedOption.includes(option)) {
        newSelectedOptions = selectedOption.filter((item) => item !== option);
      } else {
        newSelectedOptions = [...selectedOption, option];
      }
    } else {
      if (selectedOption.includes(option)) {
        newSelectedOptions = [];
      } else {
        newSelectedOptions = [option];
      }
    }

    setSelectedOption(newSelectedOptions);
    socket.emit(SocketEvent.VOTE, roomId, newSelectedOptions);
  }

  function handleClickVoteStart() {
    if (!socket || !isConnected) return;
    socket.emit(SocketEvent.VOTE_START, roomId);
  }

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit(SocketEvent.JOIN_ROOM, roomId);
    socket.emit(SocketEvent.GET_ROOM_INFO, roomId);

    function handleJoinRoom(user: User) {
      toast(`${user.nickname}님이 입장하셨습니다.`);
    }

    function handleGetRoomInfo({
      room,
      users,
    }: {
      room: SerializeRoom;
      users: User[];
    }) {
      setRoom(serde.deserializeRoom(room));
      setUsers(users);
    }

    function handleVote(vote: SerializeVote) {
      setRoom((prev) => {
        if (!prev) return null;
        return { ...prev, vote: serde.deserializeVote(vote) };
      });
    }

    function handleSetRoomRules(rules: RoomRules) {
      setRoom((prev) => {
        if (!prev) return null;
        return { ...prev, rules };
      });
    }

    function handleVoteStart() {
      timerReset();
      timerStart();
    }

    socket.on(SocketEvent.JOIN_ROOM, handleJoinRoom);
    socket.on(SocketEvent.GET_ROOM_INFO, handleGetRoomInfo);
    socket.on(SocketEvent.VOTE, handleVote);
    socket.on(SocketEvent.SET_ROOM_RULES, handleSetRoomRules);
    socket.on(SocketEvent.VOTE_START, handleVoteStart);

    return () => {
      socket.off(SocketEvent.JOIN_ROOM, handleJoinRoom);
      socket.off(SocketEvent.GET_ROOM_INFO, handleGetRoomInfo);
      socket.off(SocketEvent.VOTE, handleVote);
      socket.off(SocketEvent.SET_ROOM_RULES, handleSetRoomRules);
      socket.off(SocketEvent.VOTE_START, handleVoteStart);
    };
  }, [socket, isConnected, roomId]);

  useEffect(() => {
    if (remainingTime === 0) {
      setIsVoteWinnerModalOpen(true);
    }
  }, [remainingTime]);

  const isAdmin = socket?.id && socket.id === room?.creator.id;
  const isDuringVote = remainingTime > 0;

  return (
    <>
      <Container>
        {isVoteWinnerModalOpen && <Confetti />}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-xl font-bold">{room?.name}</div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button size="icon" onClick={() => setIsRoomRuleSheetOpen(true)}>
                <CogIcon />
              </Button>
            )}
            <Button size="icon" onClick={() => setIsUserListSheetOpen(true)}>
              <UsersIcon />
            </Button>
            <Button
              className={cn(isConnected ? "bg-yellow-500" : "bg-white-500")}
              size="icon"
            >
              <ZapIcon />
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Progress
              value={(remainingTime / (room?.rules.limitTime || 15)) * 100}
            />
            <div className="flex-shrink-0 text-center text-sm font-bold">
              {remainingTime}초
            </div>
          </div>

          {room?.rules.voteType === "user" ? (
            <div className="flex flex-col gap-2 mt-4">
              {users.map((user) => {
                const isSelected = selectedOption.includes(user.nickname);

                return (
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={!isDuringVote}
                    className="w-full flex items-center justify-between"
                    key={user.id}
                    onClick={() => handleClickSelection(user.nickname)}
                  >
                    <div>{user.nickname}</div>
                    <CheckIcon
                      className={cn(isSelected ? "visible" : "invisible")}
                    />
                  </Button>
                );
              })}

              {isAdmin && (
                <Button
                  className="mt-4"
                  onClick={handleClickVoteStart}
                  disabled={isDuringVote}
                >
                  투표 시작
                </Button>
              )}
            </div>
          ) : (
            <div>커스텀</div>
          )}
        </div>
      </Container>

      {isAdmin && (
        <RoomRuleSheet
          rules={room?.rules}
          open={isRoomRuleSheetOpen}
          onOpenChange={setIsRoomRuleSheetOpen}
          onChangeRules={handleSetRoomRules}
        />
      )}

      <RoomUserListSheet
        users={users}
        open={isUserListSheetOpen}
        onOpenChange={setIsUserListSheetOpen}
      />

      <VoteWinnerModal
        rules={room?.rules}
        users={users}
        vote={room?.vote}
        open={isVoteWinnerModalOpen}
        onOpenChange={setIsVoteWinnerModalOpen}
      />
    </>
  );
}

export default RoomPage;
