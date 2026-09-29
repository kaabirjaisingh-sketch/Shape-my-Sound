import {
  arrayUnion,
  doc,
  increment,
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
  completedActivities: string[];
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
  completedActivities: [],
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
    onChange(
      snapshot.exists()
        ? { ...DEFAULT_PROGRESS, ...(snapshot.data() as Partial<Progress>) }
        : DEFAULT_PROGRESS,
    );
  });
}

export const POINTS_PER_CORRECT = 10;
export const POINTS_PER_ACTIVITY = 20;

// Counters use Firestore increments so quick taps never overwrite each other.
// Story answers pass a null category: they earn points but are not sound practice.
export async function recordAnswer(
  uid: string,
  current: Progress,
  category: SoundCategory | null,
  correct: boolean,
) {
  await setDoc(
    doc(db, "progress", uid),
    {
      points: increment(correct ? POINTS_PER_CORRECT : 0),
      ...(category
        ? {
            [`${category}Total`]: increment(1),
            [`${category}Correct`]: increment(correct ? 1 : 0),
          }
        : {}),
      streakDays: nextStreak(current),
      lastPracticedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function completeActivity(
  uid: string,
  current: Progress,
  activityId: string,
  badge?: BadgeId,
) {
  await setDoc(
    doc(db, "progress", uid),
    {
      points: increment(POINTS_PER_ACTIVITY),
      activitiesCompleted: increment(1),
      completedActivities: arrayUnion(activityId),
      ...(badge ? { badges: arrayUnion(badge) } : {}),
      streakDays: nextStreak(current),
      lastPracticedAt: serverTimestamp(),
    },
    { merge: true },
  );
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
