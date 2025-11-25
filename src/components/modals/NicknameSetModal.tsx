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
import { SocketEvent } from "@/lib/socket";
import { useSocket } from "../providers/SocketProvider";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface NicknameSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeNickname: (nickname: string) => void;
}

export function NicknameSetModal({
  open,
  onOpenChange,
  onChangeNickname,
}: NicknameSetModalProps) {
  const { socket } = useSocket();

  const [nickname, setNickname] = useState(() => {
    return sessionStorage.getItem("nickname") || "익명";
  });

  function onSubmit() {
    if (nickname.length < 2 || nickname.length > 10) {
      toast.warning("닉네임은 2글자 이상 10글자 이하로 입력해주세요.");
      return;
    }

    socket?.emit(SocketEvent.SET_NICKNAME, nickname);
    sessionStorage.setItem("nickname", nickname);
    onChangeNickname(nickname);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>닉네임 변경</DialogTitle>
          <DialogDescription>사용하실 닉네임을 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-6">
          <div className="grid gap-3">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              name="nickname"
              defaultValue={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={onSubmit}>변경하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NicknameSetModal;
