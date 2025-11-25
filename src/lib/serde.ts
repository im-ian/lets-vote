import type { Room, SerializeRoom, SerializeVote, Vote } from "@/types/room";

function serializeVote(vote: Vote): SerializeVote {
  return Object.fromEntries(
    Object.entries(vote).map(([k, v]) => [k, Array.from(v)])
  );
}

function deserializeVote(vote: SerializeVote): Vote {
  return Object.fromEntries(
    Object.entries(vote).map(([k, v]) => [k, new Set(v)])
  );
}

const serde = {
  serializeVote,
  deserializeVote,
  serializeRoom: (room: Room): SerializeRoom => ({
    ...room,
    createdAt: room.createdAt.toISOString(),
    vote: serializeVote(room.vote),
    voteStartedAt: room.voteStartedAt ? room.voteStartedAt.toISOString() : null,
  }),
  deserializeRoom: (room: SerializeRoom): Room => ({
    ...room,
    createdAt: new Date(room.createdAt),
    vote: deserializeVote(room.vote),
    voteStartedAt: room.voteStartedAt ? new Date(room.voteStartedAt) : null,
  }),
};

export default serde;
