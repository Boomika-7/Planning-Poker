import { useMemo, useState } from "react";
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
      className="group flex items-center gap-2 rounded-xl px-3 py-2 border border-white/20 bg-white/10 transition hover:bg-white/10 active:scale-95"
      title={label}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
export const SessionRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { user, loading } = useAuthUser();

  const normalizedSessionId = useMemo(
    () => (sessionId ?? "").trim().toUpperCase(),
    [sessionId],
  );

  const participants = useParticipants(normalizedSessionId);
  const currentParticipant = user ? participants.find((p) => p.id === user.uid) : undefined;

  const isHost = currentParticipant?.isHost ?? false;

  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/session/${sessionId}`;

  const session = useSession(normalizedSessionId);
const votesRevealed = session?.revealVotes ?? false;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
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
      await deleteSession(normalizedSessionId);
      navigate("/");
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleExit = async () => {
    try {
      await exitSession(normalizedSessionId, user!.uid);
      navigate("/");
    } catch (err) {
      console.error("Exit failed", err);
    }
  };

  if (loading) {
    return <div>Connecting...</div>;
  }

  if (!user) {
    return <div>Authentication failed.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col justify-between">
      {/* Top */}
      <div className="flex items-center justify-between gap-4 px-8 pt-8">
        <span className="font-semibold tracking-wider rounded-2xl border border-white/30 bg-white/10 px-4 py-2 shadow-lg backdrop-blur">
          Room ID: {normalizedSessionId}
        </span>
        <div className="flex items-center gap-4">
          {isHost && (
            <IconAction
              label="Restart"
              onClick={handleRestart}
              icon={<RotateCcw className="h-5 w-5 text-yellow-500" />}
            />
          )}
          <IconAction
            label="Exit"
            onClick={handleExit}
            icon={<LogOut className="h-5 w-5 text-orange-500" />}
          />
          {isHost && (
            <IconAction
              label="Delete"
              onClick={handleDelete}
              icon={<Trash className="h-5 w-5 text-red-500" />}
            />
          )}
          <IconAction
            label={copied ? "Copied" : "Invite"}
            onClick={handleCopy}
            icon={<Copy className="h-5 w-5 text-blue-500" />}
          />
        </div>
      </div>

      {/* Participants */}
      <section className="px-8 pt-8 space-y-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-100 text-center">
          Participants
        </h2>
        <div className="flex flex-wrap gap-6 justify-center">
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
