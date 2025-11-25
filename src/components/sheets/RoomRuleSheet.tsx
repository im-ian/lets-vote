import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RoomRules } from "@/types/room";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface RoomRuleSheetProps {
  rules: RoomRules;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChangeRules: (rules: RoomRules) => void;
}

function RoomRuleSheet({
  rules,
  open,
  onOpenChange,
  onChangeRules,
}: RoomRuleSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>방 규칙</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 px-4 space-y-4">
          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="voteType">투표 방식</Label>
            <Select
              value={rules.voteType}
              onValueChange={(value) =>
                onChangeRules({
                  ...rules,
                  voteType: value as RoomRules["voteType"],
                })
              }
            >
              <SelectTrigger className="w-full" id="voteType">
                <SelectValue placeholder="투표 방식 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">유저</SelectItem>
                <SelectItem value="custom">커스텀</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="anonymity">익명</Label>
            <Switch
              id="anonymity"
              checked={rules.anonymity}
              onCheckedChange={(checked) =>
                onChangeRules({ ...rules, anonymity: checked })
              }
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="limitTime">제한시간</Label>
            <Input
              id="limitTime"
              type="number"
              value={rules.limitTime}
              onChange={(e) =>
                onChangeRules({ ...rules, limitTime: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-3">
            <Label htmlFor="multiple">다중 선택</Label>
            <Switch
              id="multiple"
              checked={rules.multiple}
              onCheckedChange={(checked) =>
                onChangeRules({ ...rules, multiple: checked })
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default RoomRuleSheet;
