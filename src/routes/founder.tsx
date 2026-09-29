import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Eyebrow, Page } from "../components/site-shell";

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
      <section className="page-hero">
        <Eyebrow>{t("founder.eyebrow")}</Eyebrow>
        <h1>{t("founder.title")}</h1>
        <figure className="founder-portrait">
          <img
            src="/kaabir-jaisingh.jpg"
            alt={t("founder.portrait_alt")}
            width={853}
            height={1280}
          />
        </figure>
      </section>

      <section className="page-shell founder-story">
        <article>
          <h2>{t("founder.meet_title")}</h2>
          <p>{t("founder.meet_copy1")}</p>
          <p>{t("founder.meet_copy2")}</p>
          <p>{t("founder.meet_copy3")}</p>
          <figure className="founder-stage">
            <img
              src="/kaabir-tedx.jpg"
              alt={t("founder.tedx_alt")}
              width={890}
              height={490}
              loading="lazy"
            />
            <figcaption>{t("founder.tedx_caption")}</figcaption>
          </figure>
        </article>

        <article>
          <h2>{t("founder.began_title")}</h2>
          <p>{t("founder.began_copy1")}</p>
          <p>{t("founder.began_copy2")}</p>
          <blockquote>{t("founder.question")}</blockquote>
        </article>

        <article>
          <h2>{t("founder.idea_title")}</h2>
          <p>{t("founder.idea_copy1")}</p>
          <p>{t("founder.idea_copy2")}</p>
          <p>{t("founder.idea_copy3")}</p>
        </article>
      </section>

      <section className="section page-shell text-center">
        <div className="cta-strip">
          <h2>{t("founder.cta_title")}</h2>
          <Link to="/practice" className="button button-sun">
            {t("founder.cta_button")}
          </Link>
        </div>
      </section>
    </Page>
  );
}
