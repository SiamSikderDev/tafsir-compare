import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Surah } from "@/models/Surah";
import { Verse } from "@/models/Verse";
import { Tafsir } from "@/models/Tafsir";
import { Hadith } from "@/models/Hadith";
import { ResearchNote } from "@/models/ResearchNote";
import { AuditLog } from "@/models/AuditLog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SeedSurahsButton } from "@/components/admin/SeedSurahsButton";
import { SeedVersesButton } from "@/components/admin/SeedVersesButton";
import { SeedBatchButton } from "@/components/admin/SeedBatchButton";

// Approved research batches, one click each. Add a new line per approved batch —
// no new routes needed. The batch key must match scripts/data/<key>.json.
const APPROVED_BATCHES: { key: string; label: string; blurb: string }[] = [
  {
    key: "baqarah-2-1-5",
    label: "বাকারা ২:১–২:৫ প্রকাশ করুন (অনুমোদনের পর)",
    blurb: "২০টি তাফসীর, ৯টি হাদিস (সুন্নি + শিয়া), ১০টি তুলনামূলক নোট (বাংলা + ইংরেজি)।",
  },
  {
    key: "baqarah-2-6-10",
    label: "বাকারা ২:৬–২:১০ প্রকাশ করুন (অনুমোদনের পর)",
    blurb: "২০টি তাফসীর, ৭টি হাদিস (সুন্নি + শিয়া), ১০টি তুলনামূলক নোট (বাংলা + ইংরেজি)।",
  },
  {
    key: "baqarah-2-11-15",
    label: "বাকারা ২:১১–২:১৫ প্রকাশ করুন (অনুমোদনের পর)",
    blurb: "২০টি তাফসীর, ৫টি হাদিস (সুন্নি + শিয়া), ১০টি তুলনামূলক নোট (বাংলা + ইংরেজি)।",
  },
  {
    key: "baqarah-2-16-20",
    label: "বাকারা ২:১৬–২:২০ প্রকাশ করুন (অনুমোদনের পর)",
    blurb: "২০টি তাফসীর, ৭টি হাদিস (সুন্নি + শিয়া), ১০টি তুলনামূলক নোট (বাংলা + ইংরেজি)।",
  },
  {
    key: "baqarah-2-21-25",
    label: "বাকারা ২:২১–২:২৫ প্রকাশ করুন (অনুমোদনের পর)",
    blurb: "২০টি তাফসীর, ৫টি হাদিস (সুন্নি + শিয়া), ১০টি তুলনামূলক নোট (বাংলা + ইংরেজি)।",
  },
  {
    key: "fatihah-1-1-master",
    label: "ফাতিহা ১:১ মাস্টার ফ্রেমওয়ার্ক প্রকাশ করুন (অনুমোদনের পর)",
    blurb: "১৮টি তাফসীর (৫ সুন্নি + ৪ শিয়া), ১৪টি হাদিস, শান-এ-নুযূল, তুলনা টেবিল (বাংলা + ইংরেজি)।",
  },
];
import { formatDateTime, truncate } from "@/components/admin/utils";
import {
  verseLabel,
  verseRefOf,
  type PublishStatus,
  type SerializedAuditLog,
  type SerializedResearchNote,
} from "@/components/admin/types";

export const dynamic = "force-dynamic";

function Card({
  bn,
  en,
  value,
  href,
}: {
  bn: string;
  en: string;
  value: number;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {bn}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{en}</p>
    </>
  );
  const cls =
    "rounded-lg border border-neutral-200 bg-white p-6 transition dark:border-neutral-800 dark:bg-neutral-950";
  return href ? (
    <Link href={href} className={`${cls} hover:border-neutral-300 dark:hover:border-neutral-700`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        {title}
      </h2>
      <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
        {subtitle}
      </p>
      {children}
    </section>
  );
}

export default async function AdminDashboardPage() {
  await connectDB();

  const [surahCount, verseCount, tafsirCount, hadithCount, noteCount] =
    await Promise.all([
      Surah.countDocuments(),
      Verse.countDocuments(),
      Tafsir.countDocuments(),
      Hadith.countDocuments(),
      ResearchNote.countDocuments(),
    ]);

  const missingBnCount = await Verse.countDocuments({
    $or: [{ bengaliTranslation: "" }, { bengaliTranslation: { $exists: false } }],
  });

  const statusAgg = (await ResearchNote.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ])) as { _id: string; count: number }[];
  const notesByStatus: Record<string, number> = {};
  for (const row of statusAgg) notesByStatus[row._id] = row.count;

  const [tafsirsInReview, hadithsInReview] = await Promise.all([
    Tafsir.countDocuments({ status: "review" }),
    Hadith.countDocuments({ status: "review" }),
  ]);

  const pendingNotes = JSON.parse(
    JSON.stringify(
      await ResearchNote.find({ status: "review" })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("verseId", "surahNumber ayahNumber")
        .lean(),
    ),
  ) as SerializedResearchNote[];

  const recentLogs = JSON.parse(
    JSON.stringify(
      await AuditLog.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "name email")
        .lean(),
    ),
  ) as SerializedAuditLog[];

  const statuses: PublishStatus[] = ["draft", "review", "published"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
        ড্যাশবোর্ড
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Dashboard · এক নজরে প্ল্যাটফর্মের অবস্থা
      </p>

      {surahCount === 0 && (
        <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            ডাটাবেস খালি — ১১৪ সূরার তথ্য সিড করুন
          </h2>
          <p className="mb-4 mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            সূরার নাম, আয়াত সংখ্যা, মাক্কি/মাদানি শ্রেণি এবং নাজিলের
            ক্রম — পাবলিক ব্রাউজিং চালু করার প্রথম ধাপ। এই অপারেশনটি
            নিরাপদ: ডাটাবেসে সূরার তথ্য থাকলে কিছুই হবে না।
          </p>
          <SeedSurahsButton />
        </section>
      )}

      {surahCount > 0 && (verseCount < 6236 || missingBnCount > 0) && (
        <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            ৬২৩৬ আয়াত ইমপোর্ট করুন
          </h2>
          <p className="mb-4 mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            যাচাইকৃত উৎস থেকে ৬২৩৬ আয়াতের আরবি পাঠ (তানযীল প্রকল্প, উসমানি
            রসম — হুবহু, অপরিবর্তিত), ইংরেজি অনুবাদ (সহীহ ইন্টারন্যাশনাল)
            ও বাংলা অনুবাদ (ড. মুহিউদ্দীন খান) ডাটাবেজে যোগ করুন। একবারে
            একটি সূরা করে ইমপোর্ট হয়; মাঝপথে থামলেও আবার চালালে বাকিটুকু
            শেষ হবে।
          </p>
          <SeedVersesButton />
        </section>
      )}

      {surahCount > 0 && (
        <section className="mb-6 rounded-lg border border-violet-200 bg-violet-50 p-6 dark:border-violet-900 dark:bg-violet-950/40">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            গবেষণা ব্যাচ প্রকাশ
          </h2>
          <p className="mb-4 mt-1 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            গবেষণা-অনুমোদিত ব্যাচগুলো এক ক্লিকে প্রকাশ করুন। শুধুমাত্র
            সংশ্লিষ্ট গবেষণা ড্রাফট অনুমোদনের পর ক্লিক করুন। নিরাপদ: আগে
            থেকে থাকলে আপডেট হবে।
          </p>
          <div className="flex flex-col gap-4">
            {APPROVED_BATCHES.map((b) => (
              <div key={b.key}>
                <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">{b.blurb}</p>
                <SeedBatchButton batchKey={b.key} label={b.label} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card bn="মোট আয়াত" en="Total verses" value={verseCount} href="/admin/verses" />
        <Card bn="মোট তাফসীর" en="Total tafsir entries" value={tafsirCount} href="/admin/tafsirs" />
        <Card bn="মোট হাদিস" en="Total hadith entries" value={hadithCount} href="/admin/hadiths" />
        <Card
          bn="মোট গবেষণা নোট"
          en="Total research notes"
          value={noteCount}
          href="/admin/research"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statuses.map((s) => (
          <Card
            key={s}
            bn={
              s === "draft"
                ? "খসড়া নোট"
                : s === "review"
                  ? "পর্যালোচনাধীন নোট"
                  : "প্রকাশিত নোট"
            }
            en={`Research notes · ${s}`}
            value={notesByStatus[s] ?? 0}
            href={`/admin/research?status=${s}`}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="রিভিউ অপেক্ষমাণ গবেষণা নোট"
          subtitle="Research notes awaiting review (latest 10)"
        >
          {pendingNotes.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              কোনো নোট পর্যালোচনার অপেক্ষায় নেই।
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
              {pendingNotes.map((n) => (
                <li key={n._id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      href="/admin/review"
                      className="block truncate text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
                    >
                      {truncate(n.title, 60)}
                    </Link>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      আয়াত {verseLabel(verseRefOf(n.verseId))} ·{" "}
                      {formatDateTime(n.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge status={n.status} />
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/review"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
          >
            রিভিউ কিউ দেখুন →
          </Link>
        </Panel>

        <Panel
          title="সাম্প্রতিক কার্যকলাপ"
          subtitle="Latest audit log entries"
        >
          {recentLogs.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              এখনো কোনো কার্যকলাপ রেকর্ড হয়নি।
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
              {recentLogs.map((l) => {
                const user =
                  l.userId && typeof l.userId === "object"
                    ? l.userId.name || l.userId.email
                    : "—";
                return (
                  <li key={l._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {l.action}
                        <span className="ml-2 font-normal text-neutral-500 dark:text-neutral-400">
                          {l.collectionName}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {user} · {formatDateTime(l.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/admin/audit-logs"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
          >
            সব অডিট লগ দেখুন →
          </Link>
        </Panel>
      </div>

      {(tafsirsInReview > 0 || hadithsInReview > 0) && (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            পর্যালোচনার অপেক্ষায়: {tafsirsInReview}টি তাফসীর, {hadithsInReview}টি
            হাদিস
          </p>
          <div className="mt-2 flex gap-4 text-sm font-semibold">
            <Link
              href="/admin/tafsirs?status=review"
              className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
            >
              তাফসীর দেখুন →
            </Link>
            <Link
              href="/admin/hadiths?status=review"
              className="text-sm font-medium text-neutral-900 hover:underline dark:text-neutral-100"
            >
              হাদিস দেখুন →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
