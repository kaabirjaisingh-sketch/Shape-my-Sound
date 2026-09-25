import { createFileRoute, Link } from "@tanstack/react-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { AudioWaveform, BadgeCheck, CheckCircle2, Move, Shapes } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Eyebrow, Mascot, Page } from "../components/site-shell";
import { db } from "../lib/firebase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shape My Sound — Speech Practice Through Play" },
      {
        name: "description",
        content: "A calm, multisensory world where children build communication confidence.",
      },
      { property: "og:title", content: "Shape My Sound — Speech Practice Through Play" },
      {
        property: "og:description",
        content: "Every sound has a shape, and every child has a voice.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    const data = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, "partnerRequests"), {
        name: data.get("name"),
        email: data.get("email"),
        organization: data.get("organization"),
        message: data.get("message"),
        createdAt: serverTimestamp(),
      });
      setSent(true);
      e.currentTarget.reset();
    } finally {
      setPending(false);
    }
  };

  const howSteps = [
    { Icon: AudioWaveform, title: t("home.how_step1_title"), copy: t("home.how_step1_copy") },
    { Icon: Shapes, title: t("home.how_step2_title"), copy: t("home.how_step2_copy") },
    { Icon: Move, title: t("home.how_step3_title"), copy: t("home.how_step3_copy") },
  ];

  const metrics: Array<[string, string]> = [
    ["11,882+", t("home.metrics_sessions")],
    ["93%", t("home.metrics_confident")],
    ["40+", t("home.metrics_partners")],
    ["3", t("home.metrics_languages")],
  ];

  return (
    <Page>
      <section className="home-hero page-shell">
        <div>
          <Eyebrow>{t("home.eyebrow_ages")}</Eyebrow>
          <h1>{t("home.hero_title")}</h1>
          <p>{t("home.hero_copy")}</p>
          <div className="hero-actions">
            <Link to="/practice" className="button button-primary">
              {t("common.nav_try_demo")}
            </Link>
            <Link to="/science" className="button button-quiet">
              {t("home.hero_see_science")}
            </Link>
          </div>
          <span className="therapist">
            <BadgeCheck /> {t("home.hero_therapist")}
          </span>
        </div>
        <div className="hero-art" aria-label="Friendly Shape My Sound characters">
          <span className="sun-dot" />
          <span className="mint-pill" />
          <Mascot />
          <span className="coral-dot" />
          <Mascot kind="kiki" small />
        </div>
      </section>
      <section id="how" className="section page-shell text-center">
        <Eyebrow>{t("home.how_eyebrow")}</Eyebrow>
        <h2>{t("home.how_title")}</h2>
        <p className="section-copy">{t("home.how_copy")}</p>
        <div className="feature-grid">
          {howSteps.map(({ Icon, title, copy }) => (
            <article className="feature-card text-left" key={title}>
              <span className="feature-icon">
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="metrics-band">
        <div className="page-shell">
          <h2>{t("home.metrics_title")}</h2>
          <p>{t("home.metrics_copy")}</p>
          <div className="metrics">
            {metrics.map(([n, l]) => (
              <div key={l}>
                <strong>{n}</strong>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section page-shell split">
        <div>
          <Eyebrow>{t("home.science_eyebrow")}</Eyebrow>
          <h2>{t("home.science_title")}</h2>
          <p>{t("home.science_copy")}</p>
          <Link to="/science" className="button button-primary">
            {t("home.science_cta")}
          </Link>
        </div>
        <div className="character-pair">
          <article className="character-card">
            <Mascot small />
            <h3>{t("home.bouba_label")}</h3>
          </article>
          <article className="character-card">
            <Mascot kind="kiki" small />
            <h3 className="text-violet">{t("home.kiki_label")}</h3>
          </article>
        </div>
      </section>
      <section className="band">
        <div className="page-shell split parent-preview">
          <div className="mini-dashboard">
            <div className="confidence-ring mini">
              <strong>65%</strong>
              <span>{t("home.mini_confidence")}</span>
            </div>
            <div>
              <span>
                {t("home.mini_rounded")} <b>82%</b>
              </span>
              <i className="mini-bar" />
              <span>
                {t("home.mini_sharp")} <b>61%</b>
              </span>
              <i className="mini-bar violet" />
            </div>
          </div>
          <div>
            <Eyebrow>{t("home.parents_eyebrow")}</Eyebrow>
            <h2>{t("home.parents_title")}</h2>
            <p>{t("home.parents_copy")}</p>
            <Link to="/parents" className="button button-primary">
              {t("home.parents_cta")}
            </Link>
          </div>
        </div>
      </section>
      <section id="partner" className="partner-section">
        <div className="page-shell split">
          <div>
            <Eyebrow>{t("home.partner_eyebrow")}</Eyebrow>
            <h2>{t("home.partner_title")}</h2>
            <p>{t("home.partner_copy")}</p>
            {[t("home.partner_point1"), t("home.partner_point2"), t("home.partner_point3")].map(
              (x) => (
                <span className="check-line" key={x}>
                  <CheckCircle2 />
                  {x}
                </span>
              ),
            )}
          </div>
          <form className="partner-form" onSubmit={submit}>
            <label>
              {t("home.form_name")}
              <input name="name" required />
            </label>
            <label>
              {t("home.form_email")}
              <input name="email" type="email" required />
            </label>
            <label>
              {t("home.form_org")}
              <input name="organization" required />
            </label>
            <label>
              {t("home.form_help")}
              <textarea name="message" rows={4} />
            </label>
            <button className="button button-sun" type="submit" disabled={pending}>
              {pending ? t("home.form_sending") : t("home.form_submit")}
            </button>
            <small>{sent ? t("home.form_sent") : t("home.form_note")}</small>
          </form>
        </div>
      </section>
    </Page>
  );
}
