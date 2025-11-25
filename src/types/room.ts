export type Room = {
  id: string;
  name: string;
  subject: string;
  password: string;
  creator: {
    id: string;
    nickname: string;
  };
  rules: RoomRules;
  vote: Vote;
  createdAt: Date;
  voteStartedAt: Date | null;
};

export type SerializeRoom = Omit<
  Room,
  "createdAt" | "vote" | "voteStartedAt"
> & {
  createdAt: string;
  vote: SerializeVote;
  voteStartedAt: string | null;
};

export type RoomWithUserCount = Omit<Room, "vote"> & {
  userCount: number;
};

export type RoomRules = {
  voteType: "user" | "custom";
  anonymity: boolean;
  limitTime: number;
  multiple: boolean;
  notifyWhenVoteChanged: boolean;
};

export type Vote = Record<string, Set<string>>;

export type SerializeVote = Record<string, string[]>;
