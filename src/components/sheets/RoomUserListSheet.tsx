import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { User } from "@/types/user";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface RoomUserListSheetProps {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RoomUserListSheet({
  users,
  open,
  onOpenChange,
}: RoomUserListSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>참여 중인 유저 목록({users.length})</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-2 px-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{user.nickname[0]}</AvatarFallback>
              </Avatar>
              {user.nickname}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default RoomUserListSheet;
