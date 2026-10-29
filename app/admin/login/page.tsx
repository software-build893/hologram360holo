import { adminConfigured } from "@/lib/auth";
import s from "../admin.module.css";

export const metadata = { title: "Sign in — 3D Hologram Ads analytics" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const configured = adminConfigured();
  return (
    <main className={s.login}>
      <form className={s.loginCard} method="post" action="/api/admin/login">
        <h1>
          <span style={{ color: "var(--accent)" }}>3D</span> Hologram Ads · Analytics
        </h1>
        {!configured && <p className={s.error}>ADMIN_PASSWORD is not set on the server, so no one can sign in yet. Add it to .env.local and restart.</p>}
        {error && <p className={s.error}>That password didn't match.</p>}
        <label className={s.field}>
          Password
          <input type="password" name="password" autoComplete="current-password" autoFocus required />
        </label>
        <input type="hidden" name="next" value={next ?? "/admin"} />
        <button className={`${s.btn} ${s.btnPrimary}`} type="submit" disabled={!configured}>
          Sign in
        </button>
      </form>
    </main>
  );
}
