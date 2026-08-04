"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faAward,
  faChartColumn,
  faCheck,
  faCircleExclamation,
  faCrown,
  faDumbbell,
  faFaceFrown,
  faFaceSmile,
  faFutbol,
  faGamepad,
  faHourglassHalf,
  faHouse,
  faKey,
  faLightbulb,
  faMedal,
  faPlay,
  faRightLong,
  faRotateRight,
  faSpinner,
  faStar,
  faStopwatch,
  faThumbsUp,
  faTrophy,
  faUser,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

// Types
interface QuizPlayer {
  playerId: number;
  career: string[];
  name?: string;
}

interface Answer {
  playerId: number;
  playerName: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface ParticipantResult {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  avgTimePerQuestion: number | null;
  done: boolean;
}

function RankDisplay({ index }: { index: number }) {
  if (index === 0) return <FontAwesomeIcon icon={faMedal} className="rank-gold" />;
  if (index === 1) return <FontAwesomeIcon icon={faMedal} className="rank-silver" />;
  if (index === 2) return <FontAwesomeIcon icon={faMedal} className="rank-bronze" />;
  return <span className="text-sm md:text-base">#{index + 1}</span>;
}

function LoadingDots() {
  return (
    <div className="loading-dots">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </div>
  );
}

function ScoreFeedback({ score, total }: { score: number; total: number }) {
  if (score === total) {
    return (
      <p className="subtitle flex items-center justify-center gap-2 mt-3">
        <FontAwesomeIcon icon={faTrophy} className="text-[var(--success-color)]" />
        Parfait ! Vous êtes un expert !
      </p>
    );
  }
  if (score >= 7) {
    return (
      <p className="subtitle flex items-center justify-center gap-2 mt-3">
        <FontAwesomeIcon icon={faFaceSmile} className="text-[var(--success-color)]" />
        Excellent ! Bravo !
      </p>
    );
  }
  if (score >= 4) {
    return (
      <p className="subtitle flex items-center justify-center gap-2 mt-3">
        <FontAwesomeIcon icon={faThumbsUp} className="text-[var(--accent-color)]" />
        Pas mal ! Continuez !
      </p>
    );
  }
  return (
    <p className="subtitle flex items-center justify-center gap-2 mt-3">
      <FontAwesomeIcon icon={faDumbbell} className="text-[var(--error-color)]" />
      Vous pouvez faire mieux !
    </p>
  );
}

function uniqueQuizPlayers(players: QuizPlayer[]): QuizPlayer[] {
  const seenPlayerIds = new Set<number>();
  const seenPlayerNames = new Set<string>();
  return players.filter((player) => {
    const normalizedName = (player.name ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    if (seenPlayerIds.has(player.playerId) || seenPlayerNames.has(normalizedName)) {
      return false;
    }
    seenPlayerIds.add(player.playerId);
    seenPlayerNames.add(normalizedName);
    return true;
  });
}

// ─────────────── WELCOME SCREEN ───────────────
function WelcomeScreen({ onStart }: { onStart: (name: string) => void }) {
  const [name, setName] = useState("");

  const isValid = name.trim().length >= 3;

  return (
    <div className="screen-wrapper py-6 md:py-8">
      <div className="screen-content fade-in space-y-4 md:space-y-6">
        <div className="text-center">
          <div className="icon-hero icon-hero--lg mx-auto">
            <FontAwesomeIcon icon={faFutbol} className="ballon-icon" />
          </div>
          <h1 className="heading-hero mb-1 md:mb-2">CARRIÈRE BETA</h1>
          <p className="subtitle text-sm md:text-base">Identifiez les joueurs grâce à leurs carrières</p>
        </div>

        <div className="card">
          <label htmlFor="player-name" className="label text-xs md:text-sm">
            Entrez votre nom :
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isValid) onStart(name.trim());
            }}
            placeholder="Votre nom (min. 3 caractères)"
            className={`input-field mb-4 md:mb-6 ${name.length > 0 && !isValid ? "input-field--error" : ""}`}
            autoFocus
            maxLength={30}
            aria-label="Votre nom"
          />
          {name.length > 0 && !isValid && (
            <p className="text-xs md:text-sm mb-3 md:mb-4 -mt-3 md:-mt-4 flex items-center gap-1.5" style={{ color: "var(--error-color)" }}>
              <FontAwesomeIcon icon={faCircleExclamation} />
              Le nom doit contenir au moins 3 caractères
            </p>
          )}

          <button
            onClick={() => isValid && onStart(name.trim())}
            disabled={!isValid}
            className={`btn btn-primary btn-block glow-effect text-sm md:text-base ${!isValid ? "btn-primary--disabled" : ""}`}
          >
            <FontAwesomeIcon icon={faTrophy} /> COMMENCER
          </button>
        </div>

        <p className="text-center text-[0.7rem] md:text-sm" style={{ color: "var(--text-subtle)" }}>
          10 joueurs • 20 secondes par question • Bonne chance !
        </p>
      </div>
    </div>
  );
}

// ─────────────── MODE SELECT SCREEN ───────────────
function ModeSelectScreen({
  userName,
  onSolo,
  onFriends,
  onBack,
}: {
  userName: string;
  onSolo: () => void;
  onFriends: () => void;
  onBack: () => void;
}) {
  return (
    <div className="screen-wrapper">
      <div className="screen-content fade-in space-y-4 md:space-y-6">
        <div className="text-center">
          <div className="icon-hero mx-auto">
            <FontAwesomeIcon icon={faFutbol} className="ballon-icon" />
          </div>
          <h1 className="heading-lg mb-1 md:mb-2">Bonjour, {userName} !</h1>
          <p className="subtitle text-sm md:text-base">Choisissez votre mode de jeu</p>
        </div>

        <button
          id="btn-solo"
          onClick={onSolo}
          className="btn btn-primary btn-mode glow-effect"
        >
          <FontAwesomeIcon icon={faGamepad} className="btn-mode-icon" />
          <span className="btn-mode-title">Solo</span>
          <span className="btn-mode-desc" style={{ color: "rgba(0,0,0,0.55)" }}>
            Jouez seul et battez votre record
          </span>
        </button>

        <button
          id="btn-friends"
          onClick={onFriends}
          className="btn btn-secondary btn-mode"
        >
          <FontAwesomeIcon icon={faUsers} className="btn-mode-icon" />
          <span className="btn-mode-title">Avec des amis</span>
          <span className="btn-mode-desc">Affrontez un ami en temps réel</span>
        </button>

        <button onClick={onBack} className="btn btn-ghost btn-block text-xs md:text-sm">
          <FontAwesomeIcon icon={faArrowLeft} /> Retour
        </button>
      </div>
    </div>
  );
}

// ─────────────── FRIEND LOBBY SCREEN ───────────────
function FriendLobbyScreen({
  userName,
  onReady,
  onBack,
  existingRoom,
}: {
  userName: string;
  onReady: (
    quizPlayers: QuizPlayer[],
    roomCode: string,
    hostName: string,
    participants: string[]
  ) => void;
  onBack: () => void;
  existingRoom?: {
    code: string;
    quizPlayers: QuizPlayer[];
    hostName: string;
    participants: string[];
  } | null;
}) {
  const [codeInput, setCodeInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const [inLobby, setInLobby] = useState(Boolean(existingRoom));
  const [generatedCode, setGeneratedCode] = useState(existingRoom?.code ?? "");
  const [quizPlayers, setQuizPlayers] = useState<QuizPlayer[]>(existingRoom?.quizPlayers ?? []);
  const [hostName, setHostName] = useState(existingRoom?.hostName ?? "");
  const [participants, setParticipants] = useState<string[]>(existingRoom?.participants ?? []);
  const [isStarting, setIsStarting] = useState(false);
  const [lobbyNotices, setLobbyNotices] = useState<Array<{ id: number; message: string }>>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noticeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const previousParticipantsRef = useRef<string[] | null>(null);
  const previousHostRef = useRef<string | null>(null);

  // Refs pour la gestion du popstate
  const showExitConfirmationRef = useRef(showExitConfirmation);
  const isLeavingRef = useRef(false);
  const isPopStateHandlingRef = useRef(false);
  const hasPushedHistoryRef = useRef(false);

  const isHost = userName === hostName;

  // Met à jour le ref quand showExitConfirmation change
  useEffect(() => {
    showExitConfirmationRef.current = showExitConfirmation;
  }, [showExitConfirmation]);

  // Gestion du bouton Retour - UN SEUL LISTENER, une seule fois
  useEffect(() => {
    if (!inLobby) return;

    if (!hasPushedHistoryRef.current) {
      window.history.pushState({ page: "lobby" }, "", window.location.href);
      hasPushedHistoryRef.current = true;
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();

      if (isLeavingRef.current) return;
      if (isPopStateHandlingRef.current) return;
      isPopStateHandlingRef.current = true;

      window.history.pushState({ page: "lobby" }, "", window.location.href);

      if (!showExitConfirmationRef.current) {
        setShowExitConfirmation(true);
      }

      setTimeout(() => {
        isPopStateHandlingRef.current = false;
      }, 300);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [inLobby]);

  // Nettoyage de l'historique quand on quitte le lobby
  useEffect(() => {
    if (!inLobby && hasPushedHistoryRef.current) {
      window.history.replaceState(null, "", window.location.href);
      hasPushedHistoryRef.current = false;
    }
  }, [inLobby]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const addLobbyNotices = useCallback((messages: string[]) => {
    const notices = messages.map((message) => ({ id: Date.now() + Math.random(), message }));
    setLobbyNotices((current) => [...current, ...notices]);
    notices.forEach((notice) => {
      const timeout = setTimeout(() => {
        setLobbyNotices((current) => current.filter((item) => item.id !== notice.id));
      }, 3000);
      noticeTimersRef.current.push(timeout);
    });
  }, []);

  useEffect(() => () => noticeTimersRef.current.forEach(clearTimeout), []);

  const startLobbyPolling = useCallback(
    (
      code: string,
      storedQuizPlayers: QuizPlayer[],
      storedHostName: string
    ) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/room/${code}`);
          const data = await res.json();
          if (!res.ok) return;

          const names: string[] = data.participants?.map((p: any) => p.name) ?? [];
          const updatedHostName: string = data.hostName ?? storedHostName;

          if (previousParticipantsRef.current) {
            const playersWhoLeft = previousParticipantsRef.current.filter(
              (name) => !names.includes(name)
            );
            const playersWhoJoined = names.filter(
              (name) => !previousParticipantsRef.current?.includes(name)
            );
            const messages = [
              ...playersWhoLeft.map((name) => `${name} a quitté la room.`),
              ...playersWhoJoined.map((name) => `${name} a rejoint la room.`),
            ];

            if (previousHostRef.current && previousHostRef.current !== updatedHostName) {
              messages.push(`${updatedHostName} est désormais le Host.`);
            }

            if (messages.length > 0) addLobbyNotices(messages);
          }

          previousParticipantsRef.current = names;
          previousHostRef.current = updatedHostName;
          setParticipants(names);
          setHostName(updatedHostName);

          if (data.status === "playing") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            onReady(data.quizPlayers ?? storedQuizPlayers, code, updatedHostName, names);
          }
        } catch {
          /* ignore */
        }
      }, 1000);
    },
    [onReady, addLobbyNotices]
  );

  useEffect(() => {
    if (existingRoom) {
      startLobbyPolling(existingRoom.code, existingRoom.quizPlayers, existingRoom.hostName);
    }
  }, [existingRoom?.code, startLobbyPolling]);

  const handleCreate = async () => {
    setErrorMsg("");
    setIsCreating(true);
    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur création");

      const names: string[] = data.participants ?? [userName];
      setGeneratedCode(data.code);
      setQuizPlayers(data.quizPlayers);
      setHostName(data.hostName);
      setParticipants(names);
      setInLobby(true);
      startLobbyPolling(data.code, data.quizPlayers, data.hostName);

      // ✅ Sauvegarder les infos pour le refresh
      sessionStorage.setItem("currentRoomCode", data.code);
      sessionStorage.setItem("currentUserName", userName);
      sessionStorage.setItem("isHost", "true");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (codeInput.trim().length < 6) {
      setErrorMsg("Veuillez entrer un code valide (6 caractères)");
      return;
    }
    setErrorMsg("");
    setIsJoining(true);
    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput.trim().toUpperCase(), userName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de connexion");

      const names: string[] = data.participants ?? [];
      setGeneratedCode(data.code);
      setQuizPlayers(data.quizPlayers);
      setHostName(data.hostName);
      setParticipants(names);
      setInLobby(true);
      startLobbyPolling(data.code, data.quizPlayers, data.hostName);

      // ✅ Sauvegarder les infos pour le refresh
      sessionStorage.setItem("currentRoomCode", data.code);
      sessionStorage.setItem("currentUserName", userName);
      sessionStorage.setItem("isHost", "false");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStart = async () => {
    if (participants.length < 2) {
      setErrorMsg("Au moins 2 joueurs sont nécessaires pour démarrer une partie.");
      return;
    }
    
    setIsStarting(true);
    try {
      const res = await fetch("/api/room/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: generatedCode, hostName: userName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur démarrage");
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsStarting(false);
    }
  };

  // Fonction pour quitter la room avec confirmation
  const handleCancelLobby = (confirmed: boolean = false) => {
    if (!confirmed) {
      setShowExitConfirmation(true);
      return;
    }

    isLeavingRef.current = true;

    const leaveRoom = async () => {
      try {
        const res = await fetch("/api/room/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: generatedCode, userName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Impossible de quitter la room");

        if (pollRef.current) clearInterval(pollRef.current);
        setInLobby(false);
        setGeneratedCode("");
        setQuizPlayers([]);
        setHostName("");
        setParticipants([]);
        setIsStarting(false);
        previousParticipantsRef.current = null;
        previousHostRef.current = null;
        setShowExitConfirmation(false);
        window.history.replaceState(null, "", window.location.href);
        hasPushedHistoryRef.current = false;
        isLeavingRef.current = false;

        // ✅ Nettoyer sessionStorage
        sessionStorage.removeItem("currentRoomCode");
        sessionStorage.removeItem("currentUserName");
        sessionStorage.removeItem("isHost");
      } catch (err: any) {
        setErrorMsg(err.message);
        setShowExitConfirmation(false);
        isLeavingRef.current = false;
      }
    };

    void leaveRoom();
  };

  // Fonction pour fermer le modal sans quitter
  const handleCancelExit = () => {
    setShowExitConfirmation(false);
    // Réarmer le piège en repoussant un état
    window.history.pushState({ page: "lobby" }, "", window.location.href);
  };

  if (inLobby) {
    return (
      <div className="screen-wrapper">
        <div className="screen-content fade-in space-y-4 md:space-y-5">
          <div className="text-center">
            <div className="icon-hero mx-auto">
              <FontAwesomeIcon icon={faUsers} className="pulse-icon" />
            </div>
            <h1 className="heading-lg mb-1">Salle d&apos;attente</h1>
            <p className="subtitle text-sm md:text-base">
              {isHost ? "Démarrez quand tous vos amis sont là" : "En attente que l'hôte lance la partie"}
            </p>
          </div>

          <div className="card card--accent text-center">
            <p className="text-xs md:text-sm font-semibold mb-1 md:mb-2" style={{ color: "var(--text-muted)" }}>
              Code de la partie
            </p>
            <div className="room-code glow-effect">{generatedCode}</div>
            <p className="text-[0.6rem] md:text-xs mt-2 md:mt-3" style={{ color: "var(--text-subtle)" }}>
              Partagez ce code avec vos amis
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <p className="heading-md flex items-center gap-2 text-xs md:text-sm">
                <FontAwesomeIcon icon={faGamepad} /> Joueurs connectés
              </p>
              <span className="badge">
                {participants.length} joueur{participants.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-1 md:space-y-2">
              {participants.map((name, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2 md:px-4 py-2 md:py-3 rounded-xl slide-up ${
                    name === userName ? "table-row--highlight" : ""
                  }`}
                  style={{
                    backgroundColor: name === userName ? undefined : "var(--surface-color)",
                    border: name === userName ? undefined : "1px solid var(--card-border)",
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-sm md:text-lg" style={{ color: name === hostName ? "var(--accent-color)" : "var(--text-muted)" }}>
                      <FontAwesomeIcon icon={name === hostName ? faCrown : faUser} />
                    </span>
                    <span
                      className="font-semibold text-sm md:text-base"
                      style={{ color: name === userName ? "var(--accent-color)" : "var(--text-color)" }}
                    >
                      {name}{name === userName ? " (vous)" : ""}
                    </span>
                  </div>
                  {name === hostName && <span className="badge badge--host text-[0.55rem] md:text-xs">Host</span>}
                </div>
              ))}
            </div>

            {!isHost && <div className="mt-3 md:mt-4"><LoadingDots /></div>}
          </div>

          {isHost && (
            <>
              <button
                id="btn-start-game"
                onClick={handleStart}
                disabled={isStarting || participants.length < 2}
                className={`btn btn-primary btn-block glow-effect text-sm md:text-base ${
                  isStarting || participants.length < 2 ? "btn-primary--disabled" : ""
                }`}
                title={participants.length < 2 ? "Au moins 2 joueurs sont nécessaires pour démarrer une partie" : ""}
              >
                <FontAwesomeIcon icon={isStarting ? faSpinner : faPlay} spin={isStarting} />
                {isStarting ? "Démarrage..." : "START"}
              </button>

              {participants.length < 2 && (
                <p className="text-center text-xs md:text-sm mt-2 flex items-center justify-center gap-2" 
                   style={{ color: "var(--error-color)" }}>
                  <FontAwesomeIcon icon={faCircleExclamation} />
                  Au moins 2 joueurs sont nécessaires pour démarrer une partie
                </p>
              )}
              {participants.length >= 2 && (
                <p className="text-center text-xs md:text-sm mt-2 flex items-center justify-center gap-2" 
                   style={{ color: "var(--success-color)" }}>
                  <FontAwesomeIcon icon={faCheck} />
                  {participants.length} joueurs prêts ! Lancez la partie !
                </p>
              )}
            </>
          )}

          <div className="toast-stack">
            {lobbyNotices.map((notice) => (
              <p key={notice.id} role="status" className="toast fade-in text-xs md:text-sm">
                {notice.message}
              </p>
            ))}
          </div>

          {errorMsg && (
            <p className="alert alert--error text-xs md:text-sm">
              <FontAwesomeIcon icon={faCircleExclamation} /> {errorMsg}
            </p>
          )}

          <button 
            onClick={() => handleCancelLobby(false)} 
            className="btn btn-ghost btn-block text-xs md:text-sm"
          >
            Quitter la salle
          </button>
        </div>

        {/* Modal de confirmation - composant EXTERNE */}
        {showExitConfirmation && (
          <ExitConfirmationModal
            onConfirm={() => handleCancelLobby(true)}
            onCancel={handleCancelExit}
          />
        )}
      </div>
    );
  }

  return (
    <div className="screen-wrapper">
      <div className="screen-content fade-in space-y-4 md:space-y-5">
        <div className="text-center">
          <div className="icon-hero mx-auto">
            <FontAwesomeIcon icon={faUsers} className="pulse-icon" />
          </div>
          <h1 className="heading-lg mb-1">Avec des amis</h1>
          <p className="subtitle text-sm md:text-base">Créez une partie ou rejoignez-en une</p>
        </div>

        <div className="card">
          <label htmlFor="room-code" className="label text-xs md:text-sm">
            Rejoindre avec un code :
          </label>
          <div className="flex gap-2 md:gap-3">
            <input
              id="room-code"
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
              placeholder="Ex: AB3X7Z"
              maxLength={6}
              className="input-field input-field--mono flex-1 text-xs md:text-sm"
              aria-label="Code de la room"
            />
            <button
              id="btn-join"
              onClick={handleJoin}
              disabled={isJoining || codeInput.trim().length < 6}
              className={`btn btn-primary btn-sm ${codeInput.trim().length < 6 ? "btn-primary--disabled" : ""}`}
            >
              {isJoining ? <FontAwesomeIcon icon={faSpinner} spin /> : "Rejoindre"}
            </button>
          </div>
        </div>

        <div className="divider text-xs md:text-sm">ou</div>

        <button
          id="btn-create"
          onClick={handleCreate}
          disabled={isCreating}
          className="btn btn-secondary btn-block btn-mode"
        >
          <span className="flex items-center gap-2 text-sm md:text-base">
            <FontAwesomeIcon icon={isCreating ? faSpinner : faKey} spin={isCreating} />
            {isCreating ? "Génération..." : "Générer un code"}
          </span>
          <span className="btn-mode-desc text-xs md:text-sm">Créer une nouvelle partie</span>
        </button>

        {errorMsg && (
          <p className="alert alert--error text-xs md:text-sm">
            <FontAwesomeIcon icon={faCircleExclamation} /> {errorMsg}
          </p>
        )}

        <button onClick={onBack} className="btn btn-ghost btn-block text-xs md:text-sm">
          <FontAwesomeIcon icon={faArrowLeft} /> Retour
        </button>
      </div>
    </div>
  );
}

// ─────────────── EXIT CONFIRMATION MODAL (hors de FriendLobbyScreen) ───────────────
function ExitConfirmationModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-[var(--card-bg)] border border-[var(--card-border-accent)] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="text-5xl mb-4">🚪</div>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--accent-color)] mb-3">
            Quitter la room ?
          </h2>
          <p className="text-[var(--text-muted)] text-sm md:text-base mb-6">
            Voulez-vous vraiment quitter cette room ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--surface-color)",
                border: "2px solid var(--card-border)",
                color: "var(--text-color)",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--error-color)",
                color: "white",
                cursor: "pointer",
              }}
            >
              Oui, quitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────── QUIZ SCREEN ───────────────
function QuizScreen({
  players,
  sessionId,
  userName,
  onComplete,
  onQuit,
  roomNotice,
  initialIndex = 0,
  initialAnswers = [],
  initialTime = 20,
}: {
  players: QuizPlayer[];
  sessionId: string;
  userName: string;
  onComplete: (answers: Answer[]) => void;
  onQuit?: () => void;
  roomNotice?: string;
  initialIndex?: number;
  initialAnswers?: Answer[];
  initialTime?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [userInput, setUserInput] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasProcessedRef = useRef(false);
  const timeLeftRef = useRef<number>(initialTime);
  const isTimerActiveRef = useRef(false);

  const currentPlayer = players[currentIndex];
  const isLastQuestion = currentIndex === players.length - 1;

  const processAnswer = useCallback(
    (answer: string, wasSkipped: boolean) => {
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        isTimerActiveRef.current = false;
      }

      const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const playerName = currentPlayer?.name || "";
      const userAnswer = wasSkipped ? "SKIP" : answer.trim();

      const normalizeStr = (s: string) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();

      const isCorrect =
        !wasSkipped &&
        userAnswer.length > 0 &&
        (normalizeStr(userAnswer) === normalizeStr(playerName) ||
          normalizeStr(playerName).includes(normalizeStr(userAnswer)) ||
          normalizeStr(userAnswer).includes(normalizeStr(playerName)));

      const newAnswer: Answer = {
        playerId: currentPlayer?.playerId || 0,
        playerName,
        userAnswer,
        isCorrect,
        timeSpent,
      };

      const newAnswers = [...answers, newAnswer];

      if (isLastQuestion) {
        sessionStorage.removeItem("quizState");
        setAnswers(newAnswers);
        // ✅ Soumettre le score automatiquement à la fin du quiz
        onComplete(newAnswers);
        return;
      }

      setIsTransitioning(true);
      setAnswers(newAnswers);

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setUserInput("");
        setTimeRemaining(20);
        timeLeftRef.current = 20;
        setIsTransitioning(false);
        hasProcessedRef.current = false;
        startTimeRef.current = Date.now();
        isTimerActiveRef.current = false;
        inputRef.current?.focus();
      }, 300);
    },
    [currentPlayer, answers, isLastQuestion, onComplete]
  );

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    hasProcessedRef.current = false;
    startTimeRef.current = Date.now();
    timeLeftRef.current = 20;
    setTimeRemaining(20);
    isTimerActiveRef.current = true;

    timerRef.current = setInterval(() => {
      if (!isTimerActiveRef.current) return;

      timeLeftRef.current -= 1;
      setTimeRemaining(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          isTimerActiveRef.current = false;
        }
        processAnswer("", true);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        isTimerActiveRef.current = false;
      }
    };
  }, [currentIndex]);

  useEffect(() => {
  }, [processAnswer]);

  useEffect(() => {
    const timeout = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  useEffect(() => {
    sessionStorage.setItem(
      "quizState",
      JSON.stringify({
        currentIndex,
        answers,
        timeRemaining,
        userInput,
        sessionId,
        userName,
        players,
      })
    );
  }, [currentIndex, answers, timeRemaining, userInput, sessionId, userName, players]);

  if (!currentPlayer) return null;

  const progressPercent = (currentIndex / players.length) * 100;
  const timerPercent = (timeRemaining / 20) * 100;

  return (
    <div className="min-h-screen flex flex-col p-3 md:p-8">
      {roomNotice && (
        <p
          role="status"
          className="fixed bottom-4 md:bottom-5 right-4 md:right-5 z-50 w-[min(92vw,30rem)] rounded-xl px-3 md:px-4 py-2 md:py-3 text-center text-xs md:text-sm shadow-2xl fade-in"
          style={{ color: "var(--accent-color)", backgroundColor: "var(--card-bg)", border: "1px solid rgba(255,215,0,0.35)" }}
        >
          {roomNotice}
        </p>
      )}
      <div aria-live="polite" className="sr-only">
        Question {currentIndex + 1} sur {players.length}
      </div>

      <div
        className="rounded-2xl p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-between"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          {onQuit && (
            <button
              onClick={onQuit}
              title="Retourner au menu principal"
              className="btn-football px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[0.65rem] md:text-sm font-semibold transition-all duration-200 flex items-center gap-1"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faHouse} /> <span className="hidden sm:inline">Menu</span>
            </button>
          )}
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-[0.6rem] md:text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Joueur
            </span>
            <span
              className="text-base md:text-lg font-bold"
              style={{ color: "var(--accent-color)" }}
            >
              {currentIndex + 1}/{players.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-[0.6rem] md:text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            <FontAwesomeIcon icon={faStopwatch} />
          </span>
          <div
            className="w-16 md:w-32 h-2 md:h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${timerPercent}%`,
                backgroundColor:
                  timeRemaining <= 5
                    ? "var(--error-color)"
                    : timeRemaining <= 10
                    ? "var(--accent-color)"
                    : "var(--success-color)",
              }}
            />
          </div>
          <span
            className={`text-lg md:text-2xl font-bold min-w-[2.5ch] md:min-w-[3ch] text-right ${
              timeRemaining <= 5 ? "timer-critical" : ""
            }`}
            style={{
              color:
                timeRemaining <= 5
                  ? "var(--error-color)"
                  : "var(--accent-color)",
            }}
          >
            {timeRemaining}s
          </span>
        </div>
      </div>

      <div
        className="w-full h-1.5 md:h-2 rounded-full mb-4 md:mb-8 overflow-hidden"
        style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: "var(--accent-color)",
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div
          className={`max-w-2xl w-full ${
            isTransitioning ? "opacity-0" : "fade-in"
          }`}
          style={{ transition: "opacity 0.3s ease" }}
        >
          <div
            className="rounded-2xl p-4 md:p-10 mb-4 md:mb-8 text-center"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <p
              className="text-[0.55rem] md:text-xs uppercase tracking-widest mb-3 md:mb-4"
              style={{ color: "var(--accent-color)", opacity: 0.7 }}
            >
              Parcours du joueur
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1 md:gap-3">
              {currentPlayer.career.map((club, idx) => (
                <span key={idx} className="flex items-center gap-1 md:gap-3">
                  <span
                    className="text-xs md:text-xl font-semibold px-1.5 md:px-3 py-1 md:py-1.5 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255,215,0,0.1)",
                      color: "var(--text-color)",
                      border: "1px solid rgba(255,215,0,0.2)",
                    }}
                  >
                    {club}
                  </span>
                  {idx < currentPlayer.career.length - 1 && (
                    <span
                      className="text-sm md:text-2xl"
                      style={{ color: "var(--accent-color)" }}
                    >
                      <FontAwesomeIcon icon={faRightLong} />
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl p-4 md:p-8"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <label
              htmlFor="answer-input"
              className="block text-xs md:text-sm font-medium mb-2 md:mb-3"
              style={{ color: "var(--accent-color)" }}
            >
              Qui est ce joueur ?
            </label>
            <input
              ref={inputRef}
              id="answer-input"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userInput.trim().length > 0) {
                  processAnswer(userInput, false);
                }
              }}
              placeholder="Tapez le nom du joueur..."
              className="w-full px-3 md:px-4 py-2 md:py-3 rounded-xl text-base md:text-lg outline-none mb-4 md:mb-6 transition-all duration-300"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "2px solid var(--card-border)",
                color: "var(--text-color)",
              }}
              autoComplete="off"
              aria-label="Réponse"
            />

            <div className="flex gap-2 md:gap-4">
              <button
                onClick={() => processAnswer(userInput, false)}
                disabled={userInput.trim().length === 0}
                className="btn-football flex-1 py-2 md:py-3 rounded-xl text-sm md:text-lg font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  backgroundColor:
                    userInput.trim().length > 0
                      ? "var(--accent-color)"
                      : "rgba(255,215,0,0.15)",
                  color:
                    userInput.trim().length > 0
                      ? "var(--background-color)"
                      : "rgba(255,255,255,0.3)",
                  cursor:
                    userInput.trim().length > 0 ? "pointer" : "not-allowed",
                }}
              >
                <FontAwesomeIcon icon={isLastQuestion ? faChartColumn : faRightLong} className="mr-1 md:mr-2" /> {isLastQuestion ? "VOIR RÉSULTATS" : "SUIVANT"}
              </button>

              <button
                onClick={() => processAnswer("", true)}
                className="btn-football px-3 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-lg font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                PASSER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────── RESULTS SCREEN ───────────────
function ResultsScreen({
  answers,
  sessionId,
  userName,
  onReplay,
  onHome,
}: {
  answers: Answer[];
  sessionId: string;
  userName: string;
  onReplay: () => void;
  onHome: () => void;
}) {
  const [checkedAnswers, setCheckedAnswers] = useState<boolean[]>(
    answers.map((a) => a.isCorrect)
  );
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      left: string;
      backgroundColor: string;
      animationDelay: string;
      animationDuration: string;
      width: string;
      height: string;
      borderRadius: string;
    }>
  >([]);

  const totalQuestions = answers.length;
  const totalTime = answers.reduce((acc, a) => acc + a.timeSpent, 0);
  const avgTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;
  const skipped = answers.filter((a) => a.userAnswer === "SKIP" || a.userAnswer === "").length;

  useEffect(() => {
    if (showConfetti) {
      const colors = ["#ffd700", "#44ff44", "#ff4444", "#4444ff", "#ff44ff", "#44ffff"];
      const pieces = Array.from({ length: 50 }).map(() => ({
        left: `${Math.random() * 100}%`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
      }));
      setConfettiPieces(pieces);

      const timeout = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [showConfetti]);

  const toggleCheck = (index: number) => {
    if (finalScore !== null) return;
    const newChecked = [...checkedAnswers];
    newChecked[index] = !newChecked[index];
    setCheckedAnswers(newChecked);
  };

  const confirmScore = async () => {
    const score = checkedAnswers.filter(Boolean).length;
    const verifiedAnswers = answers.map((a, i) => ({
      ...a,
      isCorrect: checkedAnswers[i],
    }));

    try {
      const response = await fetch("/api/quiz/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, verifiedAnswers }),
      });
      if (!response.ok) {
        console.warn("⚠️ Vérification des réponses échouée");
      }
    } catch (error) {
      console.error("❌ Erreur de vérification:", error);
    }

    setFinalScore(score);
    if (score >= 7) {
      setShowConfetti(true);
    }
  };

  const playerResult = {
    userName: userName,
    score: finalScore ?? 0,
    totalQuestions: totalQuestions,
    avgTimePerQuestion: avgTime,
  };

  const localLeaderboard = [playerResult];

  return (
    <div className="min-h-screen p-3 md:p-8">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map((piece, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: piece.left,
                backgroundColor: piece.backgroundColor,
                animationDelay: piece.animationDelay,
                animationDuration: piece.animationDuration,
                width: piece.width,
                height: piece.height,
                borderRadius: piece.borderRadius,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto fade-in">
        <div className="text-center mb-4 md:mb-8">
          <h1
            className="text-2xl md:text-4xl font-extrabold mb-1 md:mb-2"
            style={{ color: "var(--accent-color)" }}
          >
            📊 RÉSULTATS
          </h1>
          <p className="text-xs md:text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
            Vérifiez vos réponses et cochez les bonnes, {userName} !
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden mb-4 md:mb-6"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div
            className="grid grid-cols-12 gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-[0.6rem] md:text-sm font-bold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "var(--accent-color)",
            }}
          >
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-2 text-center">✓</div>
            <div className="col-span-4 md:col-span-4">Votre Réponse</div>
            <div className="col-span-5 md:col-span-5">Correction</div>
          </div>

          {answers.map((answer, index) => {
            const isChecked = checkedAnswers[index];
            const wasSkipped = answer.userAnswer === "SKIP" || answer.userAnswer === "";
            return (
              <div
                key={index}
                className="grid grid-cols-12 gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-4 items-center transition-all duration-300 slide-up"
                style={{
                  borderBottom: "1px solid var(--card-border)",
                  backgroundColor:
                    finalScore !== null
                      ? isChecked
                        ? "rgba(68,255,68,0.05)"
                        : "rgba(255,68,68,0.05)"
                      : "transparent",
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <div
                  className="col-span-1 text-center text-[0.6rem] md:text-sm font-bold"
                  style={{ color: "var(--accent-color)" }}
                >
                  {index + 1}
                </div>
                <div className="col-span-2 text-center">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(index)}
                    disabled={finalScore !== null}
                    aria-label={`Marquer la question ${index + 1} comme correcte`}
                  />
                </div>
                <div
                  className="col-span-4 md:col-span-4 text-[0.6rem] md:text-sm truncate"
                  style={{
                    color: wasSkipped
                      ? "rgba(255,255,255,0.3)"
                      : "var(--text-color)",
                    fontStyle: wasSkipped ? "italic" : "normal",
                  }}
                >
                  {wasSkipped ? (answer.userAnswer === "SKIP" ? "SKIP" : "-") : answer.userAnswer}
                </div>
                <div
                  className="col-span-5 md:col-span-5 text-[0.6rem] md:text-sm font-semibold"
                  style={{
                    color: isChecked
                      ? "var(--success-color)"
                      : "var(--error-color)",
                  }}
                >
                  {answer.playerName}
                </div>
              </div>
            );
          })}
        </div>

        {finalScore !== null && (
          <div
            className="rounded-2xl p-4 md:p-8 mb-4 md:mb-6 text-center score-reveal"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "2px solid var(--accent-color)",
            }}
          >
            <p
              className="text-base md:text-lg mb-1 md:mb-2"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              VOTRE SCORE
            </p>
            <p
              className="text-4xl md:text-7xl font-extrabold"
              style={{
                color:
                  finalScore >= 7
                    ? "var(--success-color)"
                    : finalScore >= 4
                    ? "var(--accent-color)"
                    : "var(--error-color)",
              }}
            >
              {finalScore}/{answers.length}
            </p>
            <p className="text-base md:text-lg mt-2 md:mt-3" style={{ color: "rgba(255,255,255,0.6)" }}>
              {finalScore === 10
                ? "🏆 Parfait ! Vous êtes un expert !"
                : finalScore >= 7
                ? "🎉 Excellent ! Bravo !"
                : finalScore >= 4
                ? "👍 Pas mal ! Continuez !"
                : "💪 Vous pouvez faire mieux !"}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
          {finalScore === null ? (
            <>
              <button
                onClick={confirmScore}
                className="btn-football flex-1 py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider glow-effect"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--background-color)",
                  cursor: "pointer",
                }}
              >
                ✅ CONFIRMER LE SCORE
              </button>
              <button
                onClick={onHome}
                className="btn-football py-3 md:py-4 px-4 md:px-6 rounded-xl text-sm md:text-lg font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  color: "var(--text-color)",
                  cursor: "pointer",
                }}
              >
                🏠 MENU
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onReplay}
                className="btn-football flex-1 py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider glow-effect"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--background-color)",
                  cursor: "pointer",
                }}
              >
                🔄 REJOUER
              </button>
              <button
                onClick={onHome}
                className="btn-football flex-1 py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  color: "var(--text-color)",
                  cursor: "pointer",
                }}
              >
                🏠 MENU PRINCIPAL
              </button>
            </>
          )}
        </div>

        {finalScore !== null && (
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8 fade-in">
            <div
              className="rounded-xl p-2 md:p-4 text-center"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <p
                className="text-lg md:text-2xl font-bold"
                style={{ color: "var(--accent-color)" }}
              >
                {avgTime.toFixed(1)}s
              </p>
              <p
                className="text-[0.5rem] md:text-xs mt-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Temps moyen
              </p>
            </div>
            <div
              className="rounded-xl p-2 md:p-4 text-center"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <p
                className="text-lg md:text-2xl font-bold"
                style={{ color: "var(--success-color)" }}
              >
                {Math.round((finalScore / answers.length) * 100)}%
              </p>
              <p
                className="text-[0.5rem] md:text-xs mt-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Taux de réussite
              </p>
            </div>
            <div
              className="rounded-xl p-2 md:p-4 text-center"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <p
                className="text-lg md:text-2xl font-bold"
                style={{ color: "var(--error-color)" }}
              >
                {skipped}
              </p>
              <p
                className="text-[0.5rem] md:text-xs mt-1"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Questions sautées
              </p>
            </div>
          </div>
        )}

        {finalScore !== null && (
          <div className="mt-4 md:mt-8 fade-in">
            <h2 className="text-base md:text-xl font-bold mb-3 md:mb-4 text-center" style={{ color: "var(--accent-color)" }}>
              🏆 CLASSEMENT DE LA PARTIE
            </h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div
                className="grid grid-cols-12 gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-[0.55rem] md:text-sm font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "var(--accent-color)",
                }}
              >
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-7 md:col-span-7">Joueur</div>
                <div className="col-span-4 text-center">Score</div>
              </div>

              {localLeaderboard.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-xs md:text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Aucun score enregistré pour cette partie
                </div>
              ) : (
                localLeaderboard.map((entry, index) => {
                  const isCurrentUser = entry.userName === userName;
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 items-center slide-up"
                      style={{
                        borderBottom: index < localLeaderboard.length - 1 ? "1px solid var(--card-border)" : "none",
                        backgroundColor: isCurrentUser ? "rgba(255,215,0,0.05)" : "transparent",
                        animationDelay: `${index * 0.05}s`,
                      }}
                    >
                      <div
                        className="col-span-1 text-center font-bold text-sm md:text-base"
                        style={{
                          color: index === 0 ? "var(--accent-color)" : "rgba(255,255,255,0.6)",
                        }}
                      >
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </div>
                      <div
                        className="col-span-7 md:col-span-7 font-medium truncate text-[0.65rem] md:text-base"
                        style={{
                          color: isCurrentUser ? "var(--accent-color)" : "var(--text-color)",
                        }}
                      >
                        {entry.userName}
                        {isCurrentUser && " ⭐"}
                      </div>
                      <div className="col-span-4 text-center font-bold text-[0.65rem] md:text-base" style={{ color: "var(--accent-color)" }}>
                        {entry.score}/{entry.totalQuestions}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────── MULTI RESULTS SCREEN (CORRIGÉ) ───────────────
function MultiResultsScreen({
  answers,
  userName,
  roomCode,
  hostName,
  participants,
  onHome,
  onReplay,
  roomNotice,
}: {
  answers: Answer[];
  userName: string;
  roomCode: string;
  hostName: string;
  participants: string[];
  onHome: () => void;
  onReplay: (
    newQuizPlayers: QuizPlayer[],
    newRoomCode: string,
    newHostName: string,
    newParticipants: string[],
    roomStatus?: string
  ) => void;
  roomNotice?: string;
}) {
  const [myFinalScore, setMyFinalScore] = useState<number | null>(null);
  const [waitingForAll, setWaitingForAll] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [roomStatus, setRoomStatus] = useState<"waiting" | "playing" | "reviewing" | "finished">("playing");
  const [participantResults, setParticipantResults] = useState<ParticipantResult[]>(
    participants.map((n) => ({
      name: n,
      score: null,
      totalQuestions: null,
      avgTimePerQuestion: null,
      done: false,
    }))
  );
  const [participantAnswers, setParticipantAnswers] = useState<{ playerName: string; answers: string[] }[]>([]);
  const [corrections, setCorrections] = useState<{ playerName: string; questionIndex: number; isCorrect: boolean }[]>([]);
  const [allVerified, setAllVerified] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      left: string;
      backgroundColor: string;
      animationDelay: string;
      animationDuration: string;
      width: string;
      height: string;
      borderRadius: string;
    }>
  >([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedRef = useRef(false);
  const hasRedirectedRef = useRef(false);
  const isHost = userName === hostName;
  const myTotal = answers.length;

  // ✅ Calculer le score automatique
  const calculatedScore = answers.filter(a => a.isCorrect).length;
  const totalTime = answers.reduce((acc, a) => acc + a.timeSpent, 0);
  const avgTime = answers.length > 0 ? totalTime / answers.length : null;

  // ✅ Obtenir les noms des joueurs (participants)
  const playerNames = participants;

  // ✅ Fonction pour vérifier si une cellule est corrigée
  const isCellCorrect = (playerName: string, questionIndex: number): boolean | null => {
    const correction = corrections.find(
      (c) => c.playerName === playerName && c.questionIndex === questionIndex
    );
    if (correction) return correction.isCorrect;
    return null;
  };

  // ✅ Fonction pour obtenir le statut d'une cellule
  const getCellStatus = (playerName: string, questionIndex: number): "correct" | "incorrect" | "neutral" => {
    const result = isCellCorrect(playerName, questionIndex);
    if (result === true) return "correct";
    if (result === false) return "incorrect";
    return "neutral";
  };

  // ✅ Fonction pour le HOST : clic sur une cellule
  const handleCellClick = (playerName: string, questionIndex: number) => {
    if (!isHost) return;
    if (roomStatus !== "reviewing") return;

    const currentStatus = getCellStatus(playerName, questionIndex);
    let newIsCorrect: boolean | null = null;

    if (currentStatus === "neutral") {
      newIsCorrect = true;
    } else if (currentStatus === "correct") {
      newIsCorrect = false;
    } else if (currentStatus === "incorrect") {
      newIsCorrect = null;
    }

    let newCorrections = corrections.filter(
      (c) => !(c.playerName === playerName && c.questionIndex === questionIndex)
    );

    if (newIsCorrect !== null) {
      newCorrections.push({
        playerName,
        questionIndex,
        isCorrect: newIsCorrect,
      });
    }

    setCorrections(newCorrections);
    saveCorrections(newCorrections);
  };

  // ✅ Sauvegarder les corrections sur le serveur
  const saveCorrections = async (newCorrections: typeof corrections) => {
    try {
      const response = await fetch("/api/room/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomCode,
          hostName: userName,
          corrections: newCorrections,
        }),
      });
      if (!response.ok) {
        console.error("Erreur sauvegarde corrections");
      }
    } catch (error) {
      console.error("Erreur sauvegarde corrections:", error);
    }
  };

  // ✅ Polling pour les mises à jour
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/room/status?code=${roomCode}`);
        const data = await res.json();
        if (!res.ok) return;

        setRoomStatus(data.status);
        setParticipantResults(data.participants || []);
        setParticipantAnswers(data.participantAnswers || []);
        setCorrections(data.corrections || []);
        setAllVerified(data.allVerified || false);

        const allDone = data.participants?.every((p: ParticipantResult) => p.done === true) || false;
        if (allDone && data.status === "reviewing") {
          setAllDone(true);
          setWaitingForAll(false);
        }

        if (data.status === "waiting" && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          onReplay(
            data.quizPlayers ?? [],
            data.code,
            data.hostName,
            data.participants?.map((p: ParticipantResult) => p.name) || [],
            data.status
          );
          return;
        }

        if (data.status === "finished") {
          setAllDone(true);
          setWaitingForAll(false);
          const finalScores = data.participants?.map((p: ParticipantResult) => ({
            ...p,
            score: p.score ?? 0,
          })) || [];
          setParticipantResults(finalScores);
        }
      } catch {
        /* ignore */
      }
    };

    pollStatus();
    pollRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [roomCode, userName, onReplay]);

  // ✅ Effet pour les confettis
  useEffect(() => {
    if (showConfetti) {
      const colors = ["#ffd700", "#44ff44", "#ff4444", "#4444ff", "#ff44ff", "#44ffff"];
      const pieces = Array.from({ length: 60 }).map(() => ({
        left: `${Math.random() * 100}%`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 2}s`,
        width: `${6 + Math.random() * 8}px`,
        height: `${6 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
      }));
      setConfettiPieces(pieces);
      const t = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  // ✅ Confirmer le score (pour les joueurs non-HOST) - Déprécié car automatique
  const confirmScore = async () => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const score = calculatedScore;

    setMyFinalScore(score);

    setParticipantResults(prev =>
      prev.map(p =>
        p.name === userName
          ? {
              ...p,
              score,
              totalQuestions: answers.length,
              avgTimePerQuestion: avgTime,
              done: true,
            }
          : p
      )
    );

    try {
      const response = await fetch("/api/room/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomCode,
          playerName: userName,
          score,
          totalQuestions: answers.length,
          avgTimePerQuestion: avgTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur soumission score:", errorData);
        if (response.status === 409) {
          console.log("Score déjà soumis");
        }
      } else {
        console.log("Score soumis avec succès");
      }
    } catch (err) {
      console.error("Erreur soumission score multi:", err);
      hasSubmittedRef.current = false;
    }

    setWaitingForAll(true);
  };

  // ✅ Confirmer les résultats (pour le HOST)
  const confirmResults = async () => {
    if (!isHost) return;
    if (!allVerified) return;

    try {
      const finalScores = participantResults.map((p) => {
        let score = 0;
        for (let i = 0; i < answers.length; i++) {
          const isCorrect = isCellCorrect(p.name, i);
          if (isCorrect === true) score++;
        }
        return {
          ...p,
          score,
          totalQuestions: answers.length,
          done: true,
        };
      });

      for (const p of finalScores) {
        if (p.name !== userName) {
          await fetch("/api/room/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: roomCode,
              playerName: p.name,
              score: p.score,
              totalQuestions: answers.length,
              avgTimePerQuestion: p.avgTimePerQuestion || 0,
            }),
          });
        }
      }

      await fetch(`/api/room/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomCode,
          status: "finished",
        }),
      });

      setParticipantResults(finalScores as ParticipantResult[]);
      setAllDone(true);
      setWaitingForAll(false);

      const sorted = [...finalScores].sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0)
      );
      if (sorted.length > 0 && sorted[0]?.name === userName) {
        setShowConfetti(true);
      }
    } catch (error) {
      console.error("Erreur confirmation résultats:", error);
    }
  };

  // ✅ Replay
  const handleReplay = async () => {
    if (isReplaying) return;
    setIsReplaying(true);
    try {
      const res = await fetch("/api/room/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: roomCode, hostName: userName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur replay");
      onReplay(data.quizPlayers, data.code, data.hostName, data.participants);
    } catch (err: any) {
      console.error("Erreur replay:", err);
      alert(err.message || "Impossible de relancer la partie");
      setIsReplaying(false);
    }
  };

  // ✅ Vérifier si tous les participants ont fini
  const allParticipantsDone = participantResults.length > 0 && participantResults.every((p) => p.done === true);

  // ✅ Compter les cellules vérifiées
  const totalCells = playerNames.length * answers.length;
  const verifiedCells = corrections.length;
  const allVerifiedCheck = verifiedCells === totalCells;

  // ✅ Trier les résultats pour le classement final
  const sortedResults = [...participantResults].sort(
    (a, b) =>
      (b.score ?? 0) - (a.score ?? 0)
  );
  const winner = allDone && sortedResults.length > 0 ? sortedResults[0] : null;

  // ✅ Rendu
  return (
    <div className="min-h-screen p-3 md:p-8">
      {roomNotice && (
        <p
          role="status"
          className="fixed bottom-4 md:bottom-5 right-4 md:right-5 z-50 w-[min(92vw,30rem)] rounded-xl px-3 md:px-4 py-2 md:py-3 text-center text-xs md:text-sm shadow-2xl fade-in"
          style={{ color: "var(--accent-color)", backgroundColor: "var(--card-bg)", border: "1px solid rgba(255,215,0,0.35)" }}
        >
          {roomNotice}
        </p>
      )}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map((piece, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: piece.left,
                backgroundColor: piece.backgroundColor,
                animationDelay: piece.animationDelay,
                animationDuration: piece.animationDuration,
                width: piece.width,
                height: piece.height,
                borderRadius: piece.borderRadius,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto fade-in space-y-4 md:space-y-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold mb-1" style={{ color: "var(--accent-color)" }}>
            📊 RÉSULTATS
          </h1>
          <p className="text-xs md:text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            Mode multijoueur — Room {roomCode}
            {isHost && roomStatus === "reviewing" && " 🔑 Vous êtes le HOST - Validez les réponses"}
          </p>
        </div>

        {/* ─── ÉCRAN D'ATTENTE ─── */}
        {!allDone && (
          <>
            <div
              className="rounded-2xl p-4 md:p-8 text-center space-y-3 md:space-y-4"
              style={{ backgroundColor: "var(--card-bg)", border: "2px solid var(--accent-color)" }}
            >
              <div className="text-3xl md:text-4xl animate-bounce">⏳</div>
              {myFinalScore !== null && (
                <p className="text-lg md:text-xl font-bold" style={{ color: "var(--accent-color)" }}>
                  Votre score : {myFinalScore}/{myTotal}
                </p>
              )}
              <p className="text-xs md:text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
                {allParticipantsDone ? "Tous les joueurs ont terminé !" : "En attente que tous les joueurs terminent..."}
              </p>

              <div className="space-y-1 md:space-y-2 text-left max-w-md mx-auto">
                {participantResults.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm"
                    style={{
                      backgroundColor: p.name === userName ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-sm md:text-base">{p.name === hostName ? "👑" : "👤"}</span>
                      <span
                        className="font-medium text-xs md:text-sm"
                        style={{ color: p.name === userName ? "var(--accent-color)" : "var(--text-color)" }}
                      >
                        {p.name}
                        {p.name === userName ? " (vous)" : ""}
                      </span>
                    </div>
                    <span
                      className="text-[0.55rem] md:text-sm font-semibold"
                      style={{ color: p.done ? "var(--success-color)" : "rgba(255,255,255,0.35)" }}
                    >
                      {p.done ? `${p.score}/${p.totalQuestions} ✓ TERMINÉ` : "En cours..."}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-2 pt-1 md:pt-2">
                <span
                  className="inline-block w-1.5 md:w-2 h-1.5 md:h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--accent-color)", animationDelay: "0s" }}
                />
                <span
                  className="inline-block w-1.5 md:w-2 h-1.5 md:h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--accent-color)", animationDelay: "0.2s" }}
                />
                <span
                  className="inline-block w-1.5 md:w-2 h-1.5 md:h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: "var(--accent-color)", animationDelay: "0.4s" }}
                />
              </div>
            </div>

            {/* ✅ Le bouton CONFIRMER n'apparaît que si le joueur n'a PAS encore soumis son score */}
            {myFinalScore === null && !hasSubmittedRef.current && (
              <button
                onClick={confirmScore}
                disabled={hasSubmittedRef.current}
                className={`btn-football w-full py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider glow-effect ${
                  hasSubmittedRef.current ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: hasSubmittedRef.current ? "var(--text-subtle)" : "var(--accent-color)",
                  color: "var(--background-color)",
                  cursor: hasSubmittedRef.current ? "not-allowed" : "pointer",
                }}
              >
                {hasSubmittedRef.current ? "⏳ Envoi en cours..." : `✅ CONFIRMER MON SCORE (${calculatedScore}/${myTotal})`}
              </button>
            )}

            {/* ✅ Message quand le joueur a déjà soumis son score */}
            {myFinalScore !== null && (
              <div
                className="rounded-xl p-3 md:p-4 text-center"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid var(--success-color)",
                }}
              >
                <p className="text-sm md:text-base font-semibold" style={{ color: "var(--success-color)" }}>
                  ✅ Score soumis : {myFinalScore}/{myTotal}
                </p>
              </div>
            )}
          </>
        )}

        {/* ─── ÉCRAN DE CORRECTION (HOST) ─── */}
        {allDone && roomStatus === "reviewing" && (
          <>
            <div className="text-center">
              <p className="text-xs md:text-sm" style={{ color: "var(--text-muted)" }}>
                {isHost ? (
                  "👆 Cliquez sur une réponse pour la valider (vert = correct, rouge = faux)"
                ) : (
                  "⏳ Le HOST valide les réponses..."
                )}
              </p>
              {isHost && (
                <p className="text-xs mt-1" style={{ color: "var(--text-subtle)" }}>
                  {verifiedCells}/{totalCells} réponses vérifiées
                </p>
              )}
            </div>

            {/* Tableau des corrections */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
              {/* En-tête du tableau */}
              <div
                className="grid grid-cols-12 gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 text-[0.55rem] md:text-sm font-bold uppercase tracking-wider"
                style={{ backgroundColor: "var(--primary-color)", color: "var(--accent-color)" }}
              >
                <div className="col-span-1 text-center">#</div>
                {playerNames.map((name) => (
                  <div key={name} className="col-span-2 text-center truncate" title={name}>
                    {name === hostName ? "👑 " : ""}{name}
                  </div>
                ))}
                <div className="col-span-1 text-center">✓</div>
              </div>

              {/* Lignes du tableau */}
              {answers.map((answer, questionIndex) => {
                const correctAnswer = answer.playerName;
                return (
                  <div
                    key={questionIndex}
                    className="grid grid-cols-12 gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 items-center transition-all duration-300 slide-up"
                    style={{
                      borderBottom: questionIndex < answers.length - 1 ? "1px solid var(--card-border)" : "none",
                      animationDelay: `${questionIndex * 0.05}s`,
                    }}
                  >
                    <div className="col-span-1 text-center text-[0.6rem] md:text-sm font-bold" style={{ color: "var(--accent-color)" }}>
                      {questionIndex + 1}
                    </div>

                    {playerNames.map((playerName) => {
                      const status = getCellStatus(playerName, questionIndex);
                      
                      let playerAnswer = "";
                      if (playerName === hostName) {
                        const hostAnswer = answers[questionIndex];
                        playerAnswer = hostAnswer.userAnswer;
                      } else {
                        // Pour les autres joueurs, chercher dans participantAnswers
                        const playerAnswersData = participantAnswers.find(
                          (p) => p.playerName === playerName
                        );
                        if (playerAnswersData && playerAnswersData.answers[questionIndex]) {
                          playerAnswer = playerAnswersData.answers[questionIndex];
                        } else {
                          playerAnswer = "?";
                        }
                      }

                      const isCorrect = status === "correct";
                      const isIncorrect = status === "incorrect";
                      const isNeutral = status === "neutral";

                      let bgColor = "rgba(255,255,255,0.03)";
                      let textColor = "var(--text-color)";
                      let borderColor = "transparent";
                      let cursor = "default";

                      if (isCorrect) {
                        bgColor = "rgba(34, 197, 94, 0.15)";
                        textColor = "var(--success-color)";
                        borderColor = "var(--success-color)";
                      } else if (isIncorrect) {
                        bgColor = "rgba(239, 68, 68, 0.15)";
                        textColor = "var(--error-color)";
                        borderColor = "var(--error-color)";
                      } else if (isNeutral) {
                        bgColor = "rgba(255,255,255,0.03)";
                        textColor = "rgba(255,255,255,0.3)";
                        borderColor = "transparent";
                      }

                      const isClickable = isHost && roomStatus === "reviewing";

                      return (
                        <div
                          key={playerName}
                          className="col-span-2 text-center text-[0.6rem] md:text-sm truncate rounded-lg px-1 py-1 md:py-2 transition-all duration-200"
                          style={{
                            backgroundColor: bgColor,
                            color: textColor,
                            border: `1px solid ${borderColor}`,
                            cursor: isClickable ? "pointer" : "default",
                            minHeight: "2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            if (isClickable) {
                              handleCellClick(playerName, questionIndex);
                            }
                          }}
                          title={isClickable ? "Cliquez pour valider (vert = correct, rouge = faux)" : ""}
                        >
                          {isCorrect && "🟢 "}
                          {isIncorrect && "🔴 "}
                          {isNeutral && "⚪ "}
                          {playerAnswer === "SKIP" || playerAnswer === "" ? "SKIP" : playerAnswer}
                        </div>
                      );
                    })}

                    <div className="col-span-1 text-center text-[0.6rem] md:text-sm font-semibold" style={{ color: "var(--success-color)" }}>
                      {correctAnswer}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-xs md:text-sm">
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", border: "1px solid var(--success-color)" }}></span>
                Correct ✅
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--error-color)" }}></span>
                Faux ❌
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid transparent" }}></span>
                Non vérifié ⚪
              </span>
            </div>

            {/* Bouton CONFIRMER pour le HOST */}
            {isHost && (
              <button
                onClick={confirmResults}
                disabled={!allVerifiedCheck}
                className={`btn-football w-full py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider glow-effect ${
                  !allVerifiedCheck ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: allVerifiedCheck ? "var(--accent-color)" : "var(--text-subtle)",
                  color: "var(--background-color)",
                  cursor: allVerifiedCheck ? "pointer" : "not-allowed",
                }}
              >
                {allVerifiedCheck ? "✅ CONFIRMER LES RÉSULTATS" : `⏳ ${verifiedCells}/${totalCells} vérifiés`}
              </button>
            )}

            {/* Message pour les non-HOST */}
            {!isHost && (
              <p className="text-center text-xs md:text-sm" style={{ color: "var(--text-muted)" }}>
                ⏳ Le HOST valide les réponses... ({verifiedCells}/{totalCells} vérifiées)
              </p>
            )}
          </>
        )}

        {/* ─── RÉSULTATS FINAUX ─── */}
        {allDone && roomStatus === "finished" && (
          <>
            <div
              className="rounded-2xl p-4 md:p-6 text-center space-y-3 md:space-y-4 score-reveal"
              style={{
                backgroundColor: "var(--card-bg)",
                border:
                  winner && winner.name === userName
                    ? "2px solid var(--success-color)"
                    : "2px solid var(--accent-color)",
              }}
            >
              <h2 className="text-xl md:text-2xl font-extrabold" style={{ color: "var(--accent-color)" }}>
                🏆 RÉSULTAT FINAL
              </h2>

              {winner && winner.name === userName && (
                <p className="text-xl md:text-2xl font-extrabold" style={{ color: "var(--success-color)" }}>
                  🎉 Vous avez gagné !
                </p>
              )}
              {winner && winner.name !== userName && (
                <p className="text-xl md:text-2xl font-extrabold" style={{ color: "var(--accent-color)" }}>
                  🏆 Victoire de <span style={{ color: "var(--accent-color)" }}>{winner.name}</span> !
                </p>
              )}

              <div className="space-y-1 md:space-y-2 text-left mt-2 md:mt-4">
                {sortedResults.map((p, idx) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const rank = medals[idx] ?? `#${idx + 1}`;
                  const isMe = p.name === userName;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-3 rounded-xl text-xs md:text-sm"
                      style={{
                        backgroundColor: isMe ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
                        border: isMe ? "1px solid rgba(255,215,0,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-1 md:gap-3">
                        <span className="text-base md:text-xl min-w-[1.5ch] md:min-w-[2ch]">{rank}</span>
                        <span className="text-sm md:text-base">{p.name === hostName ? "👑" : "👤"}</span>
                        <span
                          className="font-semibold text-xs md:text-sm"
                          style={{ color: isMe ? "var(--accent-color)" : "var(--text-color)" }}
                        >
                          {p.name}
                          {isMe ? " (vous)" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-4">
                        <span
                          className="text-base md:text-xl font-extrabold"
                          style={{
                            color:
                              idx === 0
                                ? "var(--success-color)"
                                : isMe
                                ? "var(--accent-color)"
                                : "var(--text-color)",
                          }}
                        >
                          {p.score ?? "?"}/{p.totalQuestions ?? myTotal}
                        </span>
                        <span className="text-[0.55rem] md:text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                          ⏱️ {typeof p.avgTimePerQuestion === "number" ? `${p.avgTimePerQuestion.toFixed(1)}s` : "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boutons REJOUER / MENU */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {isHost && (
                <button
                  onClick={handleReplay}
                  disabled={isReplaying}
                  className="btn-football flex-1 py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider glow-effect"
                  style={{
                    backgroundColor: isReplaying ? "rgba(255,215,0,0.4)" : "var(--accent-color)",
                    color: "var(--background-color)",
                    cursor: isReplaying ? "wait" : "pointer",
                  }}
                >
                  {isReplaying ? "⏳ Rechargement..." : "🔄 REJOUER"}
                </button>
              )}
              <button
                onClick={onHome}
                className="btn-football flex-1 py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "2px solid rgba(255,255,255,0.2)",
                  color: "var(--text-color)",
                  cursor: "pointer",
                }}
              >
                🏠 MENU PRINCIPAL
              </button>
            </div>

            {!isHost && (
              <p className="text-center text-[0.6rem] md:text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                💡 Seul l'hôte peut relancer une partie
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────── LOADING SCREEN ───────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center fade-in">
        <div className="text-4xl md:text-6xl mb-4 md:mb-6 animate-bounce">⚽</div>
        <p className="text-lg md:text-xl font-semibold" style={{ color: "var(--accent-color)" }}>
          Chargement du quiz...
        </p>
        <div
          className="mt-3 md:mt-4 w-32 md:w-48 h-1.5 md:h-2 rounded-full mx-auto overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: "var(--accent-color)",
              animation: "progress-shrink 2s ease-in-out infinite alternate-reverse",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────── ERROR SCREEN ───────────────
function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4">
      <div className="text-center fade-in max-w-md">
        <div className="text-4xl md:text-6xl mb-4 md:mb-6">😢</div>
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: "var(--error-color)" }}>
          Oops ! Une erreur est survenue
        </h2>
        <p className="text-sm md:text-base mb-4 md:mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
          {message}
        </p>
        <button
          onClick={onRetry}
          className="btn-football px-6 md:px-8 py-2 md:py-3 rounded-xl text-base md:text-lg font-bold"
          style={{
            backgroundColor: "var(--accent-color)",
            color: "var(--background-color)",
            cursor: "pointer",
          }}
        >
          🔄 Réessayer
        </button>
      </div>
    </div>
  );
}

// ─────────────── ALL COMPLETED SCREEN ───────────────
function AllCompletedScreen({ onHome }: { onHome: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4">
      <div className="text-center fade-in max-w-md">
        <div className="text-6xl md:text-8xl mb-4 md:mb-6">🏅</div>
        <h2 className="text-2xl md:text-4xl font-extrabold mb-3 md:mb-4" style={{ color: "var(--accent-color)" }}>
          Bravo, Champion !
        </h2>
        <p className="text-base md:text-lg mb-2 md:mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
          Tu as vu{" "}
          <strong style={{ color: "var(--accent-color)" }}>
            tous les joueurs disponibles
          </strong>{" "}
          de la session !
        </p>
        <p className="text-xs md:text-sm mb-6 md:mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
          L'historique sera réinitialisé lors de ta prochaine partie.
        </p>
        <button
          onClick={onHome}
          className="btn-football px-6 md:px-10 py-3 md:py-4 rounded-xl text-base md:text-xl font-bold uppercase tracking-wider glow-effect"
          style={{
            backgroundColor: "var(--accent-color)",
            color: "var(--background-color)",
            cursor: "pointer",
          }}
        >
          🏠 Menu Principal
        </button>
      </div>
    </div>
  );
}

// ─────────────── MAIN APP ───────────────
type Screen =
  | "welcome"
  | "modeSelect"
  | "friendLobby"
  | "loading"
  | "quiz"
  | "results"
  | "multiResults"
  | "error"
  | "allCompleted";

type RoomLobby = {
  code: string;
  quizPlayers: QuizPlayer[];
  hostName: string;
  participants: string[];
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [userName, setUserName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [players, setPlayers] = useState<QuizPlayer[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [usedPlayerIds, setUsedPlayerIds] = useState<number[]>([]);

  const [roomCode, setRoomCode] = useState("");
  const [roomHostName, setRoomHostName] = useState("");
  const [roomParticipants, setRoomParticipants] = useState<string[]>([]);
  const [roomLobby, setRoomLobby] = useState<RoomLobby | null>(null);
  const [roomNotice, setRoomNotice] = useState("");
  const previousLiveParticipantsRef = useRef<string[] | null>(null);
  const previousLiveHostRef = useRef<string | null>(null);

  // ✅ Nettoyer la room au chargement si le Host a refresh
  useEffect(() => {
    const savedRoomCode = sessionStorage.getItem("currentRoomCode");
    const savedUserName = sessionStorage.getItem("currentUserName");
    const savedIsHost = sessionStorage.getItem("isHost") === "true";

    if (savedRoomCode && savedUserName && savedIsHost) {
      const leaveRoomOnRefresh = async () => {
        try {
          await fetch("/api/room/leave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: savedRoomCode, userName: savedUserName }),
          });
          console.log("🧹 Room nettoyée après refresh");
        } catch (error) {
          console.error("Erreur nettoyage room après refresh:", error);
        }
      };

      void leaveRoomOnRefresh();
    }

    sessionStorage.removeItem("currentRoomCode");
    sessionStorage.removeItem("currentUserName");
    sessionStorage.removeItem("isHost");
  }, []);

  // ✅ Détecter quand l'utilisateur ferme l'onglet ou le navigateur
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const savedRoomCode = sessionStorage.getItem("currentRoomCode");
      const savedUserName = sessionStorage.getItem("currentUserName");

      if (savedRoomCode && savedUserName) {
        try {
          await fetch("/api/room/leave", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: savedRoomCode, userName: savedUserName }),
          });
          console.log("🧹 Room nettoyée avant fermeture");
        } catch (error) {
          console.error("Erreur nettoyage room avant fermeture:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Restaurer l'état du quiz depuis sessionStorage au chargement
  useEffect(() => {
    const savedState = sessionStorage.getItem("quizState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.players && parsed.players.length > 0) {
          setPlayers(parsed.players);
          setSessionId(parsed.sessionId);
          setUserName(parsed.userName);
          setAnswers(parsed.answers || []);
          setScreen("quiz");
        }
      } catch (e) {
        console.warn("Impossible de restaurer l'état du quiz", e);
        sessionStorage.removeItem("quizState");
      }
    }
  }, []);

  useEffect(() => {
    if ((screen !== "quiz" && screen !== "multiResults") || !roomCode) return;

    const pollRoom = async () => {
      try {
        const response = await fetch(`/api/room/${roomCode}`);
        const data = await response.json();
        if (!response.ok) return;

        const names: string[] = data.participants?.map((participant: ParticipantResult) => participant.name) ?? [];
        const messages: string[] = [];
        if (previousLiveParticipantsRef.current) {
          previousLiveParticipantsRef.current
            .filter((name) => !names.includes(name))
            .forEach((name) => messages.push(`${name} a quitté la room.`));
          if (previousLiveHostRef.current && previousLiveHostRef.current !== data.hostName) {
            messages.push(`${data.hostName} est désormais le Host.`);
          }
        }
        if (messages.length > 0) setRoomNotice(messages.join(" "));
        previousLiveParticipantsRef.current = names;
        previousLiveHostRef.current = data.hostName;
        setRoomParticipants(names);
        setRoomHostName(data.hostName);
      } catch {
        /* ignore temporary network failures */
      }
    };

    void pollRoom();
    const interval = setInterval(() => void pollRoom(), 1000);
    return () => clearInterval(interval);
  }, [screen, roomCode]);

  useEffect(() => {
    if (!roomNotice) return;
    const timeout = setTimeout(() => setRoomNotice(""), 3000);
    return () => clearTimeout(timeout);
  }, [roomNotice]);

  const startSoloQuiz = async (name: string, excludeIds: number[] = []) => {
    setUserName(name);
    setScreen("loading");

    try {
      await fetch("/api/seed", { method: "POST" });

      const startRes = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: name }),
      });

      if (!startRes.ok) throw new Error("Impossible de démarrer le quiz");
      const startData = await startRes.json();
      setSessionId(startData.sessionId);

      const excludeParam = excludeIds.length > 0 ? `?exclude=${excludeIds.join(",")}` : "";
      const playersRes = await fetch(`/api/players${excludeParam}`);
      if (!playersRes.ok) throw new Error("Impossible de charger les joueurs");
      const playersData = await playersRes.json();

      if (!playersData.players || playersData.players.length === 0) {
        setScreen("allCompleted");
        return;
      }

      const newUsedIds = [
        ...excludeIds,
        ...playersData.players.map((p: QuizPlayer) => p.playerId),
      ];
      setUsedPlayerIds(newUsedIds);

      setPlayers(playersData.players);
      setScreen("quiz");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setErrorMessage(msg);
      setScreen("error");
    }
  };

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setScreen("modeSelect");
  };

  const handleSoloMode = () => {
    startSoloQuiz(userName);
  };

  const handleFriendsReady = (
    roomQuizPlayers: QuizPlayer[],
    code: string,
    host: string,
    allParticipants: string[]
  ) => {
    setRoomLobby(null);
    setPlayers(uniqueQuizPlayers(roomQuizPlayers));
    setRoomCode(code);
    setRoomHostName(host);
    setRoomParticipants(allParticipants);
    setSessionId(`multi-${code}-${userName}`);
    setScreen("quiz");
  };

  const handleMultiReplay = (
    newQuizPlayers: QuizPlayer[],
    newRoomCode: string,
    newHostName: string,
    newParticipants: string[],
    roomStatus = "waiting"
  ) => {
    const uniquePlayers = uniqueQuizPlayers(newQuizPlayers);
    setRoomLobby(
      roomStatus === "waiting"
        ? {
            code: newRoomCode,
            quizPlayers: uniquePlayers,
            hostName: newHostName,
            participants: newParticipants,
          }
        : null
    );
    setPlayers(uniquePlayers);
    setRoomCode(newRoomCode);
    setRoomHostName(newHostName);
    setRoomParticipants(newParticipants);
    setSessionId(`multi-${newRoomCode}-${userName}`);
    setAnswers([]);
    setScreen(roomStatus === "playing" ? "quiz" : "friendLobby");
  };

  const handleQuizComplete = async (quizAnswers: Answer[]) => {
    setAnswers(quizAnswers);

    if (!roomCode) {
      try {
        const response = await fetch("/api/quiz/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userName,
            answers: quizAnswers,
          }),
        });

        if (!response.ok) {
          console.warn("⚠️ Sauvegarde des résultats échouée (status:", response.status, ")");
        }
      } catch (error) {
        console.error("❌ Erreur de sauvegarde:", error);
      }
      setScreen("results");
    } else {
      // ✅ Mode multijoueur : soumettre automatiquement le score
      try {
        const score = quizAnswers.filter(a => a.isCorrect).length;
        const totalTime = quizAnswers.reduce((acc, a) => acc + a.timeSpent, 0);
        const avgTime = quizAnswers.length > 0 ? totalTime / quizAnswers.length : 0;

        await fetch("/api/room/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: roomCode,
            playerName: userName,
            score,
            totalQuestions: quizAnswers.length,
            avgTimePerQuestion: avgTime,
          }),
        });

        console.log("✅ Score soumis automatiquement pour", userName);
      } catch (error) {
        console.error("❌ Erreur soumission automatique du score:", error);
      }

      setScreen("multiResults");
    }
  };

  const handleReplay = () => {
    setSessionId("");
    setPlayers([]);
    setAnswers([]);
    setErrorMessage("");
    setRoomCode("");
    startSoloQuiz(userName, usedPlayerIds);
  };

  const handleGoHome = async () => {
    if (roomCode) {
      try {
        await fetch("/api/room/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: roomCode, userName }),
        });
      } catch {
        /* Leaving locally remains possible if the network is unavailable. */
      }
    }
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("quizState");
    }
    setSessionId("");
    setPlayers([]);
    setAnswers([]);
    setErrorMessage("");
    setUsedPlayerIds([]);
    setRoomCode("");
    setRoomHostName("");
    setRoomParticipants([]);
    setRoomLobby(null);
    setRoomNotice("");
    previousLiveParticipantsRef.current = null;
    previousLiveHostRef.current = null;
    setScreen("welcome");
  };

  switch (screen) {
    case "welcome":
      return <WelcomeScreen onStart={handleNameSubmit} />;
    case "modeSelect":
      return (
        <ModeSelectScreen
          userName={userName}
          onSolo={handleSoloMode}
          onFriends={() => setScreen("friendLobby")}
          onBack={() => setScreen("welcome")}
        />
      );
    case "friendLobby":
      return (
        <FriendLobbyScreen
          userName={userName}
          onReady={handleFriendsReady}
          onBack={() => setScreen("modeSelect")}
          existingRoom={roomLobby}
        />
      );
    case "loading":
      return <LoadingScreen />;
    case "quiz":
      return (
        <QuizScreen
          players={players}
          sessionId={sessionId}
          userName={userName}
          onComplete={handleQuizComplete}
          onQuit={handleGoHome}
          roomNotice={roomNotice}
        />
      );
    case "results":
      return (
        <ResultsScreen
          answers={answers}
          sessionId={sessionId}
          userName={userName}
          onReplay={handleReplay}
          onHome={handleGoHome}
        />
      );
    case "multiResults":
      return (
        <MultiResultsScreen
          answers={answers}
          userName={userName}
          roomCode={roomCode}
          hostName={roomHostName}
          participants={roomParticipants}
          onHome={handleGoHome}
          onReplay={handleMultiReplay}
          roomNotice={roomNotice}
        />
      );
    case "allCompleted":
      return <AllCompletedScreen onHome={handleGoHome} />;
    case "error":
      return <ErrorScreen message={errorMessage} onRetry={handleReplay} />;
    default:
      return <WelcomeScreen onStart={handleNameSubmit} />;
  }
}