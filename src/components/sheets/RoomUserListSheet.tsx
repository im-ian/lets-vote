import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { User } from "@/types/user";
import { Avatar, AvatarFallback } from "../ui/avatar";
import type { Room } from "@/types/room";
import { CrownIcon } from "lucide-react";

interface RoomUserListSheetProps {
  room: Room | null;
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RoomUserListSheet({
  room,
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
          {users.map((user) => {
            const isAdmin = room && user.id === room.creator.id;

            return (
              <div key={user.id} className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                </Avatar>
                {user.nickname}
                {isAdmin && (
                  <CrownIcon
                    className="size-4 text-yellow-500"
                    fill="currentColor"
                  />
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default RoomUserListSheet;
