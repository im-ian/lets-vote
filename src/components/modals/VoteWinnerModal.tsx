import { DialogTitle } from "@radix-ui/react-dialog";
import { TrophyIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type { RoomRules, Vote } from "@/types/room";
import type { User } from "@/types/user";

interface VoteWinnerModalProps {
  rules?: RoomRules;
  users: User[];
  vote?: Vote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoteWinnerModal({
  users,
  vote,
  open,
  onOpenChange,
  rules,
}: VoteWinnerModalProps) {
  // 안전하게 기본값 설정
  const safeVote: Vote = vote ?? {};

  // 옵션별 투표수 배열 ([option, Set])를 표 수 기준 내림차순 정렬
  const rank = Object.entries(safeVote).sort((a, b) => b[1].size - a[1].size);

  // 총 표 수
  const totalVotes = rank.reduce((acc, [, s]) => acc + s.size, 0);

  // 최다 득표 수 (표가 없으면 0)
  const maxVotes = rank.length > 0 ? rank[0][1].size : 0;

  // 공동 1등 목록
  const winners = rank.filter(([, s]) => s.size === maxVotes && maxVotes > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>투표 결과</DialogTitle>

        <div className="grid gap-4 mt-6 text-center">
          <TrophyIcon size={60} className="text-yellow-500 m-auto" />

          {/* 공동 1등 표시 */}
          {winners.length > 0 ? (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {winners.length > 1 ? "공동" : ""}1등
              </div>
              <div className="flex gap-2 justify-center items-baseline flex-wrap">
                {winners.map(([name, set]) => (
                  <div
                    key={name}
                    className="px-3 py-1 bg-yellow-100/80 dark:bg-yellow-900/40 rounded-full text-lg font-semibold"
                  >
                    {name}{" "}
                    <span className="text-sm font-normal">({set.size}표)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xl">표가 없습니다.</div>
          )}

          {/* 전체 현황: progress 바 (백분율) */}
          <div className="w-full max-w-xl mx-auto mt-4 text-left">
            <div className="text-sm text-muted-foreground mb-2">전체 현황</div>

            <ul className="space-y-5">
              {rank.map(([name, set]) => {
                const votes = set.size;
                // totalVotes가 0이면 0%로 처리
                const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                const percentRounded = Math.round(percent);

                const isWinner = winners.some(([w]) => w === name);

                return (
                  <li key={name}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-sm font-medium ${isWinner ? "text-yellow-600" : "text-foreground"}`}
                        >
                          {name}
                        </div>
                        <div className="text-xs text-muted-foreground">{`${votes}표`}</div>
                      </div>

                      <div className="text-sm font-medium">{`${percentRounded}%`}</div>
                    </div>

                    <Progress value={percent} className="h-3 rounded-md" />

                    {!rules?.anonymity && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {Array.from(set)
                          .map(
                            (uid) =>
                              users.find((u) => u.id === uid)?.nickname ??
                              "익명",
                          )
                          .join(", ")}
                      </div>
                    )}
                  </li>
                );
              })}

              {/* 총합 표시 */}
              <li className="pt-2 border-t border-muted-foreground/10">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>총표수</span>
                  <span>{totalVotes} 표</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VoteWinnerModal;
