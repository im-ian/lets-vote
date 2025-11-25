import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSocket } from "../providers/SocketProvider";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";

interface RoomJoinModalProps {
  roomId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomJoinModal({
  roomId,
  open,
  onOpenChange,
}: RoomJoinModalProps) {
  const { socket } = useSocket();

  const [password, setPassword] = useState("");

  function handleJoin() {
    if (!roomId) {
      toast.warning("방을 선택해주세요.");
      return;
    }

    if (!password || password.length < 4) {
      toast.warning("비밀번호는 4자리 이상이어야 합니다.");
      return;
    }

    socket?.emit("join-room", roomId, password);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>방 참여하기</DialogTitle>
          <DialogDescription>방의 비밀번호를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center justify-center">
            <InputOTP
              maxLength={4}
              value={password}
              onChange={(value) => setPassword(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className="[text-security:disc] [-webkit-text-security:disc]"
                />
                <InputOTPSlot
                  index={1}
                  className="[text-security:disc] [-webkit-text-security:disc]"
                />
                <InputOTPSlot
                  index={2}
                  className="[text-security:disc] [-webkit-text-security:disc]"
                />
                <InputOTPSlot
                  index={3}
                  className="[text-security:disc] [-webkit-text-security:disc]"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button type="submit" onClick={handleJoin}>
            참여하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RoomJoinModal;
