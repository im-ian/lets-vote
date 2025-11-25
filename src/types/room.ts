export type Room = {
  id: string;
  name: string;
  password: string;
  creator: {
    id: string;
    nickname: string;
  };
  createdAt: Date;
};

export type RoomWithUserCount = Room & {
  userCount: number;
};
