import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "./firebase"
import type { SessionUser } from "../types"

export const joinSession = async (sessionId: string, user: SessionUser) => {
  const sessionRef = doc(db, "sessions", sessionId)
  const sessionSnapshot = await getDoc(sessionRef)

  if (!sessionSnapshot.exists()) {
    throw new Error("Session not found")
  }

  await setDoc(doc(db, "sessions", sessionId, "participants", user.uid), {
    name: user.name,
    isHost: false,
    vote: null,
    joinedAt: serverTimestamp(),
  })

  return true
}
