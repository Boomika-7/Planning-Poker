import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { joinSession } from "../services/joinSession";
import { createSession } from "../services/createSession";
import { useAuthUser } from "../hooks/useAuthUser";
import LoadingScreen from "../components/LoadingScreen";

type Participant = {
  uid: string;
  name: string;
};

export default function Home() {
  const [rightActive, setRightActive] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { user, loading } = useAuthUser();

  const navigate = useNavigate();

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Authentication not ready. Please wait.");
      return;
    }

    const trimmedSessionName = sessionName.trim();
    const trimmedUserName = userName.trim();

    if (!trimmedSessionName || !trimmedUserName) {
      setError("Session name and your name are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userDetails: Participant = {
        uid: user.uid,
        name: trimmedUserName,
      };

      const sessionId = await createSession(trimmedSessionName, userDetails);
      navigate(`/session/${sessionId}`);
    } catch {
      setError("Failed to create session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Authentication not ready. Please wait.");
      return;
    }

    const trimmedSessionId = joinCode.trim().toUpperCase();
    const trimmedName = userName.trim();

    if (!trimmedSessionId || !trimmedName) {
      setError("Session ID and name are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userDetails: Participant = {
        uid: user.uid,
        name: trimmedName,
      };

      await joinSession(trimmedSessionId, userDetails);
      navigate(`/session/${trimmedSessionId}`);
    } catch {
      setError("Unable to join session. Check the Session ID and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearAll = () => {
    setSessionName("");
    setJoinCode("");
    setUserName("");
    setError("");
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <div>Authentication failed</div>;

  return (
    <div className="p-8 sm:p-0 min-h-screen flex items-center justify-center bg-slate-950">
      <div
        id="container"
        className={`container relative overflow-hidden bg-white rounded-xl shadow-2xl w-full max-w-[380px] md:max-w-full md:w-[780px] min-h-[640px] md:min-h-[480px] transition-all duration-500 ${
          rightActive ? "right-panel-active" : ""
        }`}
      >
        {/* Create (left) */}
        <div className={`form-container sign-in-container absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-6 md:p-8 transition-all duration-600 ${rightActive ? "hidden" : ""}`}>
          <form className="w-full space-y-4" onSubmit={handleCreate}>
            <h1 className="text-3xl font-bold">Create Room</h1>
            <p className="text-sm text-slate-500">
              Create a new planning poker room and share code
            </p>

            <div>
              <label className="text-base block mb-1">Room name</label>
              <input
                className="w-full rounded-md bg-slate-100 px-3 py-2 outline-none text-sm"
                placeholder="Sprint Planning: 01/01/2026"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-base block mb-1">Your name</label>
              <input
                className="w-full rounded-md bg-slate-100 px-3 py-2 outline-none text-sm"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g., Alice"
                disabled={isSubmitting}
              />
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border border-black px-6 py-2 text-slate-700 hover:bg-black hover:text-white disabled:opacity-60"
                disabled={isSubmitting}
              >
                Clear
              </button>

              <button
                type="submit"
                className="rounded-full bg-pink-600 hover:bg-pink-800 text-white px-8 py-2 font-semibold disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
          {error && (
            <div className="absolute bottom-0 w-full text-center bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Join (right) */}
        <div className="form-container sign-up-container absolute top-0 left-0 w-1/2 h-full flex items-center justify-center p-6 md:p-8 transition-all duration-600">
          <form className="w-full space-y-4" onSubmit={handleJoin}>
            <h1 className="text-3xl font-bold">Join Room</h1>
            <p className="text-sm text-slate-500">
              Enter the invite code or paste the invite link
            </p>

            <div>
              <label className="text-base block mb-1">Room code</label>
              <input
                className="w-full rounded-md bg-slate-100 px-3 py-2 outline-none text-sm"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="e.g., AB12CD"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-base block mb-1">Your name</label>
              <input
                className="w-full rounded-md bg-slate-100 px-3 py-2 outline-none text-sm"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g., Bob"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-full border border-black px-6 py-2 text-slate-700 hover:bg-black hover:text-white disabled:opacity-60"
                disabled={isSubmitting}
              >
                Clear
              </button>

              <button
                type="submit"
                className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 font-semibold disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Joining..." : "Join"}
              </button>
            </div>
          </form>
          {error && (
            <div className="absolute bottom-0 w-full text-center bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Overlay container */}
        <div className="overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 z-40">
          <div className="overlay h-full w-[200%] -translate-x-full bg-gradient-to-r from-orange-500 to-pink-500 text-white flex items-center">
            <div className="overlay-panel overlay-left w-1/2 h-full flex flex-col items-center justify-center p-8 transition-transform duration-600">
              <h1 className="text-3xl font-bold">OR</h1>
              <p className="max-w-[300px] text-center mt-3">
                Create a new room and invite your team to estimate together.
              </p>
              <button
                type="button"
                className="mt-6 rounded-full border-2 border-white px-6 py-2 text-white bg-transparent hover:bg-orange-600"
                onClick={() => setRightActive(false)}
                disabled={isSubmitting}
              >
                Create
              </button>
            </div>

            <div className="overlay-panel overlay-right w-1/2 h-full flex flex-col items-center justify-center p-8 transition-transform duration-600">
              <h1 className="text-3xl font-bold">OR</h1>
              <p className="max-w-[300px] text-center mt-3">
                If you already have a code, join the room quickly.
              </p>
              <button
                type="button"
                className="mt-6 rounded-full border-2 border-white px-6 py-2 text-white bg-transparent hover:bg-pink-700"
                onClick={() => setRightActive(true)}
                disabled={isSubmitting}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
