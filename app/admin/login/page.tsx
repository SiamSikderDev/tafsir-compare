"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FormField } from "@/components/admin/FormField";
import { TextInput, submitButtonClass } from "@/components/admin/fields";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") ? rawCallback : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("ইমেইল বা পাসওয়ার্ড ভুল");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormField label="ইমেইল" english="Email" required>
        <TextInput
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </FormField>
      <FormField label="পাসওয়ার্ড" english="Password" required>
        <TextInput
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </FormField>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-rose-600/25 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className={submitButtonClass}>
        {busy ? "সাইন ইন হচ্ছে…" : "সাইন ইন"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-pine-700 dark:bg-pine-600">
            <span
              aria-hidden
              dir="rtl"
              className="font-arabic text-xl font-bold text-white"
            >
              ت
            </span>
          </div>
          <p className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            তাফসীর তুলনা
          </p>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            অ্যাডমিন সাইন ইন · Admin sign in
          </p>
        </div>
        <Suspense
          fallback={
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              লোড হচ্ছে…
            </p>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
