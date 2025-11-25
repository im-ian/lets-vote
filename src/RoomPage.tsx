import { useNavigate, useParams } from "@tanstack/react-router";
import { CheckIcon, CogIcon, HomeIcon, UsersIcon, ZapIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";
import Container from "./components/container";
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
  const navigate = useNavigate();
  const { roomId } = useParams({ from: "/room/$roomId" });
  const { socket, isConnected } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const [isUserListSheetOpen, setIsUserListSheetOpen] = useState(false);
  const [isRoomRuleSheetOpen, setIsRoomRuleSheetOpen] = useState(false);
  const [isVoteOptionAddModalOpen, setIsVoteOptionAddModalOpen] =
    useState(false);
  const [isVoteWinnerModalOpen, setIsVoteWinnerModalOpen] = useState(false);

  const voteOptions = useMemo(() => {
    if (!room) return [];

    switch (room.rules.voteType) {
      case "user":
        return users.map((u) => u.nickname);
      case "custom":
        return Object.keys(room.vote || {});
      default:
        return [];
    }
  }, [room, users]);

  const {
    isRunning: isTimerRunning,
    seconds: remainingTime,
    start: timerStart,
    reset: timerReset,
  } = useTimer(room?.rules.limitTime || 15, () => {
    setIsVoteWinnerModalOpen(true);
  });

  const isAdmin = socket?.id && socket.id === room?.creator.id;

  function handleSetRoomRules(rules: RoomRules) {
    if (!socket || !isConnected) return;

    setRoom((prev) => {
      if (!prev) return prev;

      const shouldResetVote = prev.rules.voteType !== rules.voteType;

      if (shouldResetVote) {
        timerReset();
      }

      return {
        ...prev,
        rules,
        vote: shouldResetVote ? {} : prev.vote,
        voteStartedAt: shouldResetVote ? null : prev.voteStartedAt,
      };
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

    function handleJoinRoom({
      user,
      users: allUsers,
    }: {
      user: User;
      users: User[];
    }) {
      toast(`${user.nickname}님이 입장하셨습니다.`);
      setUsers(allUsers);
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

      // 투표가 진행 중이면 타이머 동기화
      if (deserializedRoom.voteStartedAt) {
        const elapsed = Math.floor(
          (Date.now() - deserializedRoom.voteStartedAt.getTime()) / 1000
        );
        const remaining = Math.max(
          0,
          deserializedRoom.rules.limitTime - elapsed
        );

        if (remaining > 0) {
          timerStart(remaining);
        } else {
          // 이미 시간이 다 지났으면 타이머를 0으로 설정
          timerReset();
        }
      }
    }

    function handleVote(vote: SerializeVote, options: string[]) {
      setRoom((prev) => {
        if (!prev) return prev;

        const updatedRoom = { ...prev, vote: serde.deserializeVote(vote) };

        if (prev.rules.notifyWhenVoteChanged && options.length > 0) {
          toast(`누군가 ${options.join(", ")}에 투표했습니다.`);
        }

        return updatedRoom;
      });
    }

    function handleSetRoomRulesFromServer(rules: RoomRules) {
      setRoom((prev) => {
        if (!prev) return prev;

        // voteType이 변경되면 vote 및 타이머 초기화
        const shouldResetVote = prev.rules.voteType !== rules.voteType;

        if (shouldResetVote) {
          timerReset();
        }

        return {
          ...prev,
          rules,
          vote: shouldResetVote ? {} : prev.vote,
          voteStartedAt: shouldResetVote ? null : prev.voteStartedAt,
        };
      });
    }

    function handleVoteStart() {
      toast("투표가 시작되었습니다.");
      setIsVoteWinnerModalOpen(false);
      setIsVoteOptionAddModalOpen(false);
      setSelectedOption([]);
      timerReset();
      timerStart();
    }

    function handleVoteAddOption(option: string) {
      // custom 타입일 때 room.vote에 새 옵션 추가
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          vote: {
            ...prev.vote,
            [option]: new Set(),
          },
        };
      });
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

  return (
    <>
      <Container>
        {isVoteWinnerModalOpen && <Confetti />}
        <div className="flex items-end justify-between gap-2 w-full max-w-full">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate({ to: "/" })}
            >
              <HomeIcon />
            </Button>
            {room && (
              <div className="flex-1 min-w-0">
                <div className="text-xl font-bold truncate">{room.name}</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <Button size="icon" onClick={() => setIsRoomRuleSheetOpen(true)}>
                <CogIcon />
              </Button>
            )}
            <Button size="icon" onClick={() => setIsUserListSheetOpen(true)}>
              <UsersIcon />
            </Button>
            <Button variant={"outline"} size="icon">
              <ZapIcon
                fill={isConnected ? "currentColor" : "none"}
                className={cn(
                  isConnected ? "text-yellow-500" : "text-gray-500"
                )}
              />
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
