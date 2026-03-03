import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

export const exitSession = async (
  sessionId: string,
  userId: string
) => {
  const sessionRef = doc(db, "sessions", sessionId);
  const participantsRef = collection(
    db,
    "sessions",
    sessionId,
    "participants"
  );

  const snapshot = await getDocs(
    query(participantsRef, orderBy("joinedAt", "asc"))
  );

  const batch = writeBatch(db);

  const leavingDoc = snapshot.docs.find(d => d.id === userId);
  const isHost = leavingDoc?.data().isHost;

  const leavingRef = doc(
    db,
    "sessions",
    sessionId,
    "participants",
    userId
  );
  batch.delete(leavingRef);

  if (isHost) {
    const remaining = snapshot.docs.filter(d => d.id !== userId);

    if (remaining.length > 0) {
      const nextHostDoc = remaining[0];
      const nextHostData = nextHostDoc.data();

      batch.update(nextHostDoc.ref, { isHost: true });

      batch.update(sessionRef, {
        hostId: nextHostDoc.id,
        hostName: nextHostData.name,
      });
    } else {
      batch.delete(sessionRef);
    }
  }

  await batch.commit();
};