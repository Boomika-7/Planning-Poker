import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { Participant } from "../types";

export const useParticipants = (sessionId: string) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(
      collection(db, "sessions", sessionId, "participants"),
      (snapshot) => {
        const players: Participant[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Participant, "id">),
        }));

        setParticipants(players);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  return participants;
};