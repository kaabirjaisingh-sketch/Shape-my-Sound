import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  type AuthError,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Logo, Mascot } from "../components/site-shell";
import { auth, db } from "../lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in | Shape My Sound" },
      { name: "description", content: "Sign in to your Shape My Sound account." },
      { property: "og:title", content: "Sign in | Shape My Sound" },
      { property: "og:description", content: "Sign in to your Shape My Sound account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  // Only same-site paths are accepted so the login page can't redirect elsewhere.
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = search["redirect"];
    return typeof redirect === "string" &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//") &&
      !redirect.startsWith("/login")
      ? { redirect }
      : {};
  },
  component: Login,
});

function friendlyAuthError(error: AuthError, t: TFunction): string {
  switch (error.code) {
    case "auth/invalid-email":
      return t("login.error_invalid_email");
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return t("login.error_invalid_credential");
    case "auth/email-already-in-use":
      return t("login.error_email_in_use");
    case "auth/weak-password":
      return t("login.error_weak_password");
    case "auth/too-many-requests":
      return t("login.error_too_many");
    default:
      return t("login.error_generic");
  }
}

function Login() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [remember, setRemember] = useState(true);
  const [resetSent, setResetSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Until the page's code has loaded, a click would just reload the page and clear
  // the form, so the submit buttons wait for it.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        setResetSent(true);
        return;
      }
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), {
          name,
          email,
          createdAt: serverTimestamp(),
        });
      }
      nav({ href: redirect ?? "/practice" });
    } catch (err) {
      setError(friendlyAuthError(err as AuthError, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-art">
        <Logo />
        <div>
          <Mascot />
          <h1>{t("login.art_title")}</h1>
          <p>{t("login.art_copy")}</p>
        </div>
        <small>{mode === "signup" ? t("login.status_signup") : t("login.status_signin")}</small>
      </section>
      <section className="login-panel">
        {mode === "reset" ? (
          <form className="login-form" onSubmit={submit}>
            <h2>{t("login.reset_title")}</h2>
            <p>{t("login.reset_copy")}</p>
            {resetSent ? (
              <div className="notice" role="status">
                {t("login.reset_sent", { email })}
              </div>
            ) : (
              <>
                <label>
                  {t("login.label_email")}
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                {error && (
                  <div className="toast" role="alert">
                    {error}
                  </div>
                )}
                <button
                  className="button button-primary w-full mt-6"
                  type="submit"
                  disabled={loading || !ready}
                >
                  {loading ? t("login.submitting") : t("login.reset_submit")}
                </button>
              </>
            )}
            <button
              type="button"
              className="button button-quiet w-full mt-3"
              onClick={() => {
                setError("");
                setResetSent(false);
                setMode("signin");
              }}
            >
              {t("login.back_to_signin")}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={submit}>
            <h2>
              {mode === "signin" ? t("login.panel_title_signin") : t("login.panel_title_signup")}
            </h2>
            <p>{mode === "signin" ? t("login.panel_copy_signin") : t("login.panel_copy_signup")}</p>
            {mode === "signup" && (
              <label>
                {t("login.label_name")}
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            )}
            <label>
              {t("login.label_email")}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              {t("login.label_password")}
              <span className="password-wrap">
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff /> : <Eye />}
                </button>
              </span>
            </label>
            <div className="form-row">
              <label className="check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{" "}
                {t("login.remember_me")}
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setError("");
                    setMode("reset");
                  }}
                >
                  {t("login.forgot_password")}
                </button>
              )}
            </div>
            {error && (
              <div className="toast" role="alert">
                {error}
              </div>
            )}
            <button
              className="button button-primary w-full"
              type="submit"
              disabled={loading || !ready}
            >
              {loading
                ? t("login.submitting")
                : mode === "signin"
                  ? t("login.submit_signin")
                  : t("login.submit_signup")}
            </button>
            <button
              type="button"
              className="button button-quiet w-full"
              onClick={() => {
                setError("");
                setMode(mode === "signin" ? "signup" : "signin");
              }}
            >
              {mode === "signin" ? t("login.toggle_to_signup") : t("login.toggle_to_signin")}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
