export type Room = {
  id: string;
  name: string;
  password: string;
  creator: {
    id: string;
    nickname: string;
  };
  rules: RoomRules;
  vote: Vote;
  createdAt: Date;
};

export type SerializeRoom = Omit<Room, "createdAt" | "vote"> & {
  createdAt: string;
  vote: SerializeVote;
};

export type RoomWithUserCount = Omit<Room, "vote"> & {
  userCount: number;
};

export type RoomRules = {
  voteType: "user" | "custom";
  anonymity: boolean;
  limitTime: number;
  multiple: boolean;
};

export type Vote = Record<string, Set<string>>;

export type SerializeVote = Record<string, string[]>;
