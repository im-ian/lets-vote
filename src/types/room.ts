export type Room = {
  id: string;
  name: string;
  password: string;
  creator: {
    id: string;
    nickname: string;
  };
  users: string[];
  createdAt: Date;
};
