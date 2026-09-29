import {
  AudioWaveform,
  BookOpen,
  CheckCircle2,
  Drum,
  Mic,
  MoveVertical,
  Puzzle,
  RotateCcw,
  Search,
  Square,
  Volume2,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { SoundCategory } from "../lib/progress";
import { canRecord, playBeat, playDrum, playTone, speak, useMicLevel } from "../lib/sound";
import { Mascot } from "./site-shell";

export type ActivityProps = {
  completed: boolean;
  onAnswer: (category: SoundCategory | null, correct: boolean) => void;
  onComplete: () => void;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = temp;
  }
  return copy;
}

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)] as T;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Wraps an activity with its title, a "completed" chip, and a finished screen
// with a Play again button that restarts the activity from scratch.
function ActivityCard({
  icon: Icon,
  violet = false,
  title,
  copy,
  completed,
  children,
}: {
  icon: LucideIcon;
  violet?: boolean;
  title: string;
  copy: string;
  completed: boolean;
  children: (finish: () => void) => ReactNode;
}) {
  const { t } = useTranslation();
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState(false);
  return (
    <section className="activity-card">
      <div className="activity-title">
        <span className={`feature-icon ${violet ? "feature-violet" : ""}`}>
          <Icon />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
        {completed && (
          <span className="completed-chip">
            <CheckCircle2 size={16} /> {t("practice.completed")}
          </span>
        )}
      </div>
      {finished ? (
        <div className="activity-done">
          <span className="done-emoji" aria-hidden>
            🎉
          </span>
          <h3>{t("practice.done_title")}</h3>
          <p>{t("practice.done_copy")}</p>
          <button
            className="button button-quiet"
            onClick={() => {
              setFinished(false);
              setRun(run + 1);
            }}
          >
            <RotateCcw size={18} /> {t("practice.play_again")}
          </button>
        </div>
      ) : (
        <div key={run}>{children(() => setFinished(true))}</div>
      )}
    </section>
  );
}

function Counter({ current, total }: { current: number; total: number }) {
  const { t } = useTranslation();
  return (
    <div className="question-line">
      <strong>{t("practice.round_of", { current, total })}</strong>
      <span className="round-dots" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <i
            key={i}
            className={i < current - 1 ? "dot-done" : i === current - 1 ? "dot-now" : ""}
          />
        ))}
      </span>
    </div>
  );
}

// Shared flow for "listen, then pick an answer" games: the child must play the
// sound first, a wrong answer lets them listen and try again, and a right answer
// moves to the next round.
function useRounds<Q>(makeQuestions: () => Q[], props: ActivityProps, finish: () => void) {
  const questions = useMemo(makeQuestions, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [index, setIndex] = useState(0);
  const [heard, setHeard] = useState(false);
  const [locked, setLocked] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);

  const answer = async (choice: string, correctChoice: string, category: SoundCategory | null) => {
    if (locked) return;
    const correct = choice === correctChoice;
    props.onAnswer(category, correct);
    if (!correct) {
      setWrong(choice);
      return;
    }
    setWrong(null);
    setRight(choice);
    setLocked(true);
    await wait(900);
    setRight(null);
    setLocked(false);
    setHeard(false);
    if (index + 1 >= questions.length) {
      props.onComplete();
      finish();
    } else setIndex(index + 1);
  };

  return {
    question: questions[index] as Q,
    round: index + 1,
    total: questions.length,
    heard,
    setHeard,
    locked,
    answer,
    stateOf: (choice: string) =>
      right === choice ? "answer-right" : wrong === choice ? "answer-wrong" : "",
  };
}

/* ---------- Module 1: Sound Explorer ---------- */

const ROUND_WORDS = ["maluma", "moolooma", "baloomba", "oomama", "lomoo", "nomulu"];
const SPIKY_WORDS = ["takete", "kitiki", "tizik", "pikiti", "zeeteek", "kaytee"];

export function RoundOrSpiky(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={AudioWaveform}
      title={t("practice.card1_title")}
      copy={t("practice.card1_copy")}
      completed={props.completed}
    >
      {(finish) => <RoundOrSpikyGame {...props} finish={finish} />}
    </ActivityCard>
  );
}

function RoundOrSpikyGame(props: ActivityProps & { finish: () => void }) {
  const { t } = useTranslation();
  const game = useRounds(
    () =>
      shuffle(["round", "round", "round", "spiky", "spiky", "spiky"]).map((kind) => ({
        kind,
        word: pick(kind === "round" ? ROUND_WORDS : SPIKY_WORDS),
      })),
    props,
    props.finish,
  );
  const play = async () => {
    const { kind, word } = game.question;
    if (kind === "round") {
      await playTone({ frequency: 260, glideTo: 190, duration: 0.7, volume: 0.22 });
      await speak(word, { rate: 0.7, pitch: 0.8 });
    } else {
      for (let i = 0; i < 3; i++) {
        await playTone({ frequency: 1100, duration: 0.07, type: "square", volume: 0.08 });
      }
      await speak(word, { rate: 1.15, pitch: 1.4 });
    }
    game.setHeard(true);
  };
  const category = game.question.kind === "round" ? "rounded" : "sharp";
  return (
    <>
      <Counter current={game.round} total={game.total} />
      <button className="button button-primary" onClick={play}>
        <Volume2 /> {t("practice.play_sound")}
      </button>
      <div className="answer-grid">
        {(["round", "spiky"] as const).map((choice) => (
          <button
            key={choice}
            className={game.stateOf(choice)}
            disabled={!game.heard || game.locked}
            onClick={() => game.answer(choice, game.question.kind, category)}
          >
            <Mascot kind={choice === "round" ? "bouba" : "kiki"} small />
            <strong>
              {t(choice === "round" ? "practice.answer_round" : "practice.answer_spiky")}
            </strong>
          </button>
        ))}
      </div>
      {!game.heard && <p className="hint">{t("practice.listen_first")}</p>}
    </>
  );
}

export function ShortOrLong(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={Search}
      violet
      title={t("practice.card2_title")}
      copy={t("practice.card2_copy")}
      completed={props.completed}
    >
      {(finish) => (
        <ListenAndChoose
          {...props}
          finish={finish}
          category="blend"
          question={t("practice.question_short_long")}
          choices={[
            ["short", t("practice.answer_short")],
            ["long", t("practice.answer_long")],
          ]}
          makeQuestions={() =>
            shuffle(["short", "short", "short", "long", "long", "long"]).map((kind) => ({
              kind,
              frequency: pick([262, 330, 392]),
            }))
          }
          play={({ kind, frequency }) =>
            playTone({ frequency, duration: kind === "short" ? 0.25 : 1.4, volume: 0.22 })
          }
        />
      )}
    </ActivityCard>
  );
}

type ToneQuestion = { kind: string; frequency: number };

function ListenAndChoose(
  props: ActivityProps & {
    finish: () => void;
    category: SoundCategory;
    question: string;
    choices: Array<[string, string]>;
    makeQuestions: () => ToneQuestion[];
    play: (q: ToneQuestion) => Promise<void>;
  },
) {
  const { t } = useTranslation();
  const game = useRounds(props.makeQuestions, props, props.finish);
  return (
    <>
      <Counter current={game.round} total={game.total} />
      <button
        className="button button-violet"
        onClick={async () => {
          await props.play(game.question);
          game.setHeard(true);
        }}
      >
        <Volume2 /> {t("practice.play_sound")}
      </button>
      <h3>{props.question}</h3>
      <div className="answer-grid text-only">
        {props.choices.map(([value, label]) => (
          <button
            key={value}
            className={game.stateOf(value)}
            disabled={!game.heard || game.locked}
            onClick={() => game.answer(value, game.question.kind, props.category)}
          >
            {label}
          </button>
        ))}
      </div>
      {!game.heard && <p className="hint">{t("practice.listen_first")}</p>}
    </>
  );
}

/* ---------- Module 2: Breath Builder ---------- */

const BALLOONS = 3;
const SECONDS_PER_BALLOON = 2.5;

export function BalloonBreath(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={Wind}
      title={t("practice.a3_title")}
      copy={t("practice.a3_copy")}
      completed={props.completed}
    >
      {(finish) => <BalloonGame {...props} finish={finish} />}
    </ActivityCard>
  );
}

function BalloonGame({ onComplete, finish }: ActivityProps & { finish: () => void }) {
  const { t } = useTranslation();
  const mic = useMicLevel();
  const [holding, setHolding] = useState(false);
  const [balloon, setBalloon] = useState(1);
  const [fill, setFill] = useState(0);
  const [popped, setPopped] = useState(false);
  const soundOn = mic.voiced || holding;
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  // One steady timer that checks for sound, so a flickering voice still adds up.
  useEffect(() => {
    if (popped) return;
    const timer = setInterval(() => {
      if (soundOnRef.current) setFill((f) => Math.min(1, f + 0.1 / SECONDS_PER_BALLOON));
    }, 100);
    return () => clearInterval(timer);
  }, [popped]);

  useEffect(() => {
    if (fill < 1 || popped) return;
    setPopped(true);
    void playTone({ frequency: 600, glideTo: 1400, duration: 0.25, volume: 0.15 });
    const timer = setTimeout(() => {
      if (balloon >= BALLOONS) {
        mic.stop();
        onComplete();
        finish();
        return;
      }
      setBalloon(balloon + 1);
      setFill(0);
      setPopped(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [fill]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Counter current={balloon} total={BALLOONS} />
      <div className="balloon-stage">
        {popped ? (
          <strong className="pop-text">{t("practice.a3_pop")}</strong>
        ) : (
          <span
            className={`balloon ${soundOn ? "balloon-active" : ""}`}
            style={{ transform: `scale(${0.35 + fill * 0.75})` }}
            aria-hidden
          >
            🎈
          </span>
        )}
        <div className="fill-track" aria-label={`${Math.round(fill * 100)}%`}>
          <i style={{ width: `${fill * 100}%` }} />
        </div>
      </div>
      <MicControls
        mic={mic}
        holding={holding}
        setHolding={setHolding}
        holdLabel={t("practice.hold_button")}
      />
    </>
  );
}

function MicControls({
  mic,
  holding,
  setHolding,
  holdLabel,
}: {
  mic: ReturnType<typeof useMicLevel>;
  holding: boolean;
  setHolding: (value: boolean) => void;
  holdLabel: string;
}) {
  const { t } = useTranslation();
  if (mic.state === "denied")
    return (
      <>
        <p className="hint">{t("practice.mic_denied")}</p>
        <button
          className={`button button-sun hold-button ${holding ? "hold-active" : ""}`}
          onPointerDown={() => setHolding(true)}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          {holdLabel}
        </button>
      </>
    );
  if (mic.state === "listening")
    return (
      <>
        <div className="mic-live">
          <Mic size={18} /> {t("practice.mic_listening")}
          <span className="level-track">
            <i style={{ width: `${mic.level * 100}%` }} />
          </span>
        </div>
        {holdLabel && (
          <>
            <p className="hint">{t("practice.mic_backup")}</p>
            <button
              className={`button button-quiet hold-button ${holding ? "hold-active" : ""}`}
              onPointerDown={() => setHolding(true)}
              onPointerUp={() => setHolding(false)}
              onPointerLeave={() => setHolding(false)}
              onContextMenu={(e) => e.preventDefault()}
            >
              {holdLabel}
            </button>
          </>
        )}
      </>
    );
  return (
    <>
      <button
        className="button button-primary"
        onClick={mic.start}
        disabled={mic.state === "starting"}
      >
        <Mic /> {t("practice.mic_start")}
      </button>
      <p className="hint">{t("practice.mic_note")}</p>
    </>
  );
}

const BREATHS = 3;
const BREATH_SECONDS = 4;

export function BreatheWithMe(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={Wind}
      violet
      title={t("practice.a4_title")}
      copy={t("practice.a4_copy")}
      completed={props.completed}
    >
      {(finish) => <BreathingGuide {...props} finish={finish} />}
    </ActivityCard>
  );
}

function BreathingGuide({ onComplete, finish }: ActivityProps & { finish: () => void }) {
  const { t } = useTranslation();
  const [breath, setBreath] = useState(0);
  const [phase, setPhase] = useState<"ready" | "in" | "out">("ready");

  useEffect(() => {
    if (phase === "ready") return;
    const timer = setTimeout(() => {
      if (phase === "in") return setPhase("out");
      if (breath >= BREATHS) {
        onComplete();
        finish();
        return;
      }
      setBreath(breath + 1);
      setPhase("in");
    }, BREATH_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [phase, breath]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Counter current={Math.max(breath, 1)} total={BREATHS} />
      <div className="breath-stage">
        <span className={`breath-circle breath-${phase}`}>
          {phase === "in"
            ? t("practice.breathe_in")
            : phase === "out"
              ? t("practice.breathe_out")
              : ""}
        </span>
      </div>
      {phase === "ready" && (
        <button
          className="button button-violet"
          onClick={() => {
            setBreath(1);
            setPhase("in");
          }}
        >
          {t("practice.start")}
        </button>
      )}
    </>
  );
}

/* ---------- Module 3: Move It, Say It ---------- */

const BEAT_ROUNDS = 5;

export function CopyTheBeat(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={Drum}
      title={t("practice.a5_title")}
      copy={t("practice.a5_copy")}
      completed={props.completed}
    >
      {(finish) => <BeatGame {...props} finish={finish} />}
    </ActivityCard>
  );
}

function BeatGame(props: ActivityProps & { finish: () => void }) {
  const { t } = useTranslation();
  const game = useRounds(
    () => {
      const counts: number[] = [];
      while (counts.length < BEAT_ROUNDS) {
        const next = 2 + Math.floor(Math.random() * 4);
        if (next !== counts[counts.length - 1]) counts.push(next);
      }
      return counts;
    },
    props,
    props.finish,
  );
  const [taps, setTaps] = useState(0);
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    setTaps(0);
    setPlaying(true);
    await playBeat(game.question);
    setPlaying(false);
    game.setHeard(true);
  };
  const tap = () => {
    setTaps(taps + 1);
    void playDrum();
  };
  const check = () => {
    const correct = taps === game.question;
    void game.answer(String(taps), String(game.question), "blend");
    if (!correct) setTaps(0);
  };
  useEffect(() => setTaps(0), [game.round]);

  return (
    <>
      <Counter current={game.round} total={game.total} />
      <button className="button button-primary" onClick={play} disabled={playing}>
        <Volume2 /> {t("practice.play_beat")}
      </button>
      <button
        className={`drum-pad ${game.stateOf(String(taps))}`}
        onClick={tap}
        disabled={!game.heard || playing || game.locked}
      >
        <span aria-hidden>🥁</span>
        {t("practice.tap_drum")}
      </button>
      <p className="tap-count">{t("practice.taps", { count: taps })}</p>
      <div className="button-row">
        <button className="button button-quiet" onClick={() => setTaps(0)} disabled={taps === 0}>
          {t("practice.clear")}
        </button>
        <button
          className="button button-sun"
          onClick={check}
          disabled={taps === 0 || playing || game.locked}
        >
          {t("practice.check")}
        </button>
      </div>
      {!game.heard && <p className="hint">{t("practice.listen_first")}</p>}
    </>
  );
}

export function HighOrLow(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={MoveVertical}
      violet
      title={t("practice.a6_title")}
      copy={t("practice.a6_copy")}
      completed={props.completed}
    >
      {(finish) => (
        <ListenAndChoose
          {...props}
          finish={finish}
          category="blend"
          question={t("practice.a6_question")}
          choices={[
            ["high", t("practice.answer_high")],
            ["low", t("practice.answer_low")],
          ]}
          makeQuestions={() =>
            shuffle(["high", "high", "high", "low", "low", "low"]).map((kind) => ({
              kind,
              frequency: kind === "high" ? pick([880, 988, 1047]) : pick([131, 147, 165]),
            }))
          }
          play={({ frequency }) => playTone({ frequency, duration: 0.9, volume: 0.25 })}
        />
      )}
    </ActivityCard>
  );
}

/* ---------- Module 4: Voice Confidence ---------- */

const PHRASES = ["a7_phrase1", "a7_phrase2", "a7_phrase3", "a7_phrase4"];
const VOICE_SECONDS = 0.8;

export function SayItLoud(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={Mic}
      title={t("practice.a7_title")}
      copy={t("practice.a7_copy")}
      completed={props.completed}
    >
      {(finish) => <SayItGame {...props} finish={finish} />}
    </ActivityCard>
  );
}

function SayItGame({ onComplete, finish }: ActivityProps & { finish: () => void }) {
  const { t, i18n } = useTranslation();
  const mic = useMicLevel();
  const [index, setIndex] = useState(0);
  const [heardFor, setHeardFor] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const phrase = t(`practice.${PHRASES[index]}`);

  const voicedRef = useRef(mic.voiced);
  voicedRef.current = mic.voiced;

  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      if (voicedRef.current) setHeardFor((s) => s + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, [done]);

  const next = async () => {
    setDone(true);
    await wait(1200);
    if (index + 1 >= PHRASES.length) {
      mic.stop();
      onComplete();
      finish();
      return;
    }
    setIndex(index + 1);
    setHeardFor(0);
    setDone(false);
  };

  useEffect(() => {
    if (heardFor >= VOICE_SECONDS && !done) void next();
  }, [heardFor]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Counter current={index + 1} total={PHRASES.length} />
      <p className={`say-phrase ${done ? "say-done" : ""}`}>
        {done ? t("practice.a7_heard") : phrase}
      </p>
      <button
        className="button button-quiet"
        onClick={() => speak(phrase, { language: i18n.language })}
        disabled={done}
      >
        <Volume2 size={18} /> {t("practice.hear_it")}
      </button>
      <div className="mic-area">
        {mic.state === "denied" ? (
          <>
            <p className="hint">{t("practice.mic_denied_say")}</p>
            <button className="button button-sun" onClick={next} disabled={done}>
              {t("practice.said_it")}
            </button>
          </>
        ) : (
          <>
            <MicControls mic={mic} holding={holding} setHolding={setHolding} holdLabel="" />
            {mic.state === "listening" && (
              <>
                <p className="hint">{t("practice.mic_backup_say")}</p>
                <button className="button button-quiet" onClick={next} disabled={done}>
                  {t("practice.said_it")}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

const MAX_RECORDING_SECONDS = 10;

export function FirstRecording(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={Mic}
      violet
      title={t("practice.a8_title")}
      copy={t("practice.a8_copy")}
      completed={props.completed}
    >
      {(finish) => <Recorder {...props} finish={finish} />}
    </ActivityCard>
  );
}

function Recorder({ onComplete, finish }: ActivityProps & { finish: () => void }) {
  const { t } = useTranslation();
  const [supported] = useState(canRecord);
  const [state, setState] = useState<"idle" | "recording" | "ready" | "denied">("idle");
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const rewarded = useRef(false);

  useEffect(() => {
    if (state !== "recording") return;
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_RECORDING_SECONDS) recorderRef.current?.stop();
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state]);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  useEffect(
    () => () => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    },
    [],
  );

  const record = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setUrl(URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType })));
        setState("ready");
      };
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setState("recording");
    } catch {
      setState("denied");
    }
  };

  if (!supported) return <p className="hint">{t("practice.rec_unsupported")}</p>;
  return (
    <div className="recorder">
      {state === "recording" ? (
        <>
          <p className="rec-live">
            <span className="rec-dot" /> {t("practice.recording", { seconds })}
          </p>
          <button className="button button-violet" onClick={() => recorderRef.current?.stop()}>
            <Square size={18} /> {t("practice.stop")}
          </button>
        </>
      ) : state === "ready" && url ? (
        <>
          <p className="hint">{t("practice.listen_back")}</p>
          <audio controls src={url} />
          <div className="button-row">
            <button className="button button-quiet" onClick={record}>
              <RotateCcw size={18} /> {t("practice.record_again")}
            </button>
            <button
              className="button button-sun"
              onClick={() => {
                if (!rewarded.current) {
                  rewarded.current = true;
                  onComplete();
                }
                finish();
              }}
            >
              {t("practice.finish")}
            </button>
          </div>
        </>
      ) : (
        <>
          {state === "denied" && <p className="hint">{t("practice.mic_denied_record")}</p>}
          <button className="button button-violet" onClick={record}>
            <Mic /> {t("practice.record")}
          </button>
        </>
      )}
    </div>
  );
}

/* ---------- Module 5: Story Builder ---------- */

const ORDER_STORIES = [
  ["🌱", "🌿", "🌻"],
  ["🥚", "🐣", "🐔"],
  ["☁️", "🌧️", "🌈"],
];

export function StoryOrder(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={Puzzle}
      title={t("practice.a9_title")}
      copy={t("practice.a9_copy")}
      completed={props.completed}
    >
      {(finish) => <StoryOrderGame {...props} finish={finish} />}
    </ActivityCard>
  );
}

function StoryOrderGame(props: ActivityProps & { finish: () => void }) {
  const { t } = useTranslation();
  const [story, setStory] = useState(0);
  // Reshuffle the picture cards each time a new story starts.
  const cards = useMemo(() => shuffle([0, 1, 2]), [story]); // eslint-disable-line react-hooks/exhaustive-deps
  const emojis = ORDER_STORIES[story] ?? [];
  const [picked, setPicked] = useState<number[]>([]);
  const [status, setStatus] = useState<"" | "right" | "wrong">("");

  const tapCard = async (step: number) => {
    if (picked.includes(step) || status) return;
    const next = [...picked, step];
    setPicked(next);
    if (next.length < 3) return;
    const correct = next.every((s, i) => s === i);
    props.onAnswer(null, correct);
    setStatus(correct ? "right" : "wrong");
    await wait(correct ? 1000 : 1300);
    setStatus("");
    setPicked([]);
    if (!correct) return;
    if (story + 1 >= ORDER_STORIES.length) {
      props.onComplete();
      props.finish();
    } else setStory(story + 1);
  };

  const label = (step: number) => t(`practice.a9_s${story + 1}_${step + 1}`);
  return (
    <>
      <Counter current={story + 1} total={ORDER_STORIES.length} />
      <div className={`story-slots ${status ? `slots-${status}` : ""}`}>
        {[0, 1, 2].map((slot) => (
          <div key={slot} className="story-slot">
            <small>{t(`practice.slot_${slot + 1}`)}</small>
            {picked[slot] !== undefined ? (
              <>
                <span aria-hidden>{emojis[picked[slot]]}</span>
                <strong>{label(picked[slot])}</strong>
              </>
            ) : (
              <span className="slot-empty">?</span>
            )}
          </div>
        ))}
      </div>
      {status === "wrong" && <p className="hint">{t("practice.order_wrong")}</p>}
      <div className="story-cards">
        {cards.map((step) => (
          <button
            key={step}
            onClick={() => tapCard(step)}
            disabled={picked.includes(step) || !!status}
          >
            <span aria-hidden>{emojis[step]}</span>
            <strong>{label(step)}</strong>
          </button>
        ))}
      </div>
    </>
  );
}

const ENDING_STORIES = [
  ["☂️", "🕶️", "🍱"],
  ["🍌", "🛏️", "👟"],
  ["😴", "🏫", "🌙"],
  ["🎂", "🌙", "👋"],
];

export function FinishTheStory(props: ActivityProps) {
  const { t } = useTranslation();
  return (
    <ActivityCard
      icon={BookOpen}
      violet
      title={t("practice.a10_title")}
      copy={t("practice.a10_copy")}
      completed={props.completed}
    >
      {(finish) => <FinishStoryGame {...props} finish={finish} />}
    </ActivityCard>
  );
}

function FinishStoryGame(props: ActivityProps & { finish: () => void }) {
  const { t, i18n } = useTranslation();
  const game = useRounds(
    () => ENDING_STORIES.map((emojis, i) => ({ story: i + 1, emojis, order: shuffle([0, 1, 2]) })),
    props,
    props.finish,
  );
  const { story, emojis, order } = game.question;
  const sentence = t(`practice.a10_s${story}`);
  return (
    <>
      <Counter current={game.round} total={game.total} />
      <p className="story-sentence">{sentence}</p>
      <button
        className="button button-quiet"
        onClick={() => speak(sentence, { language: i18n.language })}
      >
        <Volume2 size={18} /> {t("practice.read_to_me")}
      </button>
      <div className="answer-grid ending-grid">
        {order.map((option) => (
          <button
            key={option}
            className={game.stateOf(String(option))}
            disabled={game.locked}
            onClick={() => game.answer(String(option), "0", null)}
          >
            <span aria-hidden>{emojis[option]}</span>
            <strong>{t(`practice.a10_s${story}_${option + 1}`)}</strong>
          </button>
        ))}
      </div>
    </>
  );
}
