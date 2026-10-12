# Product Research — Tafsir Compare

**তাফসীর তুলনা · Quran Tafsir: Sunni & Shia Perspectives**

This document describes the product as actually built (Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4, MongoDB + Mongoose, Auth.js v5, Zod). Every page, component, and API referenced below exists in the codebase.

---

## ১. লক্ষ্য শ্রোতা (Target Audience)

প্রাথমিক শ্রোতা বাংলাদেশের বাংলাভাষী মুসলিম পাঠক — যারা কুরআনের আয়াত শুধু পড়তে নয়, **বুঝতে** চান এবং জানতে চান সুন্নি ও শিয়া আলেমগণ একই আয়াতকে কীভাবে ব্যাখ্যা করেছেন।

Secondary audiences:

- **Students** — কলেজ/বিশ্ববিদ্যালয়ের শিক্ষার্থী, ইসলামিক স্টাডিজ পড়ুয়া
- **Madrasa teachers & imams** — পাঠদানের জন্য যাচাইকৃত সূত্রসহ ব্যাখ্যা খোঁজেন
- **Comparative-religion researchers** — দুই মাযহাবের দৃষ্টিভঙ্গির নিরপেক্ষ তুলনা চান
- **Curious readers** — সোশ্যাল মিডিয়ায় শোনা দাবির সত্যতা যাচাই করতে চান
- **Content researchers (internal)** — admin panel ব্যবহার করে draft → review → published workflow-এ কনটেন্ট তৈরি করেন

দুটি শর্ত সব শ্রোতার জন্য সমান: প্রতিটি দাবির পেছনে **সঠিক সূত্র** থাকতে হবে, এবং কোনো মাযহাবের প্রতি **অবমাননাকর ভাষা** ব্যবহার করা যাবে না।

---

## ২. ব্যবহারকারী পারসোনা (User Personas)

### পারসোনা ১: রাফি — কলেজ শিক্ষার্থী (পাঠক)
- বয়স ২০, ঢাকা। মোবাইলেই সব পড়ে।
- বন্ধুরা WhatsApp-এ আয়াতের ব্যাখ্যা পাঠায়; কোনটা সঠিক বুঝতে পারে না।
- চায়: আয়াতের বাংলা অনুবাদ + সংক্ষিপ্ত ব্যাখ্যা + "এটা কোন বই থেকে নেওয়া" — এক নজরে।
- Pain point: "ইন্টারনেটে তাফসীর আছে, কিন্তু কোনটা সুন্নি কোনটা শিয়া বোঝা যায় না।"

### পারসোনা ২: মাওলানা করিম — মাদ্রাসা শিক্ষক (পাঠক/যাচাইকারী)
- পাঠদানের আগে ব্যাখ্যার সূত্র যাচাই করেন।
- চান: প্রতিটি তাফসীরের নিচে বইয়ের নাম, লেখক, খণ্ড, পৃষ্ঠা — হুবহু উদ্ধৃতি।
- Pain point: "অনুবাদ আছে, সূত্র নেই — এমন সাইট থেকে পড়ানো যায় না।"

### পারসোনা ৩: ড. নাসরিন — গবেষক (তুলনামূলক পাঠক)
- সুন্নি-শিয়া ব্যাখ্যার পার্থক্য নিয়ে গবেষণা করেন।
- চান: Comparison tab — agreements / differences / neutral explanation আলাদা করে, confidence level সহ।
- Pain point: "দুই পক্ষের বক্তব্য এক জায়গায়, নিরপেক্ষ ভাষায় পাওয়া কঠিন।"

### পারসোনা ৪: তানভীর — কৌতূহলী পাঠক (সার্চ ব্যবহারকারী)
- সার্চ বারে প্রশ্ন লিখে আয়াত খোঁজেন।
- চান: দ্রুত ফলাফল, snippet সহ, সরাসরি আয়াত পেজের লিংক।
- Pain point: "আরবি না জানলেও বাংলায় সার্চ করে আয়াত পেতে চাই।"

### পারসোনা ৫: গবেষক টিম (internal — researcher/reviewer/admin)
- Admin panel (`/admin`) থেকে কনটেন্ট তৈরি ও প্রকাশ করেন।
- Researcher লেখেন (draft), reviewer যাচাই করেন (review), admin প্রকাশ করেন (published)।
- চান: পরিষ্কার review queue, audit trail, role-based access।

---

## ৩. মূল ব্যবহারকারী যাত্রা (Core User Journeys)

### Journey A — ব্রাউজ করে তুলনা পড়া (প্রধান)
1. `/` হোমপেজে আসেন → search bar বা "সূরা দেখুন" CTA
2. `/surah` থেকে সূরা বাছেন (নাম/নম্বর দিয়ে ফিল্টার)
3. `/surah/[surah]`-তে আয়াতের তালিকা পড়েন (আরবি + বাংলা)
4. `/surah/[surah]/ayah/[ayah]`-তে পূর্ণ আয়াত পেজ খোলেন
5. Tab বদলে পড়েন: **সুন্নি তাফসীর → শিয়া তাফসীর → হাদিস → তুলনা → সূত্র**
6. প্রয়োজনে copy / share / bookmark করেন

### Journey B — সার্চ করে আয়াত খোঁজা
1. Header-এর SearchBar বা `/search` পেজে প্রশ্ন লেখেন (debounced live search)
2. ফলাফলে surah/ayah ref, snippet, school chip, confidence দেখেন
3. ক্লিক করে সরাসরি আয়াত পেজে যান

### Journey C — গবেষকের প্রকাশনা প্রবাহ (internal)
1. `/admin/login` → role অনুযায়ী dashboard
2. Researcher: `/admin/research/new` → draft তৈরি
3. Status: `draft → review` (review queue-তে যায়)
4. Reviewer: `/admin/review` → যাচাই → `review → published` (বা সংশোধনের জন্য `review → draft`)
5. প্রতিটি mutation audit log-এ রেকর্ড হয় (`/admin/audit-logs`)

---

## ৪. ফিচার অগ্রাধিকার (Feature Prioritization)

### MVP — ইতিমধ্যে নির্মিত
- Public: homepage, surah list, surah view, verse detail page (5 tab), search, about, sources
- Verse actions: copy, share (Web Share API + clipboard fallback), bookmark (localStorage), reading mode, prev/next ayah
- Admin: login, dashboard, verses/tafsirs/hadiths/research/references CRUD, review queue, users, audit logs
- Editorial gate: draft → review → published; role-based auth (admin/researcher/reviewer/viewer)
- SEO: per-verse `generateMetadata` (canonical + OpenGraph article)

### পরবর্তী ধাপ (Later — এখনও নির্মিত হয়নি)
- Content seeding: 114 surah metadata, Al-Fatihah + Al-Baqarah verses, 10+ research notes
- Topic/theme browsing (`/topics`)
- Advanced search filters (school, collection, confidence)
- Verse audio recitation
- Public bookmarks sync (account-based; বর্তমানে শুধু localStorage)
- Bengali transliteration of Arabic

---

## ৫. তথ্য স্থাপত্য ও পেজ ম্যাপ (Information Architecture)

```
Public
├── /                                  Homepage (hero, search, how-it-works, দৃষ্টিভঙ্গি কার্ড)
├── /surah                             114 সূরার তালিকা (client-side filter)
├── /surah/[surah]                     সূরার সব আয়াত (আরবি + বাংলা)
├── /surah/[surah]/ayah/[ayah]         পূর্ণ আয়াত পেজ — 5 tab
│       ├── সুন্নি তাফসীর (sunni)
│       ├── শিয়া তাফসীর (shia)
│       ├── হাদিস (hadith)
│       ├── তুলনা (compare)
│       └── সূত্র (refs)
├── /search                            Debounced live search
├── /about                             পদ্ধতি ও নীতি (methodology, editorial policy)
├── /sources                           যাচাইকৃত উৎসের তালিকা
└── /setup                             এককালীন প্রথম admin তৈরি (শুধু DB খালি থাকলে)

Admin (middleware: /admin/:path* — auth required)
/admin/login, /admin (dashboard)
/admin/verses, /admin/verses/new, /admin/verses/[id]
/admin/tafsirs, /admin/tafsirs/new, /admin/tafsirs/[id]
/admin/hadiths, /admin/hadiths/new, /admin/hadiths/[id]
/admin/research, /admin/research/new, /admin/research/[id]
/admin/references, /admin/references/new
/admin/review                         রিভিউ কিউ
/admin/users (adminOnly)               ব্যবহারকারী ব্যবস্থাপনা
/admin/audit-logs                     সব mutation-এর audit trail
```

Public API (rate-limited, শুধু published content):
`GET /api/surahs`, `/api/surahs/[surah]`, `/api/verses/[surah]/[ayah]`,
`/api/verses/[surah]/[ayah]/tafsir`, `/api/verses/[surah]/[ayah]/research`,
`/api/search?q=`, `/api/hadiths?school=`, `/api/tafsirs?school=`

---

## ৬. কম্পোনেন্ট লাইব্রেরি (Component Map)

**`components/public/`** — পাবলিক UI:
- `PublicHeader.tsx` — sticky header: logo, nav (সূরা/খুঁজুন/পদ্ধতি/সূত্র), ThemeToggle
- `PublicFooter.tsx` — footer + "গবেষক লগইন" (`/admin/login`)
- `SearchBar.tsx` — homepage hero search input
- `SearchClient.tsx` — debounced live search results
- `SurahList.tsx` — client-side surah filter
- `VerseInteractive.tsx` — verse page engine: 5 tabs, copy/share/bookmark/reading-mode
- `ui.tsx` — Geist primitives: SectionLabel, GoldAyahNumber, SchoolChip, ConfidenceBadge, EmptyState, CitationLine, LogoMark
- `api.ts` — same-origin fetch helper (12s abort timeout → empty states, never hangs)
- `types.ts` — public API payload types

**`components/admin/`** — admin UI:
- `AdminNav.tsx` — sidebar/topbar nav (users লিংক শুধু admin role-এর জন্য)
- Forms: `VerseForm`, `TafsirForm`, `HadithForm`, `ResearchForm`, `ReferenceForm`, `UserForm`, `FormField`, `fields.tsx`
- `ReviewActions.tsx` — publish/reject actions; `StatusBadge.tsx` — draft/review/published chips
- `Pagination.tsx`, `SignOutButton.tsx`, `UserRoleSelect.tsx`, `types.ts`, `utils.ts`

**Shared:** `ThemeProvider.tsx`, `ThemeToggle.tsx` (next-themes).

---

## ৭. ডিজাইন সিস্টেম (Design System)

- **Aesthetic:** Vercel/Geist-inspired — clean, minimal, monochrome; hairline borders (`border-neutral-200/800`); tracking-tight headings; tiny uppercase section labels (`SectionLabel`)।
- **Islamic accents (restrained):** deep pine green (`pine-700/600`) শুধু logo mark ও primary accents-এ; **gold** শুধু ayah number badge-এ (`GoldAyahNumber`)।
- **Typography:** Amiri (Arabic, `font-arabic`, RTL), Hind Siliguri (Bengali, `font-bengali` — body default), via `next/font/google`।
- **Dark mode:** next-themes (`ThemeProvider` + `ThemeToggle`), full light/dark।
- **School chips:** `SchoolChip` — sunni/shia/shared লেবেল প্রতিটি তাফসীর/হাদিসে; `ConfidenceBadge` — high/medium/low।

---

## ৮. কনটেন্ট শ্রেণিবিন্যাস (Content Taxonomy)

```
Surah (114) ──< Verse (surahNumber+ayahNumber unique)
                  ├──< Tafsir (school: sunni|shia|shared; status)
                  ├──< Hadith (school: sunni|shia|shared; collection/book/chapter/number)
                  └──< ResearchNote (1 per verse)
                           ├── sunniView { summary, tafsirIds[], hadithIds[] }
                           ├── shiaView  { summary, tafsirIds[], hadithIds[] }
                           ├── comparison { agreements[], differences[], neutralExplanation }
                           ├── references[] (type: tafsir|hadith|book|article|dictionary|manuscript)
                           ├── confidence (high|medium|low)
                           └── status (draft|review|published)
```

Public API শুধু `status: "published"` কনটেন্ট দেয়।

---

## ৯. গবেষণা পদ্ধতি — সংক্ষেপ (Research Methodology Summary)

প্রতিটি আয়াতের জন্য গবেষণা নোটে থাকে: প্রসঙ্গ (context), ভাষাতাত্ত্বিক নোট, ঐতিহাসিক প্রেক্ষাপট, সুন্নি দৃষ্টিভঙ্গি, শিয়া দৃষ্টিভঙ্গি, তুলনা (মিল/পার্থক্য/নিরপেক্ষ ব্যাখ্যা), পূর্ণ সূত্রতালিকা, confidence level। বিস্তারিত: `docs/research-methodology.md`।

## ১০. সূত্র যাচাই নিয়ম (Source Verification Rules)

1. প্রতিটি তাফসীরে: বইয়ের নাম, লেখক, খণ্ড, পৃষ্ঠা বাধ্যতামূলক।
2. প্রতিটি হাদিসে: সংকলন, বই, অধ্যায়, নম্বর, বর্ণনাকারী, grading (যেখানে প্রযোজ্য)।
3. প্রকাশের শর্ত: ≥১ সুন্নি উৎস + ≥১ শিয়া উৎস + ≥২ স্বতন্ত্র রেফারেন্স + হুবহু citation।
4. যাচাই না হলে: `status: draft`, `confidence: low` — প্রকাশ নিষেধ।
5. কোনো রেফারেন্স, পৃষ্ঠা নম্বর বা হাদিস নম্বর **বানানো যাবে না**।
6. Runtime-এ কোনো external Quran/Tafsir/Hadith/AI API ব্যবহার নিষেধ — সব কনটেন্ট নিজস্ব MongoDB-তে।

---

## ১১. SEO কৌশল (SEO Strategy)

- প্রতিটি আয়াত পেজে `generateMetadata`: Bengali + English title/description, **canonical URL**, **OpenGraph article**।
- Surah পেজেও `generateMetadata`।
- Semantic HTML, server-rendered content (all public pages `force-dynamic`, API-driven)।
- `/about` ও `/sources` — methodology ও source transparency, E-E-A-T signal।
- ভবিষ্যৎ: sitemap.xml, JSON-LD (Quran verse schema)।
