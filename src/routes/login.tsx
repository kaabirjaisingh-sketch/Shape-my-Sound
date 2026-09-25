import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type AuthError,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Logo, Mascot } from "../components/site-shell";
import { auth, db } from "../lib/firebase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Shape My Sound" },
      { name: "description", content: "Sign in to your Shape My Sound account." },
      { property: "og:title", content: "Sign in — Shape My Sound" },
      { property: "og:description", content: "Sign in to your Shape My Sound account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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
    default:
      return t("login.error_generic");
  }
}

function Login() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
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
      nav({ to: "/" });
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
        <small>{mode === "signin" ? t("login.status_signin") : t("login.status_signup")}</small>
      </section>
      <section className="login-panel">
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
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
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
          {mode === "signin" && (
            <div className="form-row">
              <label className="check">
                <input type="checkbox" /> {t("login.remember_me")}
              </label>
              <a href="#help">{t("login.forgot_password")}</a>
            </div>
          )}
          {error && (
            <div className="toast" role="alert">
              {error}
            </div>
          )}
          <button className="button button-primary w-full" type="submit" disabled={loading}>
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
      </section>
    </main>
  );
}
