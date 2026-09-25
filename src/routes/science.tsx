import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioWaveform, Brain, Move, Shapes, Speech, Users, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Eyebrow, Mascot, Page } from "../components/site-shell";

export const Route = createFileRoute("/science")({
  head: () => ({
    meta: [
      { title: "The Science — Shape My Sound" },
      {
        name: "description",
        content: "Discover how sound, shape, and movement support confident expression.",
      },
      { property: "og:title", content: "The Science — Shape My Sound" },
      {
        property: "og:description",
        content: "Discover how multisensory play supports young voices.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SciencePage,
});

function SciencePage() {
  const { t } = useTranslation();
  const steps: Array<[LucideIcon, string, string]> = [
    [AudioWaveform, t("science.step1_title"), t("science.step1_copy")],
    [Shapes, t("science.step2_title"), t("science.step2_copy")],
    [Move, t("science.step3_title"), t("science.step3_copy")],
    [Speech, t("science.step4_title"), t("science.step4_copy")],
  ];

  const principles = [
    { icon: Brain, title: t("science.principle1_title"), copy: t("science.principle1_copy") },
    { icon: Move, title: t("science.principle2_title"), copy: t("science.principle2_copy") },
    { icon: Users, title: t("science.principle3_title"), copy: t("science.principle3_copy") },
  ];

  return (
    <Page>
      <section className="page-hero">
        <Eyebrow>{t("science.eyebrow")}</Eyebrow>
        <h1>{t("science.title")}</h1>
        <p>{t("science.copy")}</p>
      </section>
      <section className="section page-shell text-center">
        <Eyebrow>{t("science.path_eyebrow")}</Eyebrow>
        <h2>{t("science.path_title")}</h2>
        <div className="path-grid">
          {steps.map(([Icon, title, copy], i) => (
            <article key={title} className="path-step">
              <span className="step-icon">
                <Icon />
              </span>
              <span className="step-number">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="band">
        <div className="page-shell split">
          <div>
            <Eyebrow>{t("science.bk_eyebrow")}</Eyebrow>
            <h2>{t("science.bk_title")}</h2>
            <p>{t("science.bk_copy1")}</p>
            <p>{t("science.bk_copy2")}</p>
          </div>
          <div className="character-pair">
            <article className="character-card">
              <Mascot small />
              <h3>{t("science.bouba_label")}</h3>
              <p>{t("science.bouba_desc")}</p>
            </article>
            <article className="character-card">
              <Mascot kind="kiki" small />
              <h3 className="text-violet">{t("science.kiki_label")}</h3>
              <p>{t("science.kiki_desc")}</p>
            </article>
          </div>
        </div>
      </section>
      <section className="section page-shell text-center">
        <Eyebrow>{t("science.principles_eyebrow")}</Eyebrow>
        <h2>{t("science.principles_title")}</h2>
        <div className="feature-grid">
          {principles.map(({ icon: Icon, title, copy }) => (
            <article className="feature-card" key={title}>
              <span className="feature-icon">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <div className="cta-strip">
          <h2>{t("science.cta_title")}</h2>
          <Link to="/practice" className="button button-sun">
            {t("science.cta_button")}
          </Link>
        </div>
      </section>
    </Page>
  );
}
