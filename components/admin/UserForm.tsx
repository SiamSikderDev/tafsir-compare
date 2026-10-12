"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "./FormField";
import {
  Select,
  TextInput,
  submitButtonClass,
} from "./fields";
import type { Role } from "./types";
import { errorMessage } from "./utils";

export function UserForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer" as Role,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("নাম আবশ্যক");
      return;
    }
    if (!form.email.trim()) {
      setError("ইমেইল আবশ্যক");
      return;
    }
    if (form.password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(errorMessage(data, "ব্যবহারকারী তৈরি ব্যর্থ হয়েছে"));
        return;
      }
      setForm({ name: "", email: "", password: "", role: "viewer" });
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField label="নাম" english="Name" required>
        <TextInput
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="ব্যবহারকারীর নাম"
          required
        />
      </FormField>
      <FormField label="ইমেইল" english="Email" required>
        <TextInput
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="user@example.com"
          required
        />
      </FormField>
      <FormField
        label="পাসওয়ার্ড"
        english="Password"
        required
        hint="কমপক্ষে ৮ অক্ষর"
      >
        <TextInput
          type="password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          placeholder="••••••••"
          required
        />
      </FormField>
      <FormField label="ভূমিকা" english="Role">
        <Select value={form.role} onChange={(e) => set("role", e.target.value)}>
          <option value="viewer">দর্শক (Viewer)</option>
          <option value="researcher">গবেষক (Researcher)</option>
          <option value="reviewer">পর্যালোচক (Reviewer)</option>
          <option value="admin">অ্যাডমিন (Admin)</option>
        </Select>
      </FormField>

      {error ? (
        <p className="rounded-md border border-rose-600/25 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={saving} className={submitButtonClass}>
        {saving ? "তৈরি হচ্ছে…" : "ব্যবহারকারী তৈরি করুন"}
      </button>
    </form>
  );
}
