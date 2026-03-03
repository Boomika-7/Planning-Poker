import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import type { User } from "firebase/auth";
import { setVote } from "../services/setVote";

type Props = {
  sessionId: string;
  user: User;
};

const votingOptions = ["1", "2", "3", "5", "8", "13"];

export default function VotingCards({ sessionId, user }: Props) {
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [confirmedVote, setConfirmedVote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const participantRef = doc(
      db,
      "sessions",
      sessionId,
      "participants",
      user.uid,
    );

    const unsubscribe = onSnapshot(participantRef, (snapshot) => {
      const data = snapshot.data();
      setConfirmedVote(data?.vote ?? null);
    });

    return () => unsubscribe();
  }, [sessionId, user]);

  const handleSubmitVote = async () => {
    if (!selectedVote || !user) return;

    setIsSubmitting(true);

    try {
      await setVote(sessionId, user.uid, selectedVote);

      setConfirmedVote(selectedVote);
    } catch (err) {
      console.error("Vote submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold tracking-tight text-slate-100">
        Choose your vote
      </h2>
      <p className="mt-1 text-xs text-slate-400">
        Pick a card and submit. You can't change after submitting.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {votingOptions.map((value, index) => {
          const isSelected = selectedVote === value;
          const isConfirmed = confirmedVote === value;

          return (
            <button
              key={index}
              onClick={() => !confirmedVote && setSelectedVote(value)}
              disabled={!!confirmedVote}
              className={`relative h-24 w-16 md:h-28 md:w-20 rounded-2xl border text-xl font-bold transition-all duration-200 shadow-sm bg-white/5 border-white/10 text-slate-100 hover:-translate-y-1 hover:border-blue-500 active:scale-95 ${confirmedVote ? "cursor-not-allowed opacity-80" : ""} ${isSelected && !isConfirmed ? "ring-2 ring-cyan-400/60 border-cyan-400/30 bg-cyan-500/10" : ""} ${isConfirmed ? "ring-2 ring-emerald-400/70 border-emerald-400/30 bg-emerald-500/10" : ""}`}
            >
              {value}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmitVote}
          disabled={!selectedVote || !!confirmedVote || isSubmitting}
          className="inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold transition bg-gradient-to-r from-blue-800 to-purple-900 text-white hover:opacity-100 active:scale-95 disabled:cursor-not-allowed opacity-90"
        >
          {confirmedVote
            ? "Voted"
            : isSubmitting
              ? "Submitting..."
              : "Submit vote"}
        </button>
      </div>
    </div>
  );
}
