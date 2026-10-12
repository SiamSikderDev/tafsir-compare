# UX Research — Tafsir Compare

**ব্যবহারকারী অভিজ্ঞতা গবেষণা ও ডিজাইন ডকুমেন্টেশন**

This document describes UX decisions as actually implemented in the codebase (components, pages, interaction patterns). Personas overlap with `docs/product-research.md` §২ — here the focus is goals, pain points, flows, and the concrete UI that answers them.

---

## ১. পারসোনা, লক্ষ্য ও সমস্যা (Personas, Goals, Pain Points)

| পারসোনা | লক্ষ্য | Pain point → সমাধান |
|---|---|---|
| রাফি (শিক্ষার্থী, মোবাইল পাঠক) | দ্রুত আয়াত + সংক্ষিপ্ত ব্যাখ্যা | "কোনটা সুন্নি কোনটা শিয়া বোঝা যায় না" → প্রতিটি এন্ট্রিতে `SchoolChip` (sunni/shia/shared) |
| মাওলানা করিম (শিক্ষক) | সূত্রসহ ব্যাখ্যা যাচাই | "অনুবাদ আছে, সূত্র নেই" → `CitationLine`: বই, লেখক, খণ্ড, পৃষ্ঠা প্রতিটি তাফসীরে |
| ড. নাসরিন (গবেষক) | নিরপেক্ষ তুলনা | "দুই পক্ষের বক্তব্য এক জায়গায় পাওয়া কঠিন" → Comparison tab (agreements/differences/neutralExplanation) + `ConfidenceBadge` |
| তানভীর (সার্চ ব্যবহারকারী) | বাংলায় সার্চ করে আয়াত খোঁজা | "আরবি না জানলে খুঁজে পাই না" → debounced live search, snippet + school chip + confidence সহ ফলাফল |
| গবেষক টিম (internal) | draft → review → published | "কে কী বদলালো, তার হিসাব" → audit logs, review queue, status badges |

অতিরিক্ত pain point — **আরবি রেন্ডারিং**: ভাঙা ফন্ট/ভুল দিকনির্দেশনা এড়াতে Amiri ফন্ট + `dir="rtl"` + `font-arabic` — সব আরবি ব্লকে বাধ্যতামূলক।

---

## ২. ব্যবহারকারী প্রবাহ (User Flows)

### Flow A — প্রথম ভিজিটে ব্রাউজ
`/` (hero + search + "যেভাবে কাজ করে" + "দুই দৃষ্টিভঙ্গি" কার্ড) → `/surah` (filter) → `/surah/[surah]` (আয়াত তালিকা) → `/surah/[surah]/ayah/[ayah]` (5 tab) → প্রয়োজনে copy/share/bookmark।

### Flow B — গভীর তুলনা (deep compare)
আয়াত পেজে: `sunni` tab পড়া → `shia` tab পড়া → `hadith` tab-এ প্রমাণ দেখা → `compare` tab-এ agreements/differences → `refs` tab-এ পূর্ণ citation। Prev/next ayah navigation দিয়ে পরের আয়াতে যাওয়া।

### Flow C — গবেষকের প্রকাশনা প্রবাহ
`/admin/login` → dashboard (counts + review queue summary) → `/admin/research/new` (ResearchForm) → `draft` → review queue (`/admin/review`) → ReviewActions (publish/reject) → `published`। প্রতিটি ধাপ audit log-এ।

### Flow D — সার্চ
Header SearchBar বা `/search` → 450ms debounce → `/api/search?q=` → ফলাফল (surah/ayah ref, snippet, school chip, source book, confidence chip, link)। `$text` index না থাকলে regex fallback — 500 নয়, graceful result।

---

## ৩. পেজ শ্রেণিবিন্যাস ও নেভিগেশন (Page Hierarchy & Navigation)

**Public header** (`PublicHeader.tsx`, sticky): logo (pine `LogoMark` + "তাফসীর তুলনা") → nav: **সূরা** (`/surah`) · **খুঁজুন** (`/search`) · **পদ্ধতি** (`/about`) · **সূত্র** (`/sources`) → `ThemeToggle`।

**Public footer** (`PublicFooter.tsx`): সেকশন লিংক + **গবেষক লগইন** (`/admin/login`)।

**Admin shell** (`app/admin/layout.tsx`): sticky header (user name + role label + ThemeToggle + SignOutButton) + sidebar nav (`AdminNav.tsx`): ড্যাশবোর্ড · আয়াত · তাফসীর · হাদিস · গবেষণা নোট · রেফারেন্স · রিভিউ কিউ · অডিট লগ · ব্যবহারকারী (শুধু admin)। মোবাইলে topbar variant।

**শ্রেণিবিন্যাস:** `/` → `/surah` → `/surah/[surah]` → `/surah/[surah]/ayah/[ayah]` — প্রতিটি স্তরে breadcrumb-সদৃশ prev/next navigation (surah পেজে prev/next surah; ayah পেজে prev/next ayah)।

---

## ৪. মোবাইল-ফার্স্ট লেআউট পরিকল্পনা

- সব পেজ mobile-first: single column → `sm:`/`lg:` breakpoint-এ multi-column।
- Verse page: আয়াত কার্ড পূর্ণ-প্রস্থ; tab bar horizontally scrollable (`role="tablist"`, `aria-selected`)।
- Admin: sidebar শুধু `lg:`-তে; তার নিচে topbar nav।
- Touch target: tab ও বোতাম ≥44px; copy/share/bookmark icon buttons।
- Surah list: number badge + নাম — এক হাতে স্ক্রলযোগ্য row।

---

## ৫. অ্যাক্সেসিবিলিটি (Accessibility)

- **Contrast:** monochrome neutral palette (neutral-900 on white / neutral-50 on black) — WCAG AA।
- **RTL Arabic:** `dir="rtl"`, Amiri font; বাংলা/ইংরেজি LTR — মিশ্র পেজে দিকনির্দেশনা আলাদা।
- **Font scaling:** relative units; আরবি `text-3xl`+ আয়াত কার্ডে।
- **Keyboard:** tabs `role="tab"`/`tabpanel`, focus-visible styles; skip-link পরিকল্পিত (ভবিষ্যৎ)।
- **Screen reader:** tab-এ `aria-selected`, icon button-এ `aria-label`।

---

## ৬. UI কম্পোনেন্ট ইনভেন্টরি (Implemented)

**Public** (`components/public/`):
`PublicHeader`, `PublicFooter`, `SearchBar`, `SearchClient` (debounced), `SurahList` (filter), `VerseInteractive` (tabs + actions), `ui.tsx` (`SectionLabel`, `GoldAyahNumber`, `SchoolChip`, `ConfidenceBadge`, `EmptyState`, `CitationLine`, `LogoMark`), `api.ts` (fetch helper, 12s timeout), `types.ts`।

**Admin** (`components/admin/`):
`AdminNav`, `StatusBadge`, `Pagination`, `ReviewActions`, `SignOutButton`, `UserRoleSelect`, forms (`VerseForm`, `TafsirForm`, `HadithForm`, `ResearchForm`, `ReferenceForm`, `UserForm`, `FormField`, `fields.tsx`), `types.ts`, `utils.ts` (formatDateTime, truncate, getPage…)।

**Shared:** `ThemeProvider`, `ThemeToggle`।

---

## ৭. ডিজাইন টোকেন (Design Tokens)

**Colors:**
- Base: monochrome neutral — white/black surfaces, `neutral-200/800` hairline borders, `neutral-500/400` secondary text।
- Accent: pine green `pine-700` (light) / `pine-600` (dark) — logo mark ও key accents।
- Gold: ayah number badge (`GoldAyahNumber`) — শুধু সংখ্যায়।
- Chips: `SchoolChip` (sunni/shia/shared), `ConfidenceBadge` (high/medium/low), `StatusBadge` (draft/review/published)।

**Typography:**
- `--font-arabic`: Amiri, "Scheherazade New", serif — `font-arabic` class।
- `--font-bengali`: "Hind Siliguri", "Noto Sans Bengali", sans-serif — body default (`font-bengali`)।
- Headings: tracking-tight, semibold; section labels: tiny uppercase (`SectionLabel`)।

**Spacing:** `max-w-7xl` container, `px-4 sm:px-6 lg:px-8`; cards `rounded-lg border p-6`; generous whitespace — Geist aesthetic।

---

## ৮. ডার্ক মোড পরিকল্পনা (Implemented)

next-themes (`ThemeProvider` + `ThemeToggle`) — class-based dark mode। প্রতিটি surface-এ `dark:` variant: `dark:bg-black`, `dark:border-neutral-800`, `dark:text-neutral-50`। Toggle header-এ (public + admin)। System preference default।

---

## ৯. ইন্টারঅ্যাকশন প্যাটার্ন (Interaction Patterns)

- **Verse tabs:** client state (`useState<TabId>`), default `sunni`; `sunni → shia → hadith → compare → refs`।
- **Copy verse:** `navigator.clipboard` — আরবি + বাংলা একসাথে।
- **Share:** `navigator.share` (Web Share API); না থাকলে clipboard fallback।
- **Bookmark:** localStorage (`BOOKMARK_KEY`) — toggle, login ছাড়া।
- **Reading mode:** distraction-free toggle (VerseInteractive)।
- **Search:** 450ms debounce, abortable fetch; 12s timeout → empty state, hang নয়।
- **Surah filter:** client-side name/number filter, no round-trip।

---

## ১০. Empty / Loading / Error States

- **Empty (বর্তমান বাস্তবতা):** DB খালি থাকায় `/surah` ও আয়াত পেজে বন্ধুসুলভ বাংলা empty state (`EmptyState`) — "কনটেন্ট শীঘ্রই আসছে", error নয়। Verse page: `notFound()` শুধু ভুল surah/ayah নম্বরে।
- **Loading:** tab switch instant (data preloaded); search-এ debounce চলাকালীন subtle indicator।
- **Error:** `api.ts` সব fetch failure-এ `null` দেয় → empty state; কখনো blank crash নয়। Admin form-এ Zod validation error inline (`FormField`)।
- **Auth:** middleware `/admin/:path*` — session ছাড়া `/admin/login`-এ redirect; login page minimal shell।
