"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "./fields";
import type { Role } from "./types";
import { roleLabel } from "./types";
import { errorMessage as apiErrorMessage } from "./utils";

const ROLES: Role[] = ["admin", "researcher", "reviewer", "viewer"];

export function UserRoleSelect({
  userId,
  currentRole,
  disabled,
  userName,
}: {
  userId: string;
  currentRole: Role;
  disabled: boolean;
  userName: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onChange = async (next: Role) => {
    setRole(next);
    setError("");
    if (next === currentRole) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        setError(apiErrorMessage(data, "ভূমিকা পরিবর্তন ব্যর্থ হয়েছে"));
        setRole(currentRole);
        return;
      }
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি — আবার চেষ্টা করুন");
      setRole(currentRole);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-w-36 flex-col gap-1">
      <Select
        aria-label={`${userName} — ভূমিকা`}
        value={role}
        disabled={disabled || busy}
        onChange={(e) => onChange(e.target.value as Role)}
        className="py-1.5 text-xs"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabel[r]} ({r})
          </option>
        ))}
      </Select>
      {disabled ? (
        <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
          নিজের ভূমিকা পরিবর্তন করা যাবে না
        </span>
      ) : null}
      {error ? (
        <span className="text-[11px] font-medium text-rose-600">{error}</span>
      ) : null}
    </div>
  );
}
