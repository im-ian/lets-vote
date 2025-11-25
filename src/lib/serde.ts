import type { Room, SerializeRoom, SerializeVote, Vote } from "@/types/room";

function serializeVote(vote: Vote): SerializeVote {
  return Object.fromEntries(
    Object.entries(vote).map(([k, v]) => [k, Array.from(v)]),
  );
}

function deserializeVote(vote: SerializeVote): Vote {
  return Object.fromEntries(
    Object.entries(vote).map(([k, v]) => [k, new Set(v)]),
  );
}

const serde = {
  serializeVote,
  deserializeVote,
  serializeRoom: (room: Room): SerializeRoom => ({
    ...room,
    createdAt: room.createdAt.toISOString(),
    vote: serializeVote(room.vote),
  }),
  deserializeRoom: (room: SerializeRoom): Room => ({
    ...room,
    createdAt: new Date(room.createdAt),
    vote: deserializeVote(room.vote),
  }),
};

export default serde;
