import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import type { Session } from "../types";

export const useSession = (sessionId: string) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const sessionRef = doc(db, "sessions", sessionId);

    const unsubscribe = onSnapshot(sessionRef, (snapshot) => {
      if (!snapshot.exists()) {
        setSession(null);
        return;
      }

      setSession(snapshot.data() as Session);
    });

    return () => unsubscribe();
  }, [sessionId]);

  return session;
};
