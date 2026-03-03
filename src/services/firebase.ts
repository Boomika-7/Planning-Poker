import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";

const getEnvOrThrow = (key: string) => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing Firebase env var: ${key}`);
  }

  return value;
};

const firebaseConfig = {
  apiKey: getEnvOrThrow("VITE_API_KEY"),
  authDomain: getEnvOrThrow("VITE_AUTH_DOMAIN"),
  projectId: getEnvOrThrow("VITE_PROJECT_ID"),
  storageBucket: getEnvOrThrow("VITE_STORAGE_BUCKET"),
  messagingSenderId: getEnvOrThrow("VITE_MESSAGING_SENDER_ID"),
  appId: getEnvOrThrow("VITE_APP_ID"),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app)
