import { useParams } from "@tanstack/react-router";
import { CheckIcon, CogIcon, UsersIcon, ZapIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";
import Container from "./components/containter";
import { useTimer } from "./components/hooks/useTimer";
import VoteOptionAddModal from "./components/modals/VoteOptionAddModal";
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
  const [voteOptions, setVoteOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string[]>([]);

  const previousRules = useRef<RoomRules | null>(null);

  const {
    isRunning: isTimerRunning,
    seconds: remainingTime,
    start: timerStart,
    reset: timerReset,
  } = useTimer(room?.rules.limitTime || 15);

  const [isUserListSheetOpen, setIsUserListSheetOpen] = useState(false);
  const [isRoomRuleSheetOpen, setIsRoomRuleSheetOpen] = useState(false);
  const [isVoteOptionAddModalOpen, setIsVoteOptionAddModalOpen] =
    useState(false);
  const [isVoteWinnerModalOpen, setIsVoteWinnerModalOpen] = useState(false);

  const isAdmin = socket?.id && socket.id === room?.creator.id;

  function updateRoomRules(rules: RoomRules, currentUsers: User[]) {
    setRoom((prev) => (prev ? { ...prev, rules } : prev));

    if (previousRules.current?.voteType !== rules.voteType) {
      if (rules.voteType === "user") {
        setVoteOptions(currentUsers.map((u) => u.nickname));
      } else {
        setVoteOptions([]);
      }
    }

    previousRules.current = rules;
  }

  function handleSetRoomRules(rules: RoomRules) {
    if (!socket || !isConnected) return;
    updateRoomRules(rules, users);
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
      newSelectedOptions = selectedOption.includes(option) ? [] : [option];
    }

    setSelectedOption(newSelectedOptions);
    socket.emit(SocketEvent.VOTE, roomId, newSelectedOptions);
  }

  function handleClickVoteStart() {
    if (!socket || !isConnected) return;
    socket.emit(SocketEvent.VOTE_START, roomId, voteOptions);
  }

  function handleVoteAddOption(option: string) {
    if (!socket || !isConnected) return;
    socket.emit(SocketEvent.VOTE_ADD_OPTION, roomId, option);
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
      const deserializedRoom = serde.deserializeRoom(room);
      setRoom(deserializedRoom);
      setUsers(users);
      updateRoomRules(deserializedRoom.rules, users); // 최초 접속 시 users 전달
    }

    function handleVote(vote: SerializeVote) {
      setRoom((prev) =>
        prev ? { ...prev, vote: serde.deserializeVote(vote) } : prev,
      );
    }

    function handleSetRoomRulesFromServer(rules: RoomRules) {
      updateRoomRules(rules, users); // 서버 룰 변경 시 현재 users 사용
    }

    function handleVoteStart() {
      setSelectedOption([]);
      timerReset();
      timerStart();
    }

    function handleVoteAddOption(option: string) {
      setVoteOptions((prev) => [...prev, option]);
    }

    socket.on(SocketEvent.JOIN_ROOM, handleJoinRoom);
    socket.on(SocketEvent.GET_ROOM_INFO, handleGetRoomInfo);
    socket.on(SocketEvent.VOTE, handleVote);
    socket.on(SocketEvent.SET_ROOM_RULES, handleSetRoomRulesFromServer);
    socket.on(SocketEvent.VOTE_START, handleVoteStart);
    socket.on(SocketEvent.VOTE_ADD_OPTION, handleVoteAddOption);

    return () => {
      socket.off(SocketEvent.JOIN_ROOM, handleJoinRoom);
      socket.off(SocketEvent.GET_ROOM_INFO, handleGetRoomInfo);
      socket.off(SocketEvent.VOTE, handleVote);
      socket.off(SocketEvent.SET_ROOM_RULES, handleSetRoomRulesFromServer);
      socket.off(SocketEvent.VOTE_START, handleVoteStart);
      socket.off(SocketEvent.VOTE_ADD_OPTION, handleVoteAddOption);
    };
  }, [socket, isConnected, roomId]);

  useEffect(() => {
    if (remainingTime === 0) {
      setIsVoteWinnerModalOpen(true);
    }
  }, [remainingTime]);

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

          <div className="flex flex-col gap-2 mt-4">
            {voteOptions.map((option) => {
              const isSelected = selectedOption.includes(option);
              return (
                <Button
                  variant="outline"
                  size="lg"
                  disabled={!isTimerRunning}
                  className="w-full flex items-center justify-between"
                  key={option}
                  onClick={() => handleClickSelection(option)}
                >
                  <div>{option}</div>
                  <CheckIcon
                    className={cn(isSelected ? "visible" : "invisible")}
                  />
                </Button>
              );
            })}

            {room?.rules.voteType === "custom" && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setIsVoteOptionAddModalOpen(true)}
              >
                옵션 추가
              </Button>
            )}

            {isAdmin && (
              <Button
                className="mt-4"
                onClick={handleClickVoteStart}
                disabled={isTimerRunning}
              >
                투표 시작
              </Button>
            )}
          </div>
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

      <VoteOptionAddModal
        options={voteOptions}
        open={isVoteOptionAddModalOpen}
        onOpenChange={setIsVoteOptionAddModalOpen}
        onAddOption={handleVoteAddOption}
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
