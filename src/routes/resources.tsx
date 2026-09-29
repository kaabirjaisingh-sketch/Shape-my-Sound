import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Clock3, MessageSquare, PersonStanding, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eyebrow, Page } from "../components/site-shell";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources | Shape My Sound" },
      {
        name: "description",
        content: "Calm, practical guidance for parents, teachers, and organizations.",
      },
      { property: "og:title", content: "Resources | Shape My Sound" },
      { property: "og:description", content: "Support for everyone helping a young voice grow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Resources,
});

type Tab = "Parents" | "Teachers" | "NGOs";
type ResourceKey = { Icon: LucideIcon; titleKey: string; copyKey: string; typeKey: string };

const CONTENT: Record<Tab, ResourceKey[]> = {
  Parents: [
    {
      Icon: BookOpen,
      titleKey: "resources.parents_1_title",
      copyKey: "resources.parents_1_copy",
      typeKey: "resources.type_guide",
    },
    {
      Icon: PersonStanding,
      titleKey: "resources.parents_2_title",
      copyKey: "resources.parents_2_copy",
      typeKey: "resources.type_article",
    },
    {
      Icon: MessageSquare,
      titleKey: "resources.parents_3_title",
      copyKey: "resources.parents_3_copy",
      typeKey: "resources.type_coming_soon",
    },
  ],
  Teachers: [
    {
      Icon: BookOpen,
      titleKey: "resources.teachers_1_title",
      copyKey: "resources.teachers_1_copy",
      typeKey: "resources.type_guide",
    },
    {
      Icon: PersonStanding,
      titleKey: "resources.teachers_2_title",
      copyKey: "resources.teachers_2_copy",
      typeKey: "resources.type_activity",
    },
    {
      Icon: MessageSquare,
      titleKey: "resources.teachers_3_title",
      copyKey: "resources.teachers_3_copy",
      typeKey: "resources.type_coming_soon",
    },
  ],
  NGOs: [
    {
      Icon: BookOpen,
      titleKey: "resources.ngos_1_title",
      copyKey: "resources.ngos_1_copy",
      typeKey: "resources.type_guide",
    },
    {
      Icon: PersonStanding,
      titleKey: "resources.ngos_2_title",
      copyKey: "resources.ngos_2_copy",
      typeKey: "resources.type_toolkit",
    },
    {
      Icon: MessageSquare,
      titleKey: "resources.ngos_3_title",
      copyKey: "resources.ngos_3_copy",
      typeKey: "resources.type_coming_soon",
    },
  ],
};

function Resources() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("Parents");
  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "Parents", label: t("resources.tab_parents") },
    { key: "Teachers", label: t("resources.tab_teachers") },
    { key: "NGOs", label: t("resources.tab_ngos") },
  ];

  return (
    <Page>
      <section className="page-hero">
        <Eyebrow>{t("resources.eyebrow")}</Eyebrow>
        <h1>{t("resources.title")}</h1>
        <p>{t("resources.copy")}</p>
      </section>
      <section className="section page-shell">
        <div className="tabs">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={tab === key ? "tab-active" : ""}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="feature-grid">
          {CONTENT[tab].map(({ Icon, titleKey, copyKey, typeKey }) => (
            <article className="feature-card" key={titleKey}>
              <span className="feature-icon">
                <Icon />
              </span>
              <h2>{t(titleKey)}</h2>
              <p>{t(copyKey)}</p>
              <span className="resource-type">
                <Clock3 size={14} />
                {t(typeKey)}
              </span>
            </article>
          ))}
        </div>
        <div className="contact-card">
          <h2>{t("resources.contact_title")}</h2>
          <p>{t("resources.contact_copy")}</p>
          <a href="/#partner" className="button button-primary">
            {t("resources.contact_cta")}
          </a>
        </div>
      </section>
    </Page>
  );
}
