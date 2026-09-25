import { createFileRoute } from "@tanstack/react-router";
import { AudioWaveform, Lock, Search, Star, Volume2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eyebrow, Mascot, Page, useTone } from "../components/site-shell";
import { useAuth, RequireAuth } from "../lib/auth-context";
import { BADGE_IDS, recordAnswer, useProgress, type SoundCategory } from "../lib/progress";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice Activities — Shape My Sound" },
      { name: "description", content: "Play gentle sound and shape activities for young voices." },
      { property: "og:title", content: "Practice Activities — Shape My Sound" },
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

function Practice() {
  const { t } = useTranslation();
  const tone = useTone();
  const { user } = useAuth();
  const { progress } = useProgress(user?.uid);
  const [message, setMessage] = useState("");

  const answer = async (category: SoundCategory, correct: boolean) => {
    if (!user) return;
    const updated = await recordAnswer(user.uid, progress, category, correct);
    setMessage(
      correct
        ? t("practice.toast_correct", { points: updated.points })
        : t("practice.toast_incorrect"),
    );
  };

  const badges = BADGE_IDS.map((id) => ({ id, name: t(`practice.${id}`) }));

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
              <b>{progress.activitiesCompleted}</b>
              <small>{t("practice.stat_activities")}</small>
            </span>
            <span>
              <b>{progress.roundedCorrect + progress.sharpCorrect + progress.blendCorrect}</b>
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
        <div className="module-tabs">
          {MODULE_KEYS.map((key, i) => (
            <button className={i === 0 ? "tab-active" : ""} key={key}>
              {t(`practice.${key}`)}
            </button>
          ))}
        </div>
        <div className="activity-heading">
          <span className="feature-icon">
            <AudioWaveform />
          </span>
          <div>
            <h2>{t("practice.section1_title")}</h2>
            <p>{t("practice.section1_copy")}</p>
          </div>
        </div>
        <section className="activity-card">
          <div className="activity-title">
            <span className="feature-icon">
              <AudioWaveform />
            </span>
            <div>
              <h2>{t("practice.card1_title")}</h2>
              <p>{t("practice.card1_copy")}</p>
            </div>
          </div>
          <div className="question-line">
            <strong>
              {t("practice.sound_of", {
                current: Math.min(progress.roundedTotal + progress.sharpTotal + 1, 6),
                total: 6,
              })}
            </strong>
            <span>{t("practice.sound_sample")}</span>
          </div>
          <button className="button button-primary" onClick={tone}>
            <Volume2 /> {t("practice.play_sound")}
          </button>
          <div className="answer-grid">
            <button onClick={() => answer("rounded", true)}>
              <Mascot small />
              <strong>{t("practice.answer_round")}</strong>
            </button>
            <button onClick={() => answer("sharp", false)}>
              <Mascot kind="kiki" small />
              <strong>{t("practice.answer_spiky")}</strong>
            </button>
          </div>
        </section>
        <section className="activity-card">
          <div className="activity-title">
            <span className="feature-icon feature-violet">
              <Search />
            </span>
            <div>
              <h2>{t("practice.card2_title")}</h2>
              <p>{t("practice.card2_copy")}</p>
            </div>
          </div>
          <strong className="clue">
            {t("practice.clue_of", { current: Math.min(progress.blendTotal + 1, 5), total: 5 })}
          </strong>
          <button className="button button-violet" onClick={tone}>
            <Volume2 /> {t("practice.play_sound")}
          </button>
          <h3>{t("practice.question_short_long")}</h3>
          <div className="answer-grid text-only">
            <button onClick={() => answer("blend", false)}>{t("practice.answer_short")}</button>
            <button onClick={() => answer("blend", true)}>{t("practice.answer_long")}</button>
          </div>
        </section>
        {message && (
          <div className="toast" role="status">
            {message}
          </div>
        )}
      </section>
    </Page>
  );
}
