import { useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  type User 
} from "firebase/auth";
import { auth } from "../services/firebase";

export const useAuthUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) {
        return;
      }

      if (!firebaseUser) {
        try {
          await signInAnonymously(auth);
        } catch (signInError) {
          console.error("Anonymous sign-in failed", signInError);

          if (!active) {
            return;
          }

          setError("Unable to authenticate right now. Please try again.");
          setLoading(false);
        }

        return;
      }

      setUser(firebaseUser);
      setError(null);
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { user, loading, error };
};
