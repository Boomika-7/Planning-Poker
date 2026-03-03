import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useParticipants } from "../hooks/useParticipants";
import { useAuthUser } from "../hooks/useAuthUser";
import VotingCards from "../components/VotingCards";
import { Copy, RotateCcw, LogOut, Trash } from "lucide-react";
import { exitSession } from "../services/exitSession";
import { deleteSession } from "../services/deleteSession";
import { restartSession } from "../services/restartSession";
import { ParticipantCard } from "../components/ParticipantCard";
import { useSession } from "../hooks/useSession";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import LoadingScreen from "../components/LoadingScreen";

function IconAction({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 rounded-xl px-2 sm:px-3 py-2 border border-white/20 bg-white/10 transition hover:bg-white/10 active:scale-95"
      title={label}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
export const SessionRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [initialLoading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const { user, loading } = useAuthUser();

  const normalizedSessionId = useMemo(
    () => (sessionId ?? "").trim().toUpperCase(),
    [sessionId],
  );

  const participants = useParticipants(normalizedSessionId);
  const currentParticipant = user
    ? participants.find((p) => p.id === user.uid)
    : undefined;

  const isHost = currentParticipant?.isHost ?? false;

  const [copied, setCopied] = useState(false);

  const session = useSession(normalizedSessionId);
  const votesRevealed = session?.revealVotes ?? false;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(normalizedSessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const navigate = useNavigate();

  const handleRestart = async () => {
    try {
      await restartSession(normalizedSessionId);
    } catch (err) {
      console.error("Restart failed", err);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteSession(normalizedSessionId);
      navigate("/");
    } catch (err) {
      console.error("Delete failed", err);
      setLoading(false)
    }
  };

  const handleExit = async () => {
    try {
      setIsExiting(true);
      await exitSession(normalizedSessionId, user!.uid);
      navigate("/");
    } catch (err) {
      console.error("Exit failed", err);
      setIsExiting(false);
    }
  };

  useEffect(() => {
    if (!normalizedSessionId) {
      navigate("/");
      return;
    }

    let sessionUnsubscribe: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        navigate("/");
        return;
      }

      try {
        const sessionRef = doc(db, "sessions", normalizedSessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          navigate("/");
          return;
        }

        const participantRef = doc(
          db,
          "sessions",
          normalizedSessionId,
          "participants",
          authUser.uid,
        );

        const participantSnap = await getDoc(participantRef);

        if (!participantSnap.exists()) {
          navigate("/");
        }

        setLoading(false);

        sessionUnsubscribe = onSnapshot(
          sessionRef,
          (snapshot) => {
            if (!snapshot.exists()) {
              setLoading(true)
              navigate("/", { replace: true });
            }
          },
          (error) => {
            console.error("Session listener error:", error);
            navigate("/", { replace: true });
            setLoading(false)
          },
        );
      } catch (error) {
        console.error("Session validation error:", error);
        navigate("/");
      }
    });

    return () => {
      unsubscribeAuth();
      if (sessionUnsubscribe) sessionUnsubscribe();
    };
  }, [navigate, normalizedSessionId]);

  if (loading || initialLoading || isExiting) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <div>Authentication failed.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col justify-between">
      {/* Top */}
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 px-4 sm:px-8 pt-8">
        <span className="font-semibold tracking-wider rounded-2xl border border-white/30 bg-white/10 px-4 py-2 shadow-lg backdrop-blur">
          Room ID: {normalizedSessionId}
        </span>
        <div className="flex items-center gap-2 sm:gap-4">
          {isHost && (
            <IconAction
              label="Restart"
              onClick={handleRestart}
              icon={
                <RotateCcw className="h-3 w-3 sm:h-5 sm:w-5 text-yellow-500" />
              }
            />
          )}
          <IconAction
            label="Exit"
            onClick={handleExit}
            icon={<LogOut className="h-3 w-3 sm:h-5 sm:w-5 text-orange-500" />}
          />
          {isHost && (
            <IconAction
              label="Delete"
              onClick={handleDelete}
              icon={<Trash className="h-3 w-3 sm:h-5 sm:w-5 text-red-500" />}
            />
          )}
          <IconAction
            label={copied ? "Copied" : "Invite"}
            onClick={handleCopy}
            icon={<Copy className="h-3 w-3 sm:h-5 sm:w-5 text-blue-500" />}
          />
        </div>
      </div>

      {/* Participants */}
      <section className="px-4 pt-4 space-y-4 sm:px-8 sm:pt-8 sm:space-y-6">
        <h2 className="text-base sm:text-xl font-semibold tracking-tight text-slate-100 text-center">
          Participants
        </h2>
        <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
          {participants.map((p) => (
            <ParticipantCard
              key={p.id}
              name={p.name}
              vote={p.vote}
              voted={Boolean(p.vote)}
              isHost={p.isHost}
              revealVotes={votesRevealed}
            />
          ))}
        </div>
      </section>

      {/* Voting */}
      <section className="pb-8">
        <VotingCards sessionId={normalizedSessionId} user={user} />
      </section>
    </div>
  );
};
