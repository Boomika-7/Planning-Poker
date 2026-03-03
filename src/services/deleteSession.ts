import { collection, getDocs, writeBatch, doc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";
import { chunkItems, MAX_BATCH_SIZE } from "./batchUtils";


export const deleteSession = async (sessionId: string) => {
  const participantsRef = collection(
    db,
    "sessions",
    sessionId,
    "participants"
  );

  const snapshot = await getDocs(participantsRef);
  const participantDocs = snapshot.docs;
  const participantChunks = chunkItems(participantDocs, MAX_BATCH_SIZE);

  for (const chunk of participantChunks) {
    const batch = writeBatch(db);

    chunk.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
  }

  const sessionRef = doc(db, "sessions", sessionId);
  await deleteDoc(sessionRef);
};
