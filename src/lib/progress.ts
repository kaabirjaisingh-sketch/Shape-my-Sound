import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebase";

export type SoundCategory = "rounded" | "sharp" | "blend";

export const BADGE_IDS = ["badge_1", "badge_2", "badge_3", "badge_4", "badge_5"] as const;
export type BadgeId = (typeof BADGE_IDS)[number];

export type Progress = {
  points: number;
  activitiesCompleted: number;
  badges: string[];
  roundedCorrect: number;
  roundedTotal: number;
  sharpCorrect: number;
  sharpTotal: number;
  blendCorrect: number;
  blendTotal: number;
  streakDays: number;
  lastPracticedAt: Timestamp | null;
};

export const DEFAULT_PROGRESS: Progress = {
  points: 0,
  activitiesCompleted: 0,
  badges: [],
  roundedCorrect: 0,
  roundedTotal: 0,
  sharpCorrect: 0,
  sharpTotal: 0,
  blendCorrect: 0,
  blendTotal: 0,
  streakDays: 0,
  lastPracticedAt: null,
};

const BADGE_THRESHOLDS: Array<{ id: BadgeId; points: number }> = [
  { id: "badge_1", points: 20 },
  { id: "badge_2", points: 40 },
  { id: "badge_3", points: 60 },
  { id: "badge_4", points: 80 },
  { id: "badge_5", points: 100 },
];

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function isYesterday(a: Date, b: Date) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0)) / oneDay);
  return diffDays === 1;
}

function nextStreak(previous: Progress): number {
  if (!previous.lastPracticedAt) return 1;
  const last = previous.lastPracticedAt.toDate();
  const now = new Date();
  if (isSameDay(last, now)) return previous.streakDays || 1;
  if (isYesterday(new Date(last), new Date(now))) return (previous.streakDays || 0) + 1;
  return 1;
}

export function watchProgress(uid: string, onChange: (progress: Progress) => void): Unsubscribe {
  return onSnapshot(doc(db, "progress", uid), (snapshot) => {
    onChange(snapshot.exists() ? (snapshot.data() as Progress) : DEFAULT_PROGRESS);
  });
}

export async function recordAnswer(
  uid: string,
  current: Progress,
  category: SoundCategory,
  correct: boolean,
): Promise<Progress> {
  const totalKey = `${category}Total` as const;
  const correctKey = `${category}Correct` as const;
  const points = current.points + (correct ? 10 : 0);
  const badges = [
    ...current.badges,
    ...BADGE_THRESHOLDS.filter((b) => points >= b.points && !current.badges.includes(b.id)).map(
      (b) => b.id,
    ),
  ];

  const updated: Progress = {
    ...current,
    points,
    activitiesCompleted: current.activitiesCompleted + 1,
    badges,
    [totalKey]: current[totalKey] + 1,
    [correctKey]: current[correctKey] + (correct ? 1 : 0),
    streakDays: nextStreak(current),
    lastPracticedAt: Timestamp.now(),
  };

  await setDoc(doc(db, "progress", uid), { ...updated, lastPracticedAt: serverTimestamp() });
  return updated;
}

export function useProgress(uid: string | undefined) {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setProgress(DEFAULT_PROGRESS);
      setLoading(false);
      return;
    }
    setLoading(true);
    return watchProgress(uid, (next) => {
      setProgress(next);
      setLoading(false);
    });
  }, [uid]);

  return { progress, loading };
}
