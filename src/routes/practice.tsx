import { createFileRoute } from "@tanstack/react-router";
import { Lock, Star } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import {
  BalloonBreath,
  BreatheWithMe,
  CopyTheBeat,
  FinishTheStory,
  FirstRecording,
  HighOrLow,
  RoundOrSpiky,
  SayItLoud,
  ShortOrLong,
  StoryOrder,
  type ActivityProps,
} from "../components/practice-activities";
import { Eyebrow, Page } from "../components/site-shell";
import { useAuth, RequireAuth } from "../lib/auth-context";
import {
  BADGE_IDS,
  completeActivity,
  recordAnswer,
  useProgress,
  type BadgeId,
  type SoundCategory,
} from "../lib/progress";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice Activities | Shape My Sound" },
      { name: "description", content: "Play gentle sound and shape activities for young voices." },
      { property: "og:title", content: "Practice Activities | Shape My Sound" },
      {
        property: "og:description",
        content: "Explore playful sound, shape, and listening activities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Practice />
    </RequireAuth>
  ),
});

const MODULE_KEYS = ["module_1", "module_2", "module_3", "module_4", "module_5"] as const;

type Activity = {
  id: string;
  module: number;
  Component: ComponentType<ActivityProps>;
  badge?: BadgeId;
};

const ACTIVITIES: Activity[] = [
  { id: "round-or-spiky", module: 0, Component: RoundOrSpiky, badge: "badge_1" },
  { id: "short-or-long", module: 0, Component: ShortOrLong, badge: "badge_1" },
  { id: "balloon-breath", module: 1, Component: BalloonBreath, badge: "badge_2" },
  { id: "breathe-with-me", module: 1, Component: BreatheWithMe, badge: "badge_2" },
  { id: "copy-the-beat", module: 2, Component: CopyTheBeat },
  { id: "high-or-low", module: 2, Component: HighOrLow },
  { id: "say-it-loud", module: 3, Component: SayItLoud, badge: "badge_3" },
  { id: "first-recording", module: 3, Component: FirstRecording, badge: "badge_4" },
  { id: "story-order", module: 4, Component: StoryOrder, badge: "badge_5" },
  { id: "finish-the-story", module: 4, Component: FinishTheStory, badge: "badge_5" },
];

function Practice() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { progress } = useProgress(user?.uid);
  const [module, setModule] = useState(0);
  const [toast, setToast] = useState({ id: 0, text: "" });

  const show = (text: string) => setToast((prev) => ({ id: prev.id + 1, text }));
  useEffect(() => {
    if (!toast.text) return;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, text: "" })), 2600);
    return () => clearTimeout(timer);
  }, [toast.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (category: SoundCategory | null, correct: boolean) => {
    if (!user) return;
    show(correct ? t("practice.toast_correct") : t("practice.toast_incorrect"));
    recordAnswer(user.uid, progress, category, correct).catch(() => show(t("practice.save_error")));
  };

  const complete = ({ id, badge }: Activity) => {
    if (!user) return;
    const newBadge = badge && !progress.badges.includes(badge) ? badge : undefined;
    show(
      newBadge
        ? t("practice.badge_unlocked", { badge: t(`practice.${newBadge}`) })
        : t("practice.toast_complete"),
    );
    completeActivity(user.uid, progress, id, badge).catch(() => show(t("practice.save_error")));
  };

  const badges = BADGE_IDS.map((id) => ({ id, name: t(`practice.${id}`) }));
  const finishedCount = ACTIVITIES.filter((a) =>
    progress.completedActivities.includes(a.id),
  ).length;

  return (
    <Page>
      <section className="section page-shell practice">
        <Eyebrow>{t("practice.eyebrow")}</Eyebrow>
        <h1>{t("practice.title")}</h1>
        <p className="lead">{t("practice.lead")}</p>
        <section className="points-card">
          <div>
            <small>{t("practice.points_label")}</small>
            <strong>
              <Star /> {progress.points}
            </strong>
          </div>
          <div className="points-stats">
            <span>
              <b>{finishedCount}</b>/{ACTIVITIES.length}
              <small>{t("practice.stat_activities")}</small>
            </span>
            <span>
              <b>{progress.roundedTotal + progress.sharpTotal + progress.blendTotal}</b>
              <small>{t("practice.stat_sounds")}</small>
            </span>
            <span>
              <b>{progress.badges.length}</b>/{badges.length}
              <small>{t("practice.stat_badges")}</small>
            </span>
          </div>
          <div className="badges">
            {badges.map(({ id, name }) => (
              <span key={id} className={progress.badges.includes(id) ? "badge-unlocked" : ""}>
                <Lock size={14} />
                {name}
              </span>
            ))}
          </div>
        </section>
        <div className="module-tabs" role="tablist">
          {MODULE_KEYS.map((key, i) => (
            <button
              key={key}
              role="tab"
              aria-selected={i === module}
              className={i === module ? "tab-active" : ""}
              onClick={() => setModule(i)}
            >
              {t(`practice.${key}`)}
            </button>
          ))}
        </div>
        <div className="activity-heading">
          <div>
            <h2>{t(`practice.m${module + 1}_title`)}</h2>
            <p>{t(`practice.m${module + 1}_copy`)}</p>
          </div>
        </div>
        {ACTIVITIES.filter((a) => a.module === module).map((activity) => (
          <activity.Component
            key={activity.id}
            completed={progress.completedActivities.includes(activity.id)}
            onAnswer={answer}
            onComplete={() => complete(activity)}
          />
        ))}
        {toast.text && (
          <div className="toast" role="status" key={toast.id}>
            {toast.text}
          </div>
        )}
      </section>
    </Page>
  );
}
