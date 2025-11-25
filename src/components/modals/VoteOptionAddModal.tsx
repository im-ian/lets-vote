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
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface VoteOptionAddModalProps {
  options: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddOption: (option: string) => void;
}

export function VoteOptionAddModal({
  options,
  open,
  onOpenChange,
  onAddOption,
}: VoteOptionAddModalProps) {
  const [option, setOption] = useState("");

  function onSubmit() {
    if (option.length < 1 || option.length > 20) {
      toast.warning("옵션은 1글자 이상 20글자 이하로 입력해주세요.");
      return;
    }

    if (options.includes(option)) {
      toast.warning("이미 존재하는 옵션입니다.");
      return;
    }

    onAddOption(option);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>옵션 추가</DialogTitle>
          <DialogDescription>추가할 옵션을 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-6">
          <div className="grid gap-3">
            <Label htmlFor="option">옵션</Label>
            <Input
              id="option"
              name="option"
              defaultValue={option}
              onChange={(e) => setOption(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button onClick={onSubmit}>옵션 추가하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default VoteOptionAddModal;
