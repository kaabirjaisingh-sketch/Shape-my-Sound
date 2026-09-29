import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Eye, Flame, TrendingUp, Waves } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Page } from "../components/site-shell";
import { RequireAuth, useAuth } from "../lib/auth-context";
import { useProgress } from "../lib/progress";

export const Route = createFileRoute("/parents")({
  head: () => ({
    meta: [
      { title: "Parent Dashboard | Shape My Sound" },
      { name: "description", content: "A dashboard for tracking speech-practice confidence." },
      { property: "og:title", content: "Parent Dashboard | Shape My Sound" },
      {
        property: "og:description",
        content: "See a clear, encouraging picture of a child's practice journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Parents />
    </RequireAuth>
  ),
});

function pct(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function Parents() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { progress } = useProgress(user?.uid);

  const soundsMastered = progress.badges.length;
  const soundsPracticed = progress.roundedTotal + progress.sharpTotal + progress.blendTotal;
  const confidence = pct(
    progress.roundedCorrect + progress.sharpCorrect + progress.blendCorrect,
    soundsPracticed,
  );

  const stats = [
    { Icon: Flame, n: String(progress.streakDays), label: t("parents.stat_streak") },
    { Icon: Waves, n: String(soundsPracticed), label: t("parents.stat_sounds_practiced") },
    { Icon: CheckCircle2, n: String(soundsMastered), label: t("parents.stat_badges_earned") },
  ];

  return (
    <Page>
      <section className="section page-shell dashboard">
        <span className="demo-badge">
          <Eye size={16} /> {t("parents.live_progress", { email: user?.email })}
        </span>
        <h1>{t("parents.title")}</h1>
        <p className="lead">{t("parents.lead")}</p>
        <div className="dashboard-grid">
          <article className="confidence-card">
            <h2>{t("parents.confidence_title")}</h2>
            <div className="confidence-ring">
              <strong>{confidence}%</strong>
              <span>{t("parents.confidence_label")}</span>
            </div>
            <p>
              {soundsPracticed === 0 ? t("parents.confidence_empty") : t("parents.confidence_note")}
            </p>
          </article>
          <div>
            <div className="stat-grid">
              {stats.map(({ Icon, n, label }) => (
                <article className="stat-card" key={label}>
                  <span className="feature-icon">
                    <Icon />
                  </span>
                  <strong>{n}</strong>
                  <small>{label}</small>
                </article>
              ))}
            </div>
            <article className="learning-card">
              <h2>{t("parents.learning_title")}</h2>
              <p>{t("parents.learning_copy")}</p>
              <Progress
                label={t("parents.path_rounded")}
                value={pct(progress.roundedCorrect, progress.roundedTotal)}
                color="blue"
              />
              <Progress
                label={t("parents.path_sharp")}
                value={pct(progress.sharpCorrect, progress.sharpTotal)}
                color="violet"
              />
              <Progress
                label={t("parents.path_blend")}
                value={pct(progress.blendCorrect, progress.blendTotal)}
                color="yellow"
              />
            </article>
          </div>
        </div>
        <article className="highlights">
          <h2>{t("parents.highlights_title")}</h2>
          {progress.lastPracticedAt ? (
            <div className="highlight">
              <TrendingUp />
              <span>{t("parents.highlights_last_practiced")}</span>
              <small>{progress.lastPracticedAt.toDate().toLocaleDateString()}</small>
            </div>
          ) : (
            <p>{t("parents.highlights_empty")}</p>
          )}
        </article>
      </section>
    </Page>
  );
}

function Progress({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="progress">
      <div>
        <strong>{label}</strong>
        <span>{value}%</span>
      </div>
      <div className="progress-track">
        <i className={`progress-${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
