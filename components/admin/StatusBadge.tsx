import type { ReactNode } from "react";
import type { Confidence, PublishStatus, School } from "./types";
import { confidenceLabel, schoolLabel, statusLabel } from "./types";

function Badge({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

const statusStyles: Record<PublishStatus, string> = {
  draft:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  review: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  published:
    "bg-pine-100 text-pine-800 dark:bg-pine-500/20 dark:text-pine-200",
};

export function StatusBadge({ status }: { status: PublishStatus }) {
  return <Badge className={statusStyles[status]}>{statusLabel[status]}</Badge>;
}

const schoolStyles: Record<School, string> = {
  sunni:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300",
  shia: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300",
  shared:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300",
};

export function SchoolBadge({ school }: { school: School }) {
  return <Badge className={schoolStyles[school]}>{schoolLabel[school]}</Badge>;
}

const confidenceStyles: Record<Confidence, string> = {
  high: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300",
  medium:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300",
  low: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300",
};

export function ConfidenceBadge({
  confidence,
}: {
  confidence: Confidence;
}) {
  return (
    <Badge className={confidenceStyles[confidence]}>
      {confidenceLabel[confidence]}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <Badge className="bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300">
      {role}
    </Badge>
  );
}
