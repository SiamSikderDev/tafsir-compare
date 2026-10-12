# Research Methodology — Tafsir Compare

**গবেষণা পদ্ধতি ও সূত্র যাচাই নীতিমালা**

This document defines how Islamic content is researched, attributed, verified, and published on Tafsir Compare. It is binding on every researcher, reviewer, and admin.

---

## ১. প্রতি আয়াতে যা গবেষণা করা হয় (Per-Ayah Research Scope)

প্রতিটি `ResearchNote` (এক আয়াতে একটি) নিচের সব ক্ষেত্র ধারণ করে:

| ক্ষেত্র | বিবরণ |
|---|---|
| `verseId` | সংশ্লিষ্ট আয়াতের রেফারেন্স |
| `title` | গবেষণা নোটের শিরোনাম (বাংলা) |
| `context` | আয়াতের প্রসঙ্গ — কোথায়, কেন নাজিল/আলোচিত |
| `linguisticNotes[]` | ভাষাতাত্ত্বিক নোট — মূল আরবি শব্দের অর্থ, ব্যাকরণগত বৈশিষ্ট্য |
| `historicalContext` | ঐতিহাসিক প্রেক্ষাপট (সাবাবুন নুযুল যেখানে প্রযোজ্য) |
| `sunniView.summary` | সুন্নি ব্যাখ্যার সারসংক্ষেপ + `tafsirIds[]` + `hadithIds[]` |
| `shiaView.summary` | শিয়া ব্যাখ্যার সারসংক্ষেপ + `tafsirIds[]` + `hadithIds[]` |
| `comparison.agreements[]` | দুই মাযহাবের মিলের পয়েন্ট |
| `comparison.differences[]` | পার্থক্যের পয়েন্ট — নিরপেক্ষ ভাষায় |
| `comparison.neutralExplanation` | নিরপেক্ষ ব্যাখ্যা — পক্ষ না নিয়ে |
| `references[]` | পূর্ণ সূত্রতালিকা (নিচে §৫) |
| `confidence` | `high` / `medium` / `low` (§৬) |
| `status` | `draft` → `review` → `published` (§৭) |

স্তর আলাদা রাখা বাধ্যতামূলক: **কুরআনের মূল পাঠ**, **অনুবাদ**, **ভাষাতাত্ত্বিক নোট**, **ঐতিহাসিক প্রেক্ষাপট**, **তাফসীর মতামত**, **হাদিস প্রমাণ** — এগুলো কখনো মেশানো যাবে না।

---

## ২. উৎস নির্বাচনের মানদণ্ড (Source Selection Criteria)

উৎস হতে হবে:
1. **স্বীকৃত ও প্রামাণ্য** — সংশ্লিষ্ট মাযহাবের আলেমদের কাছে গ্রহণযোগ্য গ্রন্থ।
2. **নির্দিষ্ট সংস্করণ** — বইয়ের নাম, লেখক, খণ্ড, পৃষ্ঠা, প্রকাশক, প্রকাশনা সাল উল্লেখযোগ্য।
3. **যাচাইযোগ্য** — অন্য গবেষক একই citation দিয়ে মূল বইয়ে খুঁজে পাবেন।
4. **প্রাসঙ্গিক** — ঠিক এই আয়াতের ব্যাখ্যায় বইটি যা বলেছে, তাই উদ্ধৃত হবে; সাধারণ মন্তব্য নয়।

### সুন্নি তাফসীর উৎস
- Tafsir Ibn Kathir (তাফসীর ইবনে কাসীর)
- Tafsir al-Tabari (তাফসীর আত-তাবারী)
- Tafsir al-Qurtubi (তাফসীর আল-কুরতুবী)
- Tafsir al-Jalalayn (তাফসীর আল-জালালাইন)
- Tafsir al-Sa'di (তাফসীর আস-সা'দী)
- Tafsir al-Baghawi (তাফসীর আল-বাগাভী)
- Tafsir al-Mawardi (তাফসীর আল-মাওয়ার্দী)

### শিয়া তাফসীর উৎস
- Tafsir al-Mizan — Allamah Tabatabai (তাফসীর আল-মীযান)
- Tafsir Nur al-Thaqalayn (তাফসীর নূর আস-সাকালাইন)
- Tafsir al-Tibyan — Shaykh al-Tusi (তাফসীর আত-তিবইয়ান)
- Majma' al-Bayan — Tabrisi (মাজমা' আল-বায়ান)
- Tafsir al-Qummi (তাফসীর আল-কুম্মী)
- Tafsir al-Ayyashi (তাফসীর আল-আইয়াশী)

### সুন্নি হাদিস সংকলন
- Sahih al-Bukhari, Sahih Muslim
- Sunan Abu Dawud, Jami' at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah
- Musnad Ahmad

### শিয়া হাদিস সংকলন
- Al-Kafi
- Man La Yahduruhu al-Faqih
- Tahdhib al-Ahkam, Al-Istibsar
- Bihar al-Anwar, Wasa'il al-Shia

`/sources` পেজে এই তালিকা জনসমক্ষে প্রকাশিত — কিন্তু কোনো এন্ট্রি সেখানে "যাচাইকৃত" হিসেবে দেখানো হয় না যতক্ষণ না তা ডাটাবেজে যাচাই হয়ে আসে।

---

## ৩. তাফসীর মতামতের attribution (How Tafsir Opinions Are Attributed)

প্রতিটি `Tafsir` ডকুমেন্টে বাধ্যতামূলক:
- `school`: `sunni` | `shia` | `shared`
- `bookTitle` + `author` (required)
- `volume`, `page` — যতটা নির্দিষ্ট করা যায়
- `summary` — ব্যাখ্যার সারসংক্ষেপ (বাংলা)
- `fullText` — বিস্তারিত ব্যাখ্যা
- `keyPoints[]` — মূল পয়েন্টের তালিকা
- `sourceUrl`, `publisher`, `publicationYear` — যেখানে প্রযোজ্য
- `status` — শুধু `published` এন্ট্রি পাবলিক API-তে দেখায়

নিয়ম: মতামত সবসময় **বই ও লেখকের নামে** উপস্থাপন করতে হবে — যেমন "ইবনে কাসীর (রহ.) তাঁর তাফসীরে লিখেছেন…" — কখনো "ইসলাম বলে…" ধরনের সর্বজনীন দাবি হিসেবে নয়।

---

## ৪. হাদিস যাচাই (How Hadiths Are Verified)

প্রতিটি `Hadith` ডকুমেন্টে বাধ্যতামূলক:
- `collectionName` (required, indexed) — যেমন "Sahih al-Bukhari", "Al-Kafi"
- `school`: `sunni` | `shia` | `shared`
- `book`, `chapter`, `hadithNumber` — যতটা নির্দিষ্ট করা যায়
- `narrator` — বর্ণনাকারী/সনদ তথ্য
- `arabicText`, `bengaliTranslation`, `englishTranslation`
- `grading` + `gradingSource` — যেখানে প্রযোজ্য (যেমন সহীহ/হাসান/দa'ইফ এবং কোন মুহাদ্দিসের তাহকীক)
- `notes` — প্রাসঙ্গিক মন্তব্য

যাচাই প্রক্রিয়া:
1. সংকলন → বই → অধ্যায় → নম্বর — চার স্তরেই মিলতে হবে।
2. Grading ছাড়া হাদিস "অযাচাইকৃত" হিসেবে চিহ্নিত থাকবে; grading থাকলে উৎসসহ।
3. সনদ/বর্ণনাকারী তথ্য বাদ দিয়ে হাদিস প্রকাশ করা যাবে না।
4. নম্বর, বই বা অধ্যায় **অনুমান করে লেখা নিষেধ** — না জানলে ক্ষেত্র খালি রাখুন।

---

## ৫. পার্থক্য উপস্থাপন — নিরপেক্ষতা (Presenting Differences Neutrally)

- `comparison.differences[]`-এ প্রতিটি পার্থক্য **দুই পক্ষের ভাষায়** লিখুন, নিজের রায় ছাড়া।
- `comparison.neutralExplanation` — কেন পার্থক্য (উসূল, রেওয়ায়েত, ভাষাতাত্ত্বিক পাঠভেদ) — পক্ষ না নিয়ে ব্যাখ্যা।
- নিষিদ্ধ ভাষা: কোনো মাযহাব, আলেম বা সম্প্রদায়ের প্রতি অবমাননাকর, তুচ্ছ-তাচ্ছিল্যকারী বা উসকানিমূলক শব্দ।
- `agreements[]` আগে লিখুন — মিলের জায়গা স্পষ্ট করা নিরপেক্ষতার অংশ।

---

## ৬. Confidence Level

| Level | অর্থ | শর্ত |
|---|---|---|
| `high` | ব্যাপকভাবে প্রমাণিত, উভয় মাযহাবের একাধিক স্বতন্ত্র সূত্রে সমর্থিত | §৭-এর প্রকাশ শর্ত + উভয় পক্ষে ≥২ সূত্র |
| `medium` | যাচাইকৃত কিন্তু সীমিত সূত্র, বা পক্ষভেদে মতভেদ আছে | প্রকাশ শর্ত পূরণ, কিন্তু কোনো দিকে সূত্র কম |
| `low` | অসম্পূর্ণ/অযাচাইকৃত | স্বয়ংক্রিয়ভাবে `draft`; `reviewRequired` |

---

## ৭. প্রকাশনা গেট — draft → review → published

API-তে কঠোরভাবে প্রয়োগ হয় (`PATCH /api/admin/research/[id]/status`):
- অনুমোদিত পরিবর্তন: `draft → review`, `review → published`, `review → draft`।

**প্রকাশযোগ্য (`published`) হতে হলে:**
- ≥১ সুন্নি উৎস + ≥১ শিয়া উৎস
- ≥২ স্বতন্ত্র রেফারেন্স
- প্রতিটি দাবির হুবহু citation (বই, লেখক, খণ্ড, পৃষ্ঠা)
- অসমর্থিত ধর্মতাত্ত্বিক দাবি নেই
- সুন্নি/শিয়া ভিউ স্পষ্ট লেবেলসহ আলাদা
- নিরপেক্ষ comparison section
- সম্মানজনক বাংলা ব্যাখ্যা; আরবি উদ্ধৃতি হুবহু

**যা draft-ই থাকবে:**
- কোনো রেফারেন্স যাচাই করা না গেলে → `status: draft`, `confidence: low`
- এক পক্ষের উৎস ছাড়া তুলনামূলক দাবি
- অনুমান-নির্ভর পৃষ্ঠা/হাদিস নম্বর

---

## ৮. No-External-API নিয়ম (বাধ্যতামূলক)

- Runtime-এ কোনো external Quran API, Tafsir API, Hadith API বা AI-content API কল করা **নিষেধ**।
- প্রকাশিত সব কনটেন্ট নিজস্ব MongoDB-তে সংরক্ষিত থাকবে; পাবলিক পেজ শুধু নিজস্ব `/api/*` থেকে পড়ে।
- গবেষণা সহায়তার জন্য ওয়েব/বই ব্যবহার করা যায়, কিন্তু **চূড়ান্ত প্রকাশিত উপাদান** সবসময় মানুষের যাচাই করা ডাটাবেজ এন্ট্রি।

---

## ৯. No-Fabrication নিয়ম (বাধ্যতামূলক)

- রেফারেন্স, পৃষ্ঠা নম্বর, হাদিস নম্বর, পণ্ডিতের মতামত — **কিছুই বানানো যাবে না**।
- সন্দেহ হলে ক্ষেত্র খালি রাখুন বা `draft`-এ রাখুন; ভুল তথ্যের চেয়ে অসম্পূর্ণ তথ্য ভালো।
- প্রতিটি create/update/delete/status-change `auditLogs`-এ রেকর্ড হয় — কে, কখন, কী বদলালো, তার trail থাকে।
