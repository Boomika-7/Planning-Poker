import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { chunkItems, MAX_BATCH_SIZE } from "./batchUtils";

export const restartSession = async (sessionId: string) => {
  const participantsRef = collection(db, "sessions", sessionId, "participants");
  const snapshot = await getDocs(participantsRef);
  const participantDocs = snapshot.docs;
  const sessionRef = doc(db, "sessions", sessionId);

  // Keep session + votes atomic when possible and chunk for large rooms.
  if (participantDocs.length <= MAX_BATCH_SIZE - 1) {
    const batch = writeBatch(db);
    batch.update(sessionRef, { revealVotes: false });

    participantDocs.forEach((docSnap) => {
      batch.update(docSnap.ref, { vote: null });
    });

    await batch.commit();
    return;
  }

  const participantChunks = chunkItems(participantDocs, MAX_BATCH_SIZE);

  for (const chunk of participantChunks) {
    const batch = writeBatch(db);

    chunk.forEach((docSnap) => {
      batch.update(docSnap.ref, { vote: null });
    });

    await batch.commit();
  }

  const sessionBatch = writeBatch(db);
  sessionBatch.update(sessionRef, { revealVotes: false });
  await sessionBatch.commit();
};
