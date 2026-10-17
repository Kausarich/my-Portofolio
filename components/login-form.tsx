"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions";
import { ArrowUpRightIcon, LockSimpleIcon } from "@phosphor-icons/react";
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" });
  const [email, setEmail] = useState("");
  return (
    <div className="login-form-wrap">
      <Link className="text-link" href="/">
        ← Back to portfolio
      </Link>
      <div className="login-lock">
        <LockSimpleIcon size={25} />
      </div>
      <span className="section-index">JUST FOR YOU</span>
      <h2>Welcome back.</h2>
      <p>Make a little room for your next big idea.</p>
      <form action={action}>
        <label>
          Email address
          <input
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your owner password"
            maxLength={256}
            required
          />
        </label>
        {state.error && (
          <p className="form-error" role="alert">
            {state.error}
          </p>
        )}
        <button className="button button-primary" disabled={pending}>
          {pending ? "Signing in…" : "Enter your workspace"}
          <ArrowUpRightIcon size={18} />
        </button>
      </form>
      <span className="login-security">
        <LockSimpleIcon size={12} /> Protected, private, and yours.
      </span>
    </div>
  );
}
