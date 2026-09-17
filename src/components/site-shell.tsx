import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 font-display text-lg font-black text-foreground">
      <span className="grid size-8 place-items-center rounded-full bg-primary text-sm text-primary-foreground shadow-sm">⌣</span>
      <span>Shape My Sound</span>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = [
    { label: "Science", to: "/science" },
    { label: "Parents", to: "/parents" },
    { label: "NGOs", to: "/resources" },
  ] as const;
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="page-shell flex h-20 items-center justify-between gap-5">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          <a href="/#how" className="nav-link">How it works</a>
          {links.map((item) => (
            <Link key={item.label} to={item.to} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex rounded-full border border-border bg-card p-1 shadow-sm" aria-label="Language selector">
            {['EN', 'हिंदी', 'मराठी'].map((language, index) => (
              <button key={language} className={`lang-button ${index === 0 ? 'lang-active' : ''}`}>{language}</button>
            ))}
          </div>
          <Link to="/practice" className="button button-sun">Try a demo</Link>
          <button className="button button-quiet" onClick={() => navigate({ to: "/login" })}>Log out</button>
        </div>
        <button className="icon-button md:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="page-shell grid gap-2 border-t border-border py-4 md:hidden" aria-label="Mobile navigation">
          <a href="/#how" className="mobile-link">How it works</a>
          {links.map((item) => <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="mobile-link">{item.label}</Link>)}
          <Link to="/practice" className="button button-sun mt-2">Try a demo</Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const navigate = useNavigate();
  return (
    <footer className="bg-footer text-footer-foreground">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div><Logo /><p className="mt-5 max-w-xs text-sm leading-7 text-footer-muted">A calm, multisensory world where children ages 6–12 build communication confidence through sound, shape, and movement.</p></div>
        <FooterGroup title="Explore"><a href="/#how">How it works</a><Link to="/science">Science</Link><Link to="/parents">Parent dashboard</Link></FooterGroup>
        <FooterGroup title="Support"><Link to="/resources">Resources</Link><Link to="/resources">NGOs</Link><a href="/#partner">Partner with us</a></FooterGroup>
        <FooterGroup title="Session"><button onClick={() => navigate({ to: "/login" })} className="footer-logout"><LogOut size={16}/> Log out</button></FooterGroup>
      </div>
      <div className="border-t border-footer-border"><div className="page-shell flex flex-col justify-between gap-2 py-6 text-xs text-footer-muted sm:flex-row"><span>© 2026 Shape My Sound. A demonstration build.</span><span>Made with care for every young voice.</span></div></div>
    </footer>
  );
}

function FooterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div className="flex flex-col items-start gap-3 text-sm"><h2 className="text-xs font-black uppercase text-sun">{title}</h2>{children}</div>;
}

export function Page({ children }: { children: ReactNode }) {
  return <><SiteHeader /><main>{children}</main><SiteFooter /></>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

export function Mascot({ kind = "bouba", small = false }: { kind?: "bouba" | "kiki"; small?: boolean }) {
  if (kind === "kiki") return <div className={`kiki ${small ? "kiki-small" : ""}`} aria-label="Kiki, a friendly spiky shape"><span>••</span><i /></div>;
  return <div className={`bouba ${small ? "bouba-small" : ""}`} aria-label="Bouba, a friendly round shape"><span className="eyes"><i/><i/></span><span className="smile"/></div>;
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
    gain.gain.setValueAtTime(.18, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .9);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .9);
  };
}