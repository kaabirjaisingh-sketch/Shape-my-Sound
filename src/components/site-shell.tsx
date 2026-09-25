import { Link, useNavigate } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../lib/auth-context";
import { auth } from "../lib/firebase";
import { SUPPORTED_LANGUAGES, setLanguage, type LanguageCode } from "../lib/i18n";

export function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-3 font-display text-lg font-black text-foreground"
    >
      <span className="grid size-8 place-items-center rounded-full bg-primary text-sm text-primary-foreground shadow-sm">
        ⌣
      </span>
      <span>Shape My Sound</span>
    </Link>
  );
}

function LanguageSelector({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  return (
    <div className={className} aria-label="Language selector">
      {SUPPORTED_LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          className={`lang-button ${i18n.language === code ? "lang-active" : ""}`}
          onClick={() => setLanguage(code as LanguageCode)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const links = [
    { label: t("common.nav_science"), to: "/science" },
    { label: t("common.nav_parents"), to: "/parents" },
    { label: t("common.nav_ngos"), to: "/resources" },
  ] as const;
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="page-shell flex h-20 items-center justify-between gap-5">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          <a href="/#how" className="nav-link">
            {t("common.nav_how")}
          </a>
          {links.map((item) => (
            <Link key={item.to} to={item.to} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSelector className="flex rounded-full border border-border bg-card p-1 shadow-sm" />
          <Link to="/practice" className="button button-sun">
            {t("common.nav_try_demo")}
          </Link>
          {user ? (
            <button className="button button-quiet" onClick={() => signOut(auth)}>
              {t("common.nav_log_out")}
            </button>
          ) : (
            <button className="button button-quiet" onClick={() => navigate({ to: "/login" })}>
              {t("common.nav_log_in")}
            </button>
          )}
        </div>
        <button
          className="icon-button lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          className="page-shell grid gap-2 border-t border-border py-4 lg:hidden"
          aria-label="Mobile navigation"
        >
          <a href="/#how" className="mobile-link">
            {t("common.nav_how")}
          </a>
          {links.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="mobile-link">
              {item.label}
            </Link>
          ))}
          <LanguageSelector className="mt-1 flex w-fit rounded-full border border-border bg-card p-1 shadow-sm" />
          <Link to="/practice" className="button button-sun mt-2">
            {t("common.nav_try_demo")}
          </Link>
          {user ? (
            <button className="button button-quiet" onClick={() => signOut(auth)}>
              {t("common.nav_log_out")}
            </button>
          ) : (
            <button
              className="button button-quiet"
              onClick={() => {
                setOpen(false);
                navigate({ to: "/login" });
              }}
            >
              {t("common.nav_log_in")}
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-7 text-footer-muted">
            {t("common.footer_tagline")}
          </p>
        </div>
        <FooterGroup title={t("common.footer_explore")}>
          <a href="/#how">{t("common.nav_how")}</a>
          <Link to="/science">{t("common.nav_science")}</Link>
          <Link to="/parents">{t("common.footer_parent_dashboard")}</Link>
        </FooterGroup>
        <FooterGroup title={t("common.footer_support")}>
          <Link to="/resources">{t("common.footer_resources")}</Link>
          <Link to="/resources">{t("common.nav_ngos")}</Link>
          <a href="/#partner">{t("common.footer_partner")}</a>
        </FooterGroup>
        <FooterGroup title={t("common.footer_session")}>
          {user ? (
            <button onClick={() => signOut(auth)} className="footer-logout">
              <LogOut size={16} /> {t("common.nav_log_out")}
            </button>
          ) : (
            <button onClick={() => navigate({ to: "/login" })} className="footer-logout">
              <LogOut size={16} /> {t("common.nav_log_in")}
            </button>
          )}
        </FooterGroup>
      </div>
      <div className="border-t border-footer-border">
        <div className="page-shell flex flex-col justify-between gap-2 py-6 text-xs text-footer-muted sm:flex-row">
          <span>{t("common.footer_copyright")}</span>
          <span>{t("common.footer_made_with")}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 text-sm">
      <h2 className="text-xs font-black uppercase text-sun">{title}</h2>
      {children}
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function Mascot({
  kind = "bouba",
  small = false,
}: {
  kind?: "bouba" | "kiki";
  small?: boolean;
}) {
  const { t } = useTranslation();
  if (kind === "kiki")
    return (
      <div className={`kiki ${small ? "kiki-small" : ""}`} aria-label={t("common.mascot_kiki_alt")}>
        <span>••</span>
        <i />
      </div>
    );
  return (
    <div
      className={`bouba ${small ? "bouba-small" : ""}`}
      aria-label={t("common.mascot_bouba_alt")}
    >
      <span className="eyes">
        <i />
        <i />
      </span>
      <span className="smile" />
    </div>
  );
}

export function useTone() {
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof window !== "undefined" && Boolean(window.AudioContext)), []);
  return () => {
    if (!supported) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(220, context.currentTime);
    gain.gain.setValueAtTime(0.18, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.9);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.9);
  };
}
