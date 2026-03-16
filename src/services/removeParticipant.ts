import { deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

export const removeParticipant = async (
  sessionId: string,
  participantId: string,
) => {
  const ref = doc(db, "sessions", sessionId, "participants", participantId);
  await deleteDoc(ref);
};
