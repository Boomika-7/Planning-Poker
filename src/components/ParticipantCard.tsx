import { CheckIcon, CircleDashed, Crown } from "lucide-react";
import type { ParticipantCardProps } from "../types";

export const ParticipantCard = ({
  name,
  vote,
  voted,
  isHost,
  revealVotes,
}: ParticipantCardProps) => {
  return (
    <div className="relative min-w-[150px] rounded-2xl bg-[#11254a] p-3 sm:p-5 border border-blue-500">
        {isHost && (
          <div className="absolute right-0 top-0 p-1.5">
            <Crown className="h-4 w-4 text-amber-300 fill-amber-300" />
          </div>
        )}
        <div className="text-center sm:mt-1">
          <p className="text-xl font-semibold text-slate-100">
            {name.toUpperCase()}
          </p>
          {!revealVotes && (<div className={`mt-4 mx-auto w-fit rounded-full px-5 py-2 inline-flex items-center gap-2 border backdrop-blur ${voted ? "bg-emerald-500/15 border-emerald-400/20 text-emerald-100" : "bg-yellow-500/15 border-yellow-400/10 text-yellow-200"}`}>
            {voted ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <CircleDashed className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">
              {voted ? "Voted" : "Waiting"}
            </span>
          </div>)}
          {revealVotes && (
            <div className="mt-3 text-3xl font-bold text-emerald-200">
              {vote}
            </div>
          )}
        </div>
    </div>
  );
}
