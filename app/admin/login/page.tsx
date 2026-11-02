import { signInPossible } from "@/lib/auth";
import s from "../admin.module.css";

export const metadata = { title: "Sign in — 3D Hologram Ads analytics" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string; email?: string }> }) {
  const { error, next, email } = await searchParams;
  const possible = await signInPossible();
  return (
    <main className={s.login}>
      <form className={s.loginCard} method="post" action="/api/admin/login">
        <h1>
          <span style={{ color: "var(--accent)" }}>3D</span> Hologram Ads · Analytics
        </h1>
        {!possible && <p className={s.error}>No admin account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server to create the first one, then sign in with them.</p>}
        {error === "locked" ? (
          <p className={s.error}>Too many tries. Wait a minute, then try again.</p>
        ) : error ? (
          <p className={s.error}>That email and password didn't match.</p>
        ) : null}
        <label className={s.field}>
          Email
          <input type="email" name="email" autoComplete="username" defaultValue={email ?? ""} autoFocus={!email} required />
        </label>
        <label className={s.field}>
          Password
          <input type="password" name="password" autoComplete="current-password" autoFocus={Boolean(email)} required />
        </label>
        <input type="hidden" name="next" value={next ?? "/admin"} />
        <button className={`${s.btn} ${s.btnPrimary}`} type="submit" disabled={!possible}>
          Sign in
        </button>
      </form>
    </main>
  );
}
