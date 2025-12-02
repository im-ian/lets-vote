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
import { SocketEvent } from "@/constants/socket";
import { useSocket } from "../providers/SocketProvider";
import { Input } from "../ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";

interface RoomCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomCreateModal({ open, onOpenChange }: RoomCreateModalProps) {
  const { socket } = useSocket();

  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");

  function onCreate() {
    if (!roomName) {
      toast.warning("방 이름을 입력해주세요.");
      return;
    }

    if (!password || password.length < 4) {
      toast.warning("비밀번호는 4자리 이상이어야 합니다.");
      return;
    }

    socket?.emit(SocketEvent.CREATE_ROOM, roomName, password);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>방 만들기</DialogTitle>
          <DialogDescription>
            방의 이름과 비밀번호를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-6">
          <div className="grid gap-3">
            <Label htmlFor="room-name">방 이름</Label>
            <Input
              id="room-name"
              name="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="room-password">비밀번호</Label>
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
          <Button type="submit" onClick={onCreate}>
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RoomCreateModal;
