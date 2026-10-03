"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <main className="login">
      <Link href="/" className="eyebrow">
        ← Ko-op
      </Link>
      <h1>Modo edição</h1>
      <form action={action}>
        <input
          type="password"
          name="password"
          placeholder="Senha"
          autoComplete="current-password"
          autoFocus
          required
        />
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
      {state.error && <p className="error">{state.error}</p>}
    </main>
  );
}
