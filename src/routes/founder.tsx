import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Eyebrow, Page } from "../components/site-shell";

// Kaabir's TEDxYouth@OIS talk on the official TEDx Talks channel.
const TEDX_VIDEO_ID = "nwDDuVrZL0w";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "Our Founder | Shape My Sound" },
      {
        name: "description",
        content: "Meet Kaabir Jaisingh and discover the story behind Shape My Sound.",
      },
      { property: "og:title", content: "Our Founder | Shape My Sound" },
      {
        property: "og:description",
        content: "The journey of Kaabir Jaisingh and the idea behind Shape My Sound.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FounderPage,
});

function FounderPage() {
  const { t } = useTranslation();

  return (
    <Page>
      <section className="page-hero founder-hero">
        <Eyebrow>{t("founder.eyebrow")}</Eyebrow>
        <h1>{t("founder.title")}</h1>
      </section>

      <section className="page-shell founder-rows">
        <article className="founder-row">
          <figure className="founder-photo founder-portrait">
            <img
              src="/kaabir-jaisingh.jpg"
              alt={t("founder.portrait_alt")}
              width={853}
              height={1280}
            />
          </figure>
          <div className="founder-text">
            <h2>{t("founder.meet_title")}</h2>
            <p>{t("founder.meet_copy1")}</p>
            <p>{t("founder.meet_copy2")}</p>
          </div>
        </article>

        <article className="founder-row founder-row-reverse">
          <figure className="founder-photo">
            <div className="founder-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${TEDX_VIDEO_ID}`}
                title={t("founder.tedx_alt")}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <figcaption>{t("founder.tedx_caption")}</figcaption>
          </figure>
          <div className="founder-text">
            <h2>{t("founder.tedx_title")}</h2>
            <p>{t("founder.meet_copy3")}</p>
            <a
              className="founder-watch"
              href={`https://www.youtube.com/watch?v=${TEDX_VIDEO_ID}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Play size={18} /> {t("founder.tedx_watch")}
            </a>
          </div>
        </article>

        <article className="founder-row">
          <figure className="founder-photo founder-portrait">
            <img
              src="/kaabir-young-speaker-cropped.jpg"
              alt={t("founder.young_alt")}
              width={454}
              height={686}
              loading="lazy"
            />
          </figure>
          <div className="founder-text">
            <h2>{t("founder.began_title")}</h2>
            <p>{t("founder.began_copy1")}</p>
            <p>{t("founder.began_copy2")}</p>
            <blockquote>{t("founder.question")}</blockquote>
          </div>
        </article>
      </section>

      <section className="page-shell founder-story">
        <article>
          <h2>{t("founder.idea_title")}</h2>
          <p>{t("founder.idea_copy1")}</p>
          <p>{t("founder.idea_copy2")}</p>
          <p>{t("founder.idea_copy3")}</p>
        </article>
      </section>

      <section className="section page-shell text-center">
        <div className="cta-strip founder-cta">
          <h2>{t("founder.cta_title")}</h2>
          <Link to="/practice" className="button button-sun">
            {t("founder.cta_button")}
          </Link>
        </div>
      </section>
    </Page>
  );
}
