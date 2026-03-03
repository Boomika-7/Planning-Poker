import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore"
import { db } from "./firebase"
import type { SessionUser } from "../types"

const SESSION_ID_LENGTH = 6
const MAX_SESSION_ID_ATTEMPTS = 10

const generateSessionId = () =>
  Math.random().toString(36).slice(2, 2 + SESSION_ID_LENGTH).toUpperCase()

const generateUniqueSessionId = async () => {
  for (let attempt = 0; attempt < MAX_SESSION_ID_ATTEMPTS; attempt += 1) {
    const sessionId = generateSessionId()
    const existingSession = await getDoc(doc(db, "sessions", sessionId))

    if (!existingSession.exists()) {
      return sessionId
    }
  }

  throw new Error("Unable to generate a unique session ID")
}

export const createSession = async (sessionName: string, user: SessionUser) => {
  const sessionId = await generateUniqueSessionId()
  const batch = writeBatch(db)

  batch.set(doc(db, "sessions", sessionId), {
    name: sessionName,
    hostId: user.uid,
    hostName: user.name,
    revealVotes: false,
    createdAt: serverTimestamp(),
  })

  batch.set(doc(db, "sessions", sessionId, "participants", user.uid), {
    name: user.name,
    isHost: true,
    vote: null,
    joinedAt: serverTimestamp(),
  })

  await batch.commit()

  return sessionId
}
