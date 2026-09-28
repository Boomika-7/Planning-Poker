import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFile } from "node:fs/promises";

const credentialJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const projectId = process.env.FIREBASE_PROJECT_ID;

if ((!credentialJson && !credentialPath) || !projectId) {
  throw new Error(
    "Set FIREBASE_PROJECT_ID and either FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.",
  );
}

const credentialSource = credentialJson ?? credentialPath;
let credentialContents;
try {
  JSON.parse(credentialSource);
  credentialContents = credentialSource;
} catch {
  credentialContents = await readFile(credentialSource, "utf8");
}

const app = initializeApp({
  credential: cert(JSON.parse(credentialContents)),
  projectId,
});

const db = getFirestore(app);
const dryRun = process.argv.includes("--dry-run");
const cutoff = Timestamp.fromMillis(Date.now());
const sessions = db.collection("sessions");
const [expiredByField, expiredLegacy] = await Promise.all([
  sessions.where("expiresAt", "<=", cutoff).get(),
  sessions
    .where("createdAt", "<=", Timestamp.fromMillis(Date.now() - 12 * 60 * 60 * 1000))
    .get(),
]);

const expired = new Map();
for (const snapshot of [expiredByField, expiredLegacy]) {
  for (const session of snapshot.docs) expired.set(session.ref.path, session.ref);
}

for (const sessionRef of expired.values()) {
  if (dryRun) {
    console.log(`Would delete expired session ${sessionRef.id}`);
  } else {
    await db.recursiveDelete(sessionRef);
    console.log(`Deleted expired session ${sessionRef.id}`);
  }
}

console.log(
  dryRun
    ? `Dry run complete: found ${expired.size} expired session(s).`
    : `Cleanup complete: deleted ${expired.size} expired session(s).`,
);
