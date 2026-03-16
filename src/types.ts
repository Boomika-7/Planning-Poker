import type { Timestamp } from "firebase/firestore";

export type SessionUser = {
  uid: string;
  name: string;
};

export type Session = {
  name: string;
  hostId: string;
  hostName: string;
  createdAt: Timestamp;
  revealVotes: boolean;
};

export type ParticipantCardProps = {
  name: string;
  vote: string | null;
  voted: boolean;
  isHost: boolean;
  revealVotes: boolean;
  currentUserIsHost: boolean;
  onRemove?: () => void;
};

export type Participant = {
  id: string;
  name: string;
  vote: string | null;
  isHost: boolean;
};
