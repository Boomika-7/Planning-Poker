import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export const setVote = async (
  sessionId: string,
  userId: string,
  vote: string,
) => {
  const participantRef = doc(db, "sessions", sessionId, "participants", userId);

  await updateDoc(participantRef, { vote });

  // 🔥 After voting → check if everyone voted
  const participantsRef = collection(db, "sessions", sessionId, "participants");

  const snapshot = await getDocs(participantsRef);

  const allVoted = snapshot.docs.every((doc) => doc.data().vote !== null);

  if (allVoted && snapshot.docs.length > 0) {
    const sessionRef = doc(db, "sessions", sessionId);

    await updateDoc(sessionRef, {
      revealVotes: true,
    });
  }
};
