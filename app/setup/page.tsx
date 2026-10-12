"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FormField } from "@/components/admin/FormField";
import { TextInput, submitButtonClass } from "@/components/admin/fields";

export default function SetupPage() {
  const [checking, setChecking] = useState(true);
  const [needed, setNeeded] = useState(false);
  const [name, setName] = useState("Siam Sikder");
  const [email, setEmail] = useState("mdsiamsikder175@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((d) => setNeeded(d.setupNeeded === true))
      .catch(() => setNeeded(false))
      .finally(() => setChecking(false));
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.error === "Setup already completed."
            ? "সেটআপ ইতিমধ্যে সম্পন্ন হয়েছে।"
            : "ইমেইল/পাসওয়ার্ড ঠিক আছে কিনা দেখুন (পাসওয়ার্ড কমপক্ষে ৮ অক্ষর)",
        );
        return;
      }
      setDone(true);
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setBusy(false);
    }
  };

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
            প্রাথমিক সেটআপ · First admin account
          </p>
        </div>

        {checking ? (
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            লোড হচ্ছে…
          </p>
        ) : done ? (
          <div className="text-center">
            <p className="text-sm font-medium text-pine-700 dark:text-pine-400">
              অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে!
            </p>
            <Link
              href="/admin/login"
              className="mt-4 inline-block text-sm font-medium text-neutral-900 underline dark:text-neutral-50"
            >
              সাইন ইন করুন →
            </Link>
          </div>
        ) : !needed ? (
          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              সেটআপ ইতিমধ্যে সম্পন্ন হয়েছে।
            </p>
            <Link
              href="/admin/login"
              className="mt-4 inline-block text-sm font-medium text-neutral-900 underline dark:text-neutral-50"
            >
              সাইন ইন করুন →
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField label="নাম" english="Name" required>
              <TextInput
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </FormField>
            <FormField label="ইমেইল" english="Email" required>
              <TextInput
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <FormField label="পাসওয়ার্ড" english="Password (min 8 chars)" required>
              <TextInput
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
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
              {busy ? "তৈরি হচ্ছে…" : "অ্যাডমিন তৈরি করুন"}
            </button>
            <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
              এই পেজ শুধুমাত্র প্রথমবার কাজ করবে
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
